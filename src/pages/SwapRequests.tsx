
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

const SwapRequests = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [requestType, setRequestType] = useState("swap");
  
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
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Class Swap Requests</h1>
        <p className="text-gray-600">
          Submit and manage your class section swap requests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>New Request</CardTitle>
              <CardDescription>
                Create a new class section swap or petition request
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
                        <div className="space-y-2">
                          <Label>Desired Section Days</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                id="mw" 
                                name="days" 
                                className="text-campus-teal focus:ring-campus-teal" 
                                defaultChecked 
                              />
                              <Label htmlFor="mw" className="font-normal">Monday/Wednesday</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                id="stt" 
                                name="days" 
                                className="text-campus-teal focus:ring-campus-teal" 
                              />
                              <Label htmlFor="stt" className="font-normal">Sunday/Tuesday/Thursday</Label>
                            </div>
                          </div>
                        </div>

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
                          <Label htmlFor="reason">Reason for Petition (Optional)</Label>
                          <Input id="reason" placeholder="Why do you need this section?" />
                        </div>
                      </div>
                    </>
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading 
                    ? requestType === "swap" ? "Submitting Request..." : "Creating Petition..." 
                    : requestType === "swap" ? "Submit Swap Request" : "Create Petition"
                  }
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Active Requests */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Active Requests</CardTitle>
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
                        <h3 className="font-semibold text-campus-blue">
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
                        <Button size="sm" variant="destructive">Cancel</Button>
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
