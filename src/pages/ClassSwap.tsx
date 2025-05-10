
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar, Filter, Search, RefreshCcw, Plus, ArrowRight, MessageSquare } from "lucide-react";

// Sample data - in a real app this would come from backend
const courses = [
  "Machine Learning",
  "Advanced Algorithms",
  "Data Structures",
  "Artificial Intelligence",
  "Web Development",
  "Database Systems",
  "Computer Networks",
  "Operating Systems",
  "Software Engineering",
  "Computer Graphics",
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

// Sample matches data
const mockMatches = [
  {
    id: 1,
    course: "Machine Learning",
    currentSection: "Section 1 (Mon/Wed 10:00 AM)",
    desiredSection: "Section 2 (Sun/Tue/Thu 2:00 PM)",
    user: "Ahmed K.",
    isAnonymous: false,
    matchPercent: 95,
    type: "swap",
    dateCreated: "2025-05-07",
  },
  {
    id: 2,
    course: "Advanced Algorithms",
    currentSection: "Section 2 (Sun/Tue/Thu 11:00 AM)",
    desiredSection: "Section 1 (Mon/Wed 9:00 AM)",
    user: "Anonymous",
    isAnonymous: true,
    matchPercent: 100,
    type: "swap",
    dateCreated: "2025-05-05",
  },
  {
    id: 3,
    course: "Data Structures",
    currentSection: null,
    desiredSection: "Section 1 (Mon/Wed 1:00 PM)",
    user: "Sara L.",
    isAnonymous: false,
    matchPercent: 80,
    type: "petition",
    dateCreated: "2025-05-04",
  },
];

const ClassSwap = () => {
  // States for form handling
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [requestType, setRequestType] = useState("swap");
  const [semester, setSemester] = useState("regular");
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null);
  
  // States for filtering and searching
  const [searchQuery, setSearchQuery] = useState("");
  const [matchType, setMatchType] = useState("all");
  const [sortBy, setSortBy] = useState("match");
  
  // State for active requests and matches
  const [activeRequests, setActiveRequests] = useState([
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
  ]);

  // Filter and sort the matches based on user selections
  const filteredMatches = mockMatches.filter(match => {
    // Filter by search query
    const matchesSearch = 
      match.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match.currentSection && match.currentSection.toLowerCase().includes(searchQuery.toLowerCase())) ||
      match.desiredSection.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by match type
    const matchesType = 
      matchType === "all" || 
      (matchType === "swap" && match.type === "swap") || 
      (matchType === "petition" && match.type === "petition");
    
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    // Sort based on user selection
    if (sortBy === "match") {
      return b.matchPercent - a.matchPercent;
    } else if (sortBy === "course") {
      return a.course.localeCompare(b.course);
    } else if (sortBy === "date") {
      return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    }
    return 0;
  });

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success(editingRequestId 
        ? "Request updated successfully!" 
        : requestType === "swap" 
          ? "Swap request submitted successfully!" 
          : "Section petition created successfully!"
      );
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
    setActiveRequests(activeRequests.filter(request => request.id !== id));
    toast.success(`Request cancelled successfully!`);
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

  const handleContact = (matchId: number) => {
    // In a real app, this would open a contact option or reveal Telegram username
    const match = mockMatches.find(m => m.id === matchId);
    if (match) {
      toast.success(`Connecting with ${match.user}`, {
        description: `Telegram contact information has been shared for your ${match.course} swap request.`,
      });
    }
  };

  const handleCreateNewRequest = () => {
    setEditingRequestId(null);
    // Reset form fields
    setIsAnonymous(false);
    setRequestType("swap");
    setSemester("regular");
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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-campus-darkPurple">Class Swap Center</h1>
        <p className="text-gray-600">
          Find, create, and manage your class section swaps and petitions
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          onClick={handleCreateNewRequest}
          className="bg-campus-purple hover:bg-campus-darkPurple"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
        
        <Button 
          variant="outline" 
          className="border-campus-purple text-campus-purple hover:bg-campus-purple/10"
        >
          <Calendar className="mr-2 h-4 w-4" />
          My Class Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main content area - 8 columns on large screens */}
        <div className="lg:col-span-8 space-y-8">
          {/* Match Results Section */}
          <Card className="border-campus-purple/20">
            <CardHeader>
              <CardTitle className="text-campus-darkPurple flex items-center">
                <span>Available Swaps & Petitions</span>
                <Badge variant="purple" className="ml-2">
                  {filteredMatches.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Find compatible swap requests from other students
              </CardDescription>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by course or section..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={matchType} onValueChange={setMatchType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="swap">Swaps Only</SelectItem>
                      <SelectItem value="petition">Petitions Only</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match">Best Match</SelectItem>
                      <SelectItem value="course">Course Name</SelectItem>
                      <SelectItem value="date">Most Recent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {filteredMatches.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No matches found for your search criteria.</p>
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>From / To</TableHead>
                        <TableHead>Posted By</TableHead>
                        <TableHead className="text-right">Match</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMatches.map((match) => (
                        <TableRow key={match.id} className="hover:bg-campus-purple/5">
                          <TableCell className="font-medium">{match.course}</TableCell>
                          <TableCell>
                            <Badge variant={match.type === "swap" ? "purple" : "secondary"}>
                              {match.type === "swap" ? "Swap" : "Petition"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {match.type === "swap" ? (
                              <div className="text-sm">
                                <div>From: {match.currentSection}</div>
                                <div>To: {match.desiredSection}</div>
                              </div>
                            ) : (
                              <div className="text-sm">Wants: {match.desiredSection}</div>
                            )}
                          </TableCell>
                          <TableCell>{match.user}</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-medium ${match.matchPercent >= 90 ? 'text-green-600' : match.matchPercent >= 70 ? 'text-yellow-600' : 'text-gray-600'}`}>
                              {match.matchPercent}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              onClick={() => handleContact(match.id)}
                              className="bg-campus-purple hover:bg-campus-darkPurple"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  className="border-campus-purple text-campus-purple hover:bg-campus-purple/10"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Load More Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Requests */}
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
                        <Badge variant="success">
                          {request.status}
                        </Badge>
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
                    <Button 
                      onClick={handleCreateNewRequest}
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                    >
                      Create Your First Request
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 4 columns on large screens */}
        <div className="lg:col-span-4">
          {/* Request Form */}
          <div id="request-form">
            <Card className="border-campus-purple/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-campus-darkPurple">
                  {editingRequestId ? "Edit Request" : "New Class Request"}
                </CardTitle>
                <CardDescription>
                  {editingRequestId 
                    ? "Modify your existing class section request" 
                    : "Create a new class section swap or petition"
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
                      <Label htmlFor="semester">Semester</Label>
                      <Select defaultValue={semester} onValueChange={handleSemesterChange}>
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
                              Explaining your reason may help gather support
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
                        placeholder="Any additional information..."
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
                    className={`${editingRequestId ? '' : 'w-full'} bg-campus-purple hover:bg-campus-darkPurple`}
                  >
                    {isLoading 
                      ? editingRequestId 
                        ? "Saving..." 
                        : requestType === "swap" 
                          ? "Submitting..." 
                          : "Creating..." 
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
        </div>
      </div>
    </div>
  );
};

export default ClassSwap;
