
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Search } from "lucide-react";

interface SwapRequest {
  id: string;
  desired_course: string;
  current_section: string | null;
  desired_section: string | null;
  full_name: string | null;
  anonymous: boolean;
  petition: boolean;
  telegram_username: string | null;
  email: string | null;
  created_at: string;
  university_id: string | null;
  user_id: string;
  notes: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [requestType, setRequestType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfAdmin();
    }
  }, [user]);

  const checkIfAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id || '')
        .single();
      
      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } else if (data) {
        setIsAdmin(data.role === 'admin');
      } else {
        setIsAdmin(false);
      }
      
      // If admin, fetch all swap requests
      if (data?.role === 'admin') {
        fetchAllSwapRequests();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
      setIsLoading(false);
    }
  };

  const fetchAllSwapRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSwapRequests(data as SwapRequest[]);
    } catch (error) {
      console.error("Error fetching swap requests:", error);
      toast.error("Failed to load swap requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('swap_requests')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success("Request deleted successfully");
      setSwapRequests(swapRequests.filter(req => req.id !== id));
      setSelectedRequest(null);
      setShowDetails(false);
    } catch (error: any) {
      console.error("Error deleting request:", error);
      toast.error(error.message || "Failed to delete request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (request: SwapRequest) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedRequest(null);
  };

  const handleEmailUser = (email: string | null) => {
    if (!email) {
      toast.error("User email is not available");
      return;
    }
    
    // In a real app, this would open an email dialog or integrate with the email function
    toast.info(`Email would be sent to ${email}`);
  };
  
  const handleMarkMatched = async (id: string) => {
    setIsProcessing(true);
    try {
      // In a real app, this would update the request status, send notifications, etc.
      toast.success("Request marked as matched");
      
      // Optional: Call edge function to send match notification
      if (selectedRequest?.email) {
        await supabase.functions.invoke("send-notification", {
          body: {
            type: "match_found",
            email: selectedRequest.email,
            name: selectedRequest.full_name || "User",
            details: {
              course: selectedRequest.desired_course,
              currentSection: selectedRequest.current_section,
              targetSection: selectedRequest.desired_section
            }
          }
        });
      }
      
      // Close details view
      setSelectedRequest(null);
      setShowDetails(false);
    } catch (error) {
      console.error("Error marking as matched:", error);
      toast.error("Failed to update request status");
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter and sort requests based on user selections
  const filteredRequests = swapRequests.filter(req => {
    // Filter by search query
    const matchesSearch = 
      (req.desired_course && req.desired_course.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.current_section && req.current_section.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.desired_section && req.desired_section.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.full_name && req.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.telegram_username && req.telegram_username.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by request type
    const matchesType = 
      requestType === "all" || 
      (requestType === "swap" && !req.petition) || 
      (requestType === "petition" && req.petition);
    
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    // Sort based on user selection
    if (sortBy === "date") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === "course") {
      return (a.desired_course || "").localeCompare(b.desired_course || "");
    }
    return 0;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campus-purple"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-campus-darkPurple">Admin Dashboard</CardTitle>
            <CardDescription className="text-gray-700">
              Access restricted to administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">You don't have permission to view this page.</p>
            <Button 
              onClick={() => window.history.back()}
              className="bg-campus-purple hover:bg-campus-darkPurple"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-campus-darkPurple">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage all swap requests and petitions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Admin Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-campus-darkPurple">Swap Requests Management</CardTitle>
            <CardDescription className="text-gray-700">
              View and manage all user requests
            </CardDescription>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by course, section or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={requestType} onValueChange={setRequestType}>
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
                    <SelectItem value="date">Most Recent</SelectItem>
                    <SelectItem value="course">Course Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Tabs defaultValue="table" className="mt-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="detailed">Detailed View</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="table" className="mt-0">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No requests found matching your criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-black">Course</TableHead>
                        <TableHead className="text-black">Type</TableHead>
                        <TableHead className="text-black">From / To</TableHead>
                        <TableHead className="text-black">User</TableHead>
                        <TableHead className="text-black">Date</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-campus-purple/5">
                          <TableCell className="font-medium text-black">
                            {request.desired_course || "Unknown Course"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={request.petition ? "secondary" : "purple"}>
                              {request.petition ? "Petition" : "Swap"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-black">
                            {request.petition ? (
                              <div>Wants: {request.desired_section || "Any section"}</div>
                            ) : (
                              <div className="text-sm">
                                <div>From: {request.current_section || "Unknown"}</div>
                                <div>To: {request.desired_section || "Unknown"}</div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-black">
                            {request.anonymous ? "Anonymous" : (request.full_name || "Unknown")}
                          </TableCell>
                          <TableCell className="text-black">
                            {new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              onClick={() => handleViewDetails(request)}
                              className="bg-campus-purple hover:bg-campus-darkPurple"
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="detailed" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-8 col-span-full">
                    <p className="text-gray-500">No requests found matching your criteria.</p>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <Card key={request.id} className="hover:border-campus-purple cursor-pointer" 
                         onClick={() => handleViewDetails(request)}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-lg text-black">{request.desired_course || "Unknown Course"}</CardTitle>
                          <Badge variant={request.petition ? "secondary" : "purple"}>
                            {request.petition ? "Petition" : "Swap"}
                          </Badge>
                        </div>
                        <CardDescription>
                          {new Date(request.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {request.petition ? (
                          <p className="text-black">Wants: {request.desired_section || "Any section"}</p>
                        ) : (
                          <>
                            <p className="text-black mb-1">From: {request.current_section || "Unknown"}</p>
                            <p className="text-black">To: {request.desired_section || "Unknown"}</p>
                          </>
                        )}
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {request.anonymous ? "Anonymous" : (request.full_name || "Unknown")}
                          </span>
                          <Button 
                            size="sm" 
                            className="mt-2 bg-campus-purple hover:bg-campus-darkPurple"
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Card>
        
        {/* Request Details Modal */}
        {showDetails && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-campus-darkPurple">
                      Request Details
                    </CardTitle>
                    <CardDescription className="text-gray-700">
                      {selectedRequest.petition ? "Section Petition" : "Swap Request"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleCloseDetails}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-black">Request Information</h3>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="text-gray-500">Course: </span>
                        <span className="text-black">{selectedRequest.desired_course || "Unknown"}</span>
                      </p>
                      {!selectedRequest.petition && (
                        <p className="text-sm">
                          <span className="text-gray-500">Current Section: </span>
                          <span className="text-black">{selectedRequest.current_section || "Unknown"}</span>
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="text-gray-500">Desired Section: </span>
                        <span className="text-black">{selectedRequest.desired_section || "Unknown"}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Date Submitted: </span>
                        <span className="text-black">{new Date(selectedRequest.created_at).toLocaleString()}</span>
                      </p>
                      {selectedRequest.notes && (
                        <div className="mt-2">
                          <p className="text-gray-500 text-sm">Notes:</p>
                          <p className="text-sm text-black p-2 bg-gray-50 rounded mt-1">{selectedRequest.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 text-black">User Information</h3>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="text-gray-500">Name: </span>
                        <span className="text-black">
                          {selectedRequest.anonymous ? "Anonymous" : (selectedRequest.full_name || "Unknown")}
                        </span>
                      </p>
                      {selectedRequest.email && (
                        <p className="text-sm">
                          <span className="text-gray-500">Email: </span>
                          <span className="text-black">{selectedRequest.email}</span>
                        </p>
                      )}
                      {selectedRequest.university_id && (
                        <p className="text-sm">
                          <span className="text-gray-500">University ID: </span>
                          <span className="text-black">{selectedRequest.university_id}</span>
                        </p>
                      )}
                      {selectedRequest.telegram_username && (
                        <p className="text-sm">
                          <span className="text-gray-500">Telegram: </span>
                          <span className="text-black">{selectedRequest.telegram_username}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex flex-wrap gap-2 justify-end border-t">
                  {selectedRequest.email && (
                    <Button
                      variant="outline"
                      onClick={() => handleEmailUser(selectedRequest.email)}
                      disabled={isProcessing}
                    >
                      Email User
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleMarkMatched(selectedRequest.id)}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Matched
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedRequest.id)}
                    disabled={isProcessing}
                  >
                    Delete Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
