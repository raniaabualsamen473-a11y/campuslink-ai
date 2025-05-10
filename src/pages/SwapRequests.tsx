
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import MatchResults from "@/components/MatchResults";

const SwapRequests = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [requestType, setRequestType] = useState("swap");
  const [semester, setSemester] = useState("regular");
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null);
  
  // Sample data - in a real app this would come from backend
  const courses = [
    "Machine Learning",
    "Advanced Algorithms",
    "Data Structures",
    "Artificial Intelligence",
    "Web Development",
    "Database Systems",
    "Computer Networks",
  ];
  
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

  const activeRequests = [
    {
      id: 1,
      course: "Machine Learning",
      currentSection: "Section 1 (Mon/Wed 10:00 AM)",
      targetSection: "Section 2 (Sun/Tue/Thu 2:00 PM)",
      dateCreated: "2025-05-07",
      status: "Active",
    },
    {
      id: 2,
      course: "Advanced Algorithms",
      currentSection: "Section 1 (Mon/Wed 9:00 AM)",
      targetSection: "Section 2 (Sun/Tue/Thu 11:00 AM)",
      dateCreated: "2025-05-05",
      status: "Active",
    },
  ];

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Swap request submitted successfully!");
      // Reset editing state if we were editing
      if (editingRequestId) {
        setEditingRequestId(null);
      }
    }, 1500);
  };

  const handleSemesterChange = (value: string) => {
    setSemester(value);
  };
  
  const handleDeleteRequest = (id: number) => {
    // In a real app, this would delete the request from backend
    toast.success(`Request ${id} deleted successfully!`);
  };
  
  const handleEditRequest = (id: number) => {
    // In a real app, this would load the request data into the form
    setEditingRequestId(id);
    toast(`Editing request ${id}`, {
      description: "You can now modify your request and resubmit it."
    });
    // Scroll to form
    document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const renderSectionOptions = () => {
    if (semester === "summer") {
      return (
        <div className="space-y-4">
          <Label className="text-sm font-medium">Days Format</Label>
          <RadioGroup defaultValue="everyday" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="everyday" id="everyday" />
              <Label htmlFor="everyday" className="cursor-pointer">Every day (Sun-Thu)</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="firstTwoDays" id="firstTwoDays" />
              <Label htmlFor="firstTwoDays" className="cursor-pointer">First two days (Sun-Mon)</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="lastThreeDays" id="lastThreeDays" />
              <Label htmlFor="lastThreeDays" className="cursor-pointer">Last three days (Tue-Thu)</Label>
            </div>
          </RadioGroup>
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <Label>Days Pattern</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="mw" 
                name="days" 
                className="text-campus-purple focus:ring-campus-purple" 
                defaultChecked 
              />
              <Label htmlFor="mw" className="font-normal">Monday/Wednesday</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="stt" 
                name="days" 
                className="text-campus-purple focus:ring-campus-purple" 
              />
              <Label htmlFor="stt" className="font-normal">Sunday/Tuesday/Thursday</Label>
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
              <CardDescription>
                {editingRequestId 
                  ? "Modify your existing class section swap or petition request" 
                  : "Create a new class section swap or petition request"
                }
              </CardDescription>
              <Tabs defaultValue="swap" className="mt-4" onValueChange={(value) => setRequestType(value)}>
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
                    <Label htmlFor="semester">Semester</Label>
                    <Select defaultValue="regular" onValueChange={handleSemesterChange}>
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
                    <Label htmlFor="course">Course</Label>
                    <Select>
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
                  </div>

                  {requestType === "swap" ? (
                    <>
                      {/* Current Section */}
                      <div className="space-y-2">
                        <Label htmlFor="current-section">Your Current Section</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current section" />
                          </SelectTrigger>
                          <SelectContent>
                            {sections["Machine Learning"]?.map((section) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name} ({section.schedule})
                              </SelectItem>
                            ))}
                            <SelectItem value="other">
                              + Add New Section
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Desired Section */}
                      <div className="space-y-2">
                        <Label htmlFor="target-section">Section You Want</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your desired section" />
                          </SelectTrigger>
                          <SelectContent>
                            {sections["Machine Learning"]?.map((section) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name} ({section.schedule})
                              </SelectItem>
                            ))}
                            <SelectItem value="other">
                              + Add New Section
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* New Section Petition */}
                      <div className="space-y-4">
                        {renderSectionOptions()}

                        <div className="space-y-2">
                          <Label htmlFor="time">Preferred Time</Label>
                          <Select>
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
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason for Petition</Label>
                          <Textarea 
                            id="reason" 
                            placeholder="Why do you need this section?" 
                            className="min-h-[100px]"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Explaining your reason may help gather support for your petition
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Any additional information or preferences..."
                    />
                  </div>

                  {/* Flexible Options (for petitions) */}
                  {requestType === "petition" && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="flexible-time" />
                        <Label htmlFor="flexible-time" className="font-normal">
                          I'm flexible with the time
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="flexible-days" />
                        <Label htmlFor="flexible-days" className="font-normal">
                          I'm flexible with the days
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* Contact Method */}
                  <div className="space-y-2">
                    <Label htmlFor="telegram">Your Telegram Username</Label>
                    <Input id="telegram" placeholder="@username" />
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
                      <Label htmlFor="anonymous" className="font-medium">
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
                  className={`${editingRequestId ? '' : 'ml-auto'} bg-campus-purple hover:bg-campus-darkPurple`}
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

        {/* Match Results */}
        <div>
          <MatchResults />
        </div>

        {/* Active Requests */}
        <div>
          <Card className="border-campus-purple/20">
            <CardHeader>
              <CardTitle className="text-campus-darkPurple">Your Active Requests</CardTitle>
              <CardDescription>
                View and manage your current swap requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeRequests.length > 0 ? (
                  activeRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-campus-purple">
                          {request.course}
                        </h3>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm mb-1">
                        <span className="text-gray-500">From: </span>
                        {request.currentSection}
                      </p>
                      <p className="text-sm mb-2">
                        <span className="text-gray-500">To: </span>
                        {request.targetSection}
                      </p>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                        <span>Created: {request.dateCreated}</span>
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
