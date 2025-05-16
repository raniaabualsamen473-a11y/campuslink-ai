
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { SwapRequest } from "@/types/swap";
import { normalizeSection } from "@/utils/sectionUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface SwapRequestFormProps {
  editingRequestId: string | null;
  user: any;
  onRequestSubmitted: () => void;
  onCancelEdit: () => void;
}

// Define possible start times based on day pattern
const START_TIMES = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
  "17:00", "17:30"
];

export const SwapRequestForm = ({ 
  editingRequestId,
  user,
  onRequestSubmitted,
  onCancelEdit 
}: SwapRequestFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [requestType, setRequestType] = useState("swap");
  const [semester, setSemester] = useState("regular");
  
  // Form state
  const [courseName, setCourseName] = useState("");
  const [customCourseName, setCustomCourseName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [reason, setReason] = useState("");
  
  // Structured section data
  const [currentSectionNumber, setCurrentSectionNumber] = useState<string>("");
  const [currentDaysPattern, setCurrentDaysPattern] = useState("stt");
  const [currentStartTime, setCurrentStartTime] = useState("");
  
  const [desiredSectionNumber, setDesiredSectionNumber] = useState<string>("");
  const [desiredDaysPattern, setDesiredDaysPattern] = useState("stt");
  const [desiredStartTime, setDesiredStartTime] = useState("");
  
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

  useEffect(() => {
    // Check for telegram username in user metadata
    if (user) {
      const metadata = user.user_metadata;
      if (metadata && metadata.telegram_username) {
        setTelegramUsername(metadata.telegram_username);
      }
    }
    
    // Reset field values when semester or request type changes
    setCurrentDaysPattern(semester === "regular" ? "stt" : "everyday");
    setDesiredDaysPattern(semester === "regular" ? "stt" : "everyday");
    setCurrentStartTime("");
    setDesiredStartTime("");
  }, [user, semester, requestType]);

  // Load existing request data if editing
  useEffect(() => {
    if (editingRequestId) {
      loadRequestData(editingRequestId);
    }
  }, [editingRequestId]);

  const loadRequestData = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setCourseName(data.desired_course || "");
        setRequestType(data.petition ? "petition" : "swap");
        setIsAnonymous(data.anonymous || false);
        setTelegramUsername(data.telegram_username || "");
        setSemester(data.summer_format ? "summer" : "regular");
        setSummerFormat(data.summer_format || "everyday");
        setReason(data.reason || "");
        
        // Set structured section data
        if (data.current_section_number) {
          setCurrentSectionNumber(data.current_section_number.toString());
        }
        if (data.current_days_pattern) {
          setCurrentDaysPattern(data.current_days_pattern);
        }
        if (data.current_start_time) {
          setCurrentStartTime(data.current_start_time);
        }
        
        if (data.desired_section_number) {
          setDesiredSectionNumber(data.desired_section_number.toString());
        }
        if (data.desired_days_pattern) {
          setDesiredDaysPattern(data.desired_days_pattern);
        }
        if (data.desired_start_time) {
          setDesiredStartTime(data.desired_start_time);
        }
      }
    } catch (error) {
      console.error("Error loading swap request:", error);
      toast.error("Failed to load request data");
    }
  };

  // Check if a duplicate request already exists
  const checkForDuplicate = async (
    userId: string, 
    courseName: string, 
    currentSectionData: {number: number, pattern: string, time: string} | null, 
    desiredSectionData: {number: number, pattern: string, time: string} | null
  ): Promise<boolean> => {
    try {
      // Query for existing requests with the same course and sections
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('desired_course', courseName);
      
      if (error) throw error;
      
      // For swap requests, check both sections match
      if (currentSectionData) {
        const duplicateSwap = data?.some(req => 
          req.current_section_number === currentSectionData.number && 
          req.current_days_pattern === currentSectionData.pattern &&
          req.current_start_time === currentSectionData.time &&
          req.desired_section_number === desiredSectionData?.number &&
          req.desired_days_pattern === desiredSectionData?.pattern &&
          req.desired_start_time === desiredSectionData?.time
        );
        
        if (duplicateSwap) return true;
      } else {
        // For petitions, just check the desired section
        const duplicatePetition = data?.some(req => 
          req.petition && 
          req.desired_section_number === desiredSectionData?.number &&
          req.desired_days_pattern === desiredSectionData?.pattern &&
          req.desired_start_time === desiredSectionData?.time
        );
        
        if (duplicatePetition) return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking for duplicate requests:", error);
      return false; // Allow submission if check fails
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
    
    // Get final values
    const finalCourseName = customCourseName || courseName;
    
    // Validate required fields
    if (!finalCourseName) {
      toast.error("Please select or enter a course name");
      setIsLoading(false);
      return;
    }
    
    // Validate section data
    if (requestType === "swap") {
      if (!currentSectionNumber || !currentStartTime) {
        toast.error("Please complete all current section fields");
        setIsLoading(false);
        return;
      }
    }
    
    if (!desiredSectionNumber || !desiredStartTime) {
      toast.error("Please complete all desired section fields");
      setIsLoading(false);
      return;
    }
    
    if (!telegramUsername) {
      toast.error("Please enter your Telegram username for contact");
      setIsLoading(false);
      return;
    }
    
    try {
      // Create string representation of sections for backwards compatibility
      const currentSectionString = requestType === "swap" 
        ? `Section ${currentSectionNumber} (${formatDaysPattern(currentDaysPattern, semester)} ${formatTime(currentStartTime)})`
        : null;
        
      const desiredSectionString = `Section ${desiredSectionNumber} (${formatDaysPattern(desiredDaysPattern, semester)} ${formatTime(desiredStartTime)})`;
      
      // Create structured section data for checking duplicates
      const currentSectionData = requestType === "swap" 
        ? {
            number: parseInt(currentSectionNumber), 
            pattern: currentDaysPattern, 
            time: currentStartTime
          }
        : null;
        
      const desiredSectionData = {
        number: parseInt(desiredSectionNumber),
        pattern: desiredDaysPattern,
        time: desiredStartTime
      };

      // Check for duplicate requests (only if not editing)
      if (!editingRequestId) {
        const isDuplicate = await checkForDuplicate(
          user.id, 
          finalCourseName, 
          currentSectionData, 
          desiredSectionData
        );
        
        if (isDuplicate) {
          toast.error("You've already submitted this exact request", {
            description: "Please edit your existing request instead of creating a duplicate"
          });
          setIsLoading(false);
          return;
        }
      }

      const requestData: SwapRequest = {
        id: editingRequestId || uuidv4(),
        user_id: user.id,
        anonymous: isAnonymous,
        petition: requestType === "petition",
        telegram_username: telegramUsername,
        desired_course: finalCourseName,
        current_section: currentSectionString,
        desired_section: desiredSectionString,
        normalized_current_section: currentSectionString ? normalizeSection(currentSectionString) : null,
        normalized_desired_section: normalizeSection(desiredSectionString),
        university_id: user.user_metadata?.university_id,
        full_name: isAnonymous ? null : user.user_metadata?.full_name,
        email: user.email,
        
        // Structured section data
        current_section_number: currentSectionData?.number || null,
        current_days_pattern: currentSectionData?.pattern || null,
        current_start_time: currentSectionData?.time || null,
        
        desired_section_number: desiredSectionData.number,
        desired_days_pattern: desiredSectionData.pattern,
        desired_start_time: desiredSectionData.time,
        
        reason: requestType === "petition" ? reason : null,
        summer_format: semester === "summer" ? summerFormat : null,
        days_pattern: semester === "regular" ? (requestType === "petition" ? desiredDaysPattern : null) : null,
        preferred_time: requestType === "petition" ? desiredStartTime : null
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
            currentSection: currentSectionString,
            targetSection: desiredSectionString
          });
        }
        
        // Add the course to our options if it's new
        if (customCourseName && !courses.includes(customCourseName)) {
          setCourses([...courses, customCourseName]);
        }
      }
      
      // Reset form
      resetForm();
      
      // Notify parent component to refresh data
      onRequestSubmitted();
      
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(error.message || "Error submitting request");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format days pattern for display
  const formatDaysPattern = (pattern: string, semesterType: string): string => {
    if (semesterType === "regular") {
      switch (pattern) {
        case "mw": return "Mon/Wed";
        case "stt": return "Sun/Tue/Thu";
        default: return pattern;
      }
    } else {
      switch (pattern) {
        case "everyday": return "Every day";
        case "sunmon": return "Sun & Mon";
        case "tuethusat": return "Tue/Wed/Thu";
        default: return pattern;
      }
    }
  };
  
  // Format time for display
  const formatTime = (time: string): string => {
    if (!time) return "";
    
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      
      return `${displayHour}:${minutes} ${period}`;
    } catch (e) {
      return time;
    }
  };

  const resetForm = () => {
    if (editingRequestId) {
      onCancelEdit();
    }
    
    setCourseName("");
    setCustomCourseName("");
    setIsAnonymous(false);
    setRequestType("swap");
    setSemester("regular");
    setReason("");
    setSummerFormat("everyday");
    
    // Reset structured section data
    setCurrentSectionNumber("");
    setCurrentDaysPattern("stt");
    setCurrentStartTime("");
    setDesiredSectionNumber("");
    setDesiredDaysPattern("stt");
    setDesiredStartTime("");
  };

  const handleSemesterChange = (value: string) => {
    setSemester(value);
    
    // Reset days pattern based on semester type
    if (value === "regular") {
      setCurrentDaysPattern("stt");
      setDesiredDaysPattern("stt");
    } else {
      setCurrentDaysPattern("everyday");
      setDesiredDaysPattern("everyday");
    }
    
    // Reset times since available options may change
    setCurrentStartTime("");
    setDesiredStartTime("");
  };

  const renderDayPatternOptions = (field: string, value: string, onChange: (value: string) => void) => {
    if (semester === "summer") {
      return (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-black">Days Format</Label>
          <RadioGroup 
            value={value}
            onValueChange={onChange}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="everyday" id={`${field}-everyday`} />
              <Label htmlFor={`${field}-everyday`} className="cursor-pointer text-black">Every day (Sun-Thu)</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="sunmon" id={`${field}-sunmon`} />
              <Label htmlFor={`${field}-sunmon`} className="cursor-pointer text-black">Sun & Mon</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="tuethusat" id={`${field}-tuethusat`} />
              <Label htmlFor={`${field}-tuethusat`} className="cursor-pointer text-black">Tue/Wed/Thu</Label>
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
                id={`${field}-mw`}
                name={`${field}-days`} 
                value="mw"
                checked={value === "mw"}
                onChange={() => onChange("mw")}
                className="text-campus-purple focus:ring-campus-purple" 
              />
              <Label htmlFor={`${field}-mw`} className="font-normal text-black">Monday/Wednesday (1.5 hour classes)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id={`${field}-stt`}
                name={`${field}-days`}
                value="stt"
                checked={value === "stt"}
                onChange={() => onChange("stt")}
                className="text-campus-purple focus:ring-campus-purple" 
              />
              <Label htmlFor={`${field}-stt`} className="font-normal text-black">Sunday/Tuesday/Thursday (1 hour classes)</Label>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderStructuredSectionFields = (
    type: "current" | "desired",
    sectionNumber: string,
    daysPattern: string,
    startTime: string,
    setNumber: (value: string) => void,
    setDaysPattern: (value: string) => void,
    setStartTime: (value: string) => void
  ) => {
    return (
      <div className="space-y-4 border p-4 rounded-md bg-gray-50">
        <h3 className="font-medium text-lg text-campus-darkPurple">
          {type === "current" ? "Current Section Details" : "Desired Section Details"}
        </h3>
        
        {/* Section Number */}
        <div className="space-y-2">
          <Label htmlFor={`${type}-section-number`} className="text-black">Section Number</Label>
          <Input 
            id={`${type}-section-number`} 
            type="number"
            min="1"
            placeholder="e.g., 1, 2, 3" 
            value={sectionNumber}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Days Pattern */}
        {renderDayPatternOptions(
          type, 
          daysPattern, 
          setDaysPattern
        )}
        
        {/* Start Time */}
        <div className="space-y-2">
          <Label htmlFor={`${type}-start-time`} className="text-black">Start Time</Label>
          <Select
            value={startTime}
            onValueChange={setStartTime}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent>
              {START_TIMES.map((time) => (
                <SelectItem key={`${type}-${time}`} value={time}>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{formatTime(time)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {semester === "regular" && daysPattern === "mw" 
              ? "Classes are 1.5 hours long"
              : semester === "regular" && daysPattern === "stt"
                ? "Classes are 1 hour long" 
                : "Summer classes are 1 hour and 15 minutes long"}
          </p>
        </div>
        
        {/* Preview of section format */}
        <div className="mt-2 bg-gray-100 p-2 rounded text-sm">
          <p><strong>Preview:</strong> Section {sectionNumber || "#"} ({formatDaysPattern(daysPattern, semester)} {formatTime(startTime) || "time"})</p>
        </div>
      </div>
    );
  };

  return (
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

            {/* Structured Section Fields */}
            {requestType === "swap" ? (
              <>
                {/* Current Section */}
                {renderStructuredSectionFields(
                  "current",
                  currentSectionNumber,
                  currentDaysPattern,
                  currentStartTime,
                  setCurrentSectionNumber,
                  setCurrentDaysPattern,
                  setCurrentStartTime
                )}
                
                {/* Desired Section */}
                {renderStructuredSectionFields(
                  "desired",
                  desiredSectionNumber,
                  desiredDaysPattern,
                  desiredStartTime,
                  setDesiredSectionNumber,
                  setDesiredDaysPattern,
                  setDesiredStartTime
                )}
              </>
            ) : (
              <>
                {/* Petition - only desired section */}
                {renderStructuredSectionFields(
                  "desired",
                  desiredSectionNumber,
                  desiredDaysPattern,
                  desiredStartTime,
                  setDesiredSectionNumber,
                  setDesiredDaysPattern,
                  setDesiredStartTime
                )}
                
                {/* Petition Reason */}
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
              </>
            )}

            {/* Contact Information */}
            <div className="space-y-4 pt-4">
              <h3 className="font-medium text-lg text-campus-darkPurple">
                Contact Information
              </h3>
                
              {/* Telegram Username */}
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {editingRequestId && (
            <Button 
              type="button"
              variant="outline"
              onClick={resetForm}
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
  );
};
