import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import MatchResults from "@/components/MatchResults";
import { SwapRequest } from "@/types/swap";
import { normalizeSection } from "@/utils/sectionUtils";

const SwapRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [requestType, setRequestType] = useState("swap");
  const [semester, setSemester] = useState("regular");
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Form state
  const [courseName, setCourseName] = useState("");
  const [customCourseName, setCustomCourseName] = useState("");
  const [currentSection, setCurrentSection] = useState("");
  const [customCurrentSection, setCustomCurrentSection] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [customTargetSection, setCustomTargetSection] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [activeRequests, setActiveRequests] = useState<SwapRequest[]>([]);
  const [days, setDays] = useState("mw");
  const [preferredTime, setPreferredTime] = useState("");
  const [reason, setReason] = useState("");
  const [summerFormat, setSummerFormat] = useState("everyday");
  
  // Sample data - in a real app this would come from backend
  const [courses, setCourses] = useState([
    "Machine Learning",
    "Advanced Algorithms",
    "Data Structures",
    "Artificial Intelligence",
    "Web Development",
    "Database Systems",
    "Computer Networks",
  ]);
  
  // Sample sections
  const sections = {
    "Machine Learning": [
      { id: "ML-1", name: "Section 1", schedule: "Monday/Wednesday 10:00 AM" },
      { id: "ML-2", name: "Section 2", schedule: "Sunday/Tuesday/Thursday 2:00 PM" },
      { id: "ML-3", name: "Section 3", schedule: "Monday/Wednesday 3:00 PM" },
    ],
    "Advanced Algorithms": [
      { id: "AA-1", name: "Section 1", schedule: "Monday/Wednesday 9:00 AM" },
      { id: "AA-2", name: "Section 2", schedule: "Sunday/Tuesday/Thursday 11:00 AM" },
    ],
  };

  // Summer semester section options
  const summerSections = {
    everyday: "Every day (Sun-Thu)",
    firstTwoDays: "First two days (Sun-Mon)",
    lastThreeDays: "Last three days (Tue-Thu)"
  };

  useEffect(() => {
    if (user) {
      fetchUserRequests();
      
      // Check for telegram username in user metadata
      const metadata = user.user_metadata;
      if (metadata && metadata.telegram_username) {
        setTelegramUsername(metadata.telegram_username);
      }
    }
  }, [user]);

  const fetchUserRequests = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setActiveRequests(data as SwapRequest[] || []);
    } catch (error: any) {
      console.error("Error fetching user requests:", error);
      toast.error("Failed to load your requests");
    }
  };

  const sendNotification = async (email: string, type: string, details: any) => {
    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          type,
          email,
          name: user?.user_metadata?.full_name || "User",
          details
        }
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a request");
      navigate("/auth");
      return;
    }
    
    setIsLoading(true);
    
    // Get final values (using custom input if provided)
    const finalCourseName = customCourseName || courseName;
    const finalCurrentSection = requestType === "swap" 
      ? normalizeSection(customCurrentSection || currentSection)
      : null;
    const finalTargetSection = normalizeSection(customTargetSection || targetSection);
    
    // Validate required fields
    if (!finalCourseName) {
      toast.error("Please select or enter a course name");
      setIsLoading(false);
      return;
    }
    
    if (requestType === "swap" && !finalCurrentSection) {
      toast.error("Please select or enter your current section");
      setIsLoading(false);
      return;
    }
    
    if (!finalTargetSection) {
      toast.error("Please select or enter the target section");
      setIsLoading(false);
      return;
    }
    
    if (!telegramUsername) {
      toast.error("Please enter your Telegram username for contact");
      setIsLoading(false);
      return;
    }
    
    try {
      // Create normalized versions of the sections for matching
      const normalizedCurrentSection = requestType === "swap" 
        ? finalCurrentSection ? finalCurrentSection.toLowerCase().trim() : null
        : null;
      const normalizedTargetSection = finalTargetSection 
        ? finalTargetSection.toLowerCase().trim() 
        : null;

      const requestData: SwapRequest = {
        id: editingRequestId || uuidv4(),
        user_id: user.id,
        anonymous: isAnonymous,
        petition: requestType === "petition",
        telegram_username: telegramUsername,
        desired_course: finalCourseName,
        current_section: finalCurrentSection,
        desired_section: finalTargetSection,
        normalized_current_section: normalizedCurrentSection,
        normalized_desired_section: normalizedTargetSection,
        university_id: user.user_metadata?.university_id,
        full_name: isAnonymous ? null : user.user_metadata?.full_name,
        email: user.email,
        reason: requestType === "petition" ? reason : null,
        summer_format: semester === "summer" ? summerFormat : null,
        days_pattern: semester === "regular" ? days : null,
        preferred_time: requestType === "petition" ? preferredTime : null
      };

      // If editing, update existing request
      if (editingRequestId) {
        const { error } = await supabase
          .from('swap_requests')
          .update(requestData)
          .eq('id', editingRequestId);
          
        if (error) throw error;
        
        toast.success("Request updated successfully!");
      } 
      // Otherwise insert new request
      else {
        console.log("Submitting request data:", requestData);
        const { error } = await supabase
          .from('swap_requests')
          .insert(requestData);
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        toast.success("Request submitted successfully!");
        
        // Send email notification
        if (user.email) {
          await sendNotification(user.email, "request_submitted", {
            course: finalCourseName,
            currentSection: finalCurrentSection,
            targetSection: finalTargetSection
          });
        }
        
        // Add the course/section to our options if they're new
        if (customCourseName && !courses.includes(customCourseName)) {
          setCourses([...courses, customCourseName]);
        }
      }
      
      // Reset form
      resetForm();
      
      // Refresh user's requests
      fetchUserRequests();
      
      // Trigger refresh of matches
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(error.message || "Error submitting request");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingRequestId(null);
    setCourseName("");
    setCustomCourseName("");
    setCurrentSection("");
    setCustomCurrentSection("");
    setTargetSection("");
    setCustomTargetSection("");
    setIsAnonymous(false);
    setRequestType("swap");
    setSemester("regular");
    setDays("mw");
    setPreferredTime("");
    setReason("");
    setSummerFormat("everyday");
  };

  const handleSemesterChange = (value: string) => {
    setSemester(value);
  };
  
  const handleDeleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(`Request canceled successfully!`);
      fetchUserRequests();
      
      // Also refresh matches when a request is deleted
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error deleting request:", error);
      toast.error(error.message || "Error canceling request");
    }
  };
  
  const handleEditRequest = async (id: string) => {
    try {
      const requestToEdit = activeRequests.find(req => req.id === id);
      if (!requestToEdit) {
        toast.error("Request not found");
        return;
      }
      
      setEditingRequestId(id);
      
      // Set form values based on the request
      setRequestType(requestToEdit.petition ? "petition" : "swap");
      setCourseName(requestToEdit.desired_course || "");
      setCurrentSection(requestToEdit.current_section || "");
      setTargetSection(requestToEdit.desired_section || "");
      setIsAnonymous(requestToEdit.anonymous || false);
      setTelegramUsername(requestToEdit.telegram_username || "");
      setSemester(requestToEdit.summer_format ? "summer" : "regular");
      
      if (requestToEdit.summer_format) {
        setSummerFormat(requestToEdit.summer_format);
      }
      
      if (requestToEdit.days_pattern) {
        setDays(requestToEdit.days_pattern);
      }
      
      if (requestToEdit.petition) {
        setPreferredTime(requestToEdit.preferred_time || "");
        setReason(requestToEdit.reason || "");
      }
      
      toast(`Editing request`, {
        description: "You can now modify your request and resubmit it."
      });
      
      // Scroll to form
      document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" });
    } catch (error: any) {
      console.error("Error preparing edit:", error);
      toast.error("Error preparing to edit request");
    }
  };

  const renderSectionOptions = () => {
    if (semester === "summer") {
      return (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-black">Days Format</Label>
          <RadioGroup 
            defaultValue={summerFormat} 
            value={summerFormat}
            onValueChange={setSummerFormat}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="everyday" id="everyday" />
              <Label htmlFor="everyday" className="cursor-pointer text-black">Every day (Sun-Thu)</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="firstTwoDays" id="firstTwoDays" />
              <Label htmlFor="firstTwoDays" className="cursor-pointer text-black">First two days (Sun-Mon)</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="lastThreeDays" id="lastThreeDays" />
              <Label htmlFor="lastThreeDays" className="cursor-pointer text-black">Last three days (Tue-Thu)</Label>
            </div>
          </RadioGroup>
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <Label className="text-black">Days Pattern</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="mw" 
                name="days" 
                value="mw"
                checked={days === "mw"}
                onChange={() => setDays("mw")}
                className="text-campus-purple focus:ring-campus-purple" 
              />
              <Label htmlFor="mw" className="font-normal text-black">Monday/Wednesday</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="stt" 
                name="days" 
                value="stt"
                checked={days === "stt"}
                onChange={() => setDays("stt")}
                className="text-campus-purple focus:ring-campus-purple" 
              />
              <Label htmlFor="stt" className="font-normal text-black">Sunday/Tuesday/Thursday</Label>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-campus-darkPurple">Class Swap Requests</h1>
        <p className="text-gray-600">
          Submit and manage your class section swap requests
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Request Form */}
        <div id="request-form">
          <Card className="border-campus-purple/20">
            <CardHeader>
              <CardTitle className="text-campus-darkPurple">
                {editingRequestId ? "Edit Request" : "New Request"}
              </CardTitle>
              <CardDescription className="text-gray-700">
                {editingRequestId 
                  ? "Modify your existing class section swap or petition request" 
                  : "Create a new class section swap or petition request"
                }
              </CardDescription>
              <Tabs defaultValue={requestType} className="mt-4" onValueChange={(value) => setRequestType(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="swap">Swap Request</TabsTrigger>
                  <TabsTrigger value="petition">Section Petition</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <form onSubmit={handleSwapSubmit}>
              <CardContent>
                <div className="space-y-6">
                  {/* Semester Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="semester" className="text-black">Semester</Label>
                    <Select defaultValue={semester} value={semester} onValueChange={handleSemesterChange}>
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular Semester</SelectItem>
                        <SelectItem value="summer">Summer Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Course Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-black">Course</Label>
                    <Select value={courseName} onValueChange={setCourseName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">
                          + Add New Course
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {courseName === "other" && (
                      <div className="mt-2">
                        <Label htmlFor="custom-course" className="text-black">Enter Course Name</Label>
                        <Input 
                          id="custom-course" 
                          value={customCourseName}
                          onChange={(e) => setCustomCourseName(e.target.value)}
                          placeholder="Enter course name"
                          className="mt-1" 
                        />
                      </div>
                    )}
                  </div>

                  {requestType === "swap" ? (
                    <>
                      {/* Current Section */}
                      <div className="space-y-2">
                        <Label htmlFor="current-section" className="text-black">Your Current Section</Label>
                        <Select value={currentSection} onValueChange={setCurrentSection}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current section" />
                          </SelectTrigger>
                          <SelectContent>
                            {courseName && sections[courseName as keyof typeof sections]?.map((section) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name} ({section.schedule})
                              </SelectItem>
                            ))}
                            <SelectItem value="other">
                              + Add New Section
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {currentSection === "other" && (
                          <div className="mt-2">
                            <Label htmlFor="custom-current-section" className="text-black">Enter Current Section</Label>
                            <Input 
                              id="custom-current-section" 
                              value={customCurrentSection}
                              onChange={(e) => setCustomCurrentSection(e.target.value)}
                              placeholder="e.g., Section 3 (Mon/Wed 2:00 PM)"
                              className="mt-1" 
                            />
                          </div>
                        )}
                      </div>

                      {/* Desired Section */}
                      <div className="space-y-2">
                        <Label htmlFor="target-section" className="text-black">Section You Want</Label>
                        <Select value={targetSection} onValueChange={setTargetSection}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your desired section" />
                          </SelectTrigger>
                          <SelectContent>
                            {courseName && sections[courseName as keyof typeof sections]?.map((section) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name} ({section.schedule})
                              </SelectItem>
                            ))}
                            <SelectItem value="other">
                              + Add New Section
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {targetSection === "other" && (
                          <div className="mt-2">
                            <Label htmlFor="custom-target-section" className="text-black">Enter Desired Section</Label>
                            <Input 
                              id="custom-target-section" 
                              value={customTargetSection}
                              onChange={(e) => setCustomTargetSection(e.target.value)}
                              placeholder="e.g., Section 2 (Sun/Tue/Thu 11:00 AM)"
                              className="mt-1" 
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* New Section Petition */}
                      <div className="space-y-4">
                        {renderSectionOptions()}

                        <div className="space-y-2">
                          <Label htmlFor="time" className="text-black">Preferred Time</Label>
                          <Select value={preferredTime} onValueChange={setPreferredTime}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="8am">8:00 AM</SelectItem>
                              <SelectItem value="9am">9:00 AM</SelectItem>
                              <SelectItem value="10am">10:00 AM</SelectItem>
                              <SelectItem value="11am">11:00 AM</SelectItem>
                              <SelectItem value="12pm">12:00 PM</SelectItem>
                              <SelectItem value="1pm">1:00 PM</SelectItem>
                              <SelectItem value="2pm">2:00 PM</SelectItem>
                              <SelectItem value="3pm">3:00 PM</SelectItem>
                              <SelectItem value="4pm">4:00 PM</SelectItem>
                              <SelectItem value="5pm">5:00 PM</SelectItem>
                              <SelectItem value="other">Other (specify in notes)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reason" className="text-black">Reason for Petition</Label>
                          <textarea 
                            id="reason" 
                            placeholder="Why do you need this section?" 
                            className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Explaining your reason may help gather support for your petition
                          </p>
                        </div>

                        {/* Target Section for Petition */}
                        <div className="space-y-2">
                          <Label htmlFor="petition-section" className="text-black">Desired Section</Label>
                          <Input 
                            id="petition-section" 
                            placeholder="Describe the section you want"
                            value={customTargetSection}
                            onChange={(e) => setCustomTargetSection(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Contact Method */}
                  <div className="space-y-2">
                    <Label htmlFor="telegram" className="text-black">Your Telegram Username</Label>
                    <Input 
                      id="telegram" 
                      placeholder="@username" 
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used to connect you with matching students
                    </p>
                  </div>

                  {/* Anonymity Option */}
                  <div className="flex items-center space-x-4 pt-2">
                    <Switch
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <div>
                      <Label htmlFor="anonymous" className="font-medium text-black">
                        Submit Anonymously
                      </Label>
                      <p className="text-sm text-gray-500">
                        Your name won't be visible to other students
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {editingRequestId && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setEditingRequestId(null)}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className={`${editingRequestId ? '' : 'ml-auto'} bg-campus-purple hover:bg-campus-darkPurple text-white`}
                >
                  {isLoading 
                    ? editingRequestId 
                      ? "Saving Changes..." 
                      : requestType === "swap" 
                        ? "Submitting Request..." 
                        : "Creating Petition..." 
                    : editingRequestId
                      ? "Save Changes"
                      : requestType === "swap" 
                        ? "Submit Swap Request" 
                        : "Create Petition"
                  }
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Match Results - pass the refresh trigger prop */}
        <div>
          <MatchResults refreshTrigger={refreshTrigger} />
        </div>

        {/* Active Requests */}
        <div>
          <Card className="border-campus-purple/20">
            <CardHeader>
              <CardTitle className="text-campus-darkPurple">Your Active Requests</CardTitle>
              <CardDescription className="text-gray-700">
                View and manage your current swap requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeRequests.length > 0 ? (
                  activeRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-black">
                          {request.desired_course || "Unnamed Course"}
                        </h3>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {request.petition ? "Petition" : "Swap Request"}
                        </span>
                      </div>
                      {!request.petition && request.current_section && (
                        <p className="text-sm mb-1 text-black">
                          <span className="text-gray-500">From: </span>
                          {request.current_section}
                        </p>
                      )}
                      <p className="text-sm mb-2 text-black">
                        <span className="text-gray-500">To: </span>
                        {request.desired_section || "Any available section"}
                      </p>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                        <span>Created: {new Date(request.created_at || "").toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditRequest(request.id)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No active requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SwapRequests;
