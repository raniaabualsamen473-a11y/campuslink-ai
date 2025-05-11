
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SwapRequest } from "@/types/swap"; // Import the type from our new file

const Dashboard = () => {
  const { user } = useAuth();
  const [userRequests, setUserRequests] = useState<SwapRequest[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentRequests, setRecentRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      // Get user's requests
      const { data: userRequestsData, error: userRequestsError } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (userRequestsError) throw userRequestsError;
      
      // Get total requests count
      const { count: requestsCount, error: requestsCountError } = await supabase
        .from('swap_requests')
        .select('*', { count: 'exact', head: true });
        
      if (requestsCountError) throw requestsCountError;
      
      // Get latest requests
      const { data: latestRequests, error: latestRequestsError } = await supabase
        .from('swap_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (latestRequestsError) throw latestRequestsError;

      // Set state with fetched data
      setUserRequests(userRequestsData as SwapRequest[] || []);
      setTotalRequests(requestsCount || 0);
      setTotalUsers(Math.floor(requestsCount * 0.8) || 0); // Mock data for user count
      setRecentRequests(latestRequests as SwapRequest[] || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-campus-darkPurple mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Your Requests</CardTitle>
            <CardDescription>Active swap requests & petitions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-campus-darkPurple">{userRequests.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Requests</CardTitle>
            <CardDescription>Across all students</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-campus-darkPurple">{totalRequests}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Users</CardTitle>
            <CardDescription>Students using ClassSwap</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-campus-darkPurple">{totalUsers}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-campus-purple/20">
          <CardHeader>
            <CardTitle>Your Recent Requests</CardTitle>
            <CardDescription>Your most recent swap requests & petitions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-gray-500 py-6">Loading your requests...</p>
            ) : userRequests.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {userRequests.map((request) => (
                    <div key={request.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <p className="font-medium text-black">{request.desired_course || "Unnamed Course"}</p>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            request.petition 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {request.petition ? "Petition" : "Swap"}
                        </span>
                      </div>
                      {!request.petition && request.current_section && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="text-gray-500">From: </span>
                          {request.current_section}
                        </p>
                      )}
                      <p className="text-sm text-gray-700">
                        <span className="text-gray-500">To: </span>
                        {request.desired_section || "Any section"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {formatDate(request.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No requests found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create a swap request to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-campus-purple/20">
          <CardHeader>
            <CardTitle>Latest Activity</CardTitle>
            <CardDescription>Recent swap requests from all students</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-gray-500 py-6">Loading recent activity...</p>
            ) : recentRequests.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <p className="font-medium text-black">{request.desired_course || "Unnamed Course"}</p>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            request.petition 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {request.petition ? "Petition" : "Swap"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {request.anonymous ? "Anonymous Student" : (request.full_name || "Unknown Student")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Posted: {formatDate(request.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
