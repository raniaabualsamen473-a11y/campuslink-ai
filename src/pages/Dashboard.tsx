
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SwapRequest } from "@/types/swap";
import { Users, MessageSquare, Calendar } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [userRequests, setUserRequests] = useState<SwapRequest[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
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
      
      // Get count of unique users that have created requests
      const { data: uniqueUsers, error: uniqueUsersError } = await supabase
        .from('swap_requests')
        .select('user_id', { count: 'exact', head: false })
        .not('user_id', 'is', null);
        
      if (uniqueUsersError) throw uniqueUsersError;
      
      // Count distinct user_ids
      const distinctUserIds = new Set();
      if (uniqueUsers) {
        uniqueUsers.forEach(req => {
          if (req.user_id) {
            distinctUserIds.add(req.user_id);
          }
        });
      }

      // Set state with fetched data
      setUserRequests(userRequestsData as SwapRequest[] || []);
      setTotalRequests(requestsCount || 0);
      setActiveUsers(distinctUserIds.size || 0);
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
      <div className="flex items-center mb-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-campus-darkPurple">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-campus-purple/20 hover:shadow-neon-purple transition-all duration-300 animate-fade-in" style={{animationDelay: "0.1s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Your Requests</CardTitle>
              <div className="rounded-full bg-campus-purple/10 p-2 neon-glow">
                <Calendar className="h-5 w-5 text-campus-purple" />
              </div>
            </div>
            <CardDescription>Active swap requests & petitions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-campus-darkPurple">{userRequests.length}</p>
          </CardContent>
        </Card>
        
        <Card className="border-campus-purple/20 hover:shadow-neon-purple transition-all duration-300 animate-fade-in" style={{animationDelay: "0.2s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Total Requests</CardTitle>
              <div className="rounded-full bg-campus-purple/10 p-2 neon-glow">
                <MessageSquare className="h-5 w-5 text-campus-purple" />
              </div>
            </div>
            <CardDescription>Across all students</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-campus-darkPurple">{totalRequests}</p>
          </CardContent>
        </Card>
        
        <Card className="border-campus-purple/20 hover:shadow-neon-purple transition-all duration-300 animate-fade-in" style={{animationDelay: "0.3s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Active Users</CardTitle>
              <div className="rounded-full bg-campus-purple/10 p-2 neon-glow">
                <Users className="h-5 w-5 text-campus-purple" />
              </div>
            </div>
            <CardDescription>Students using ClassSwap</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-campus-darkPurple">{activeUsers}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-campus-purple/20 hover:shadow-neon-purple transition-all duration-300 animate-fade-in" style={{animationDelay: "0.4s"}}>
          <CardHeader>
            <CardTitle>Your Recent Requests</CardTitle>
            <CardDescription>Your most recent swap requests & petitions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-glow-pulse rounded-full h-8 w-8 border-2 border-campus-purple"></div>
              </div>
            ) : userRequests.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {userRequests.map((request) => (
                    <div key={request.id} className="glass-card p-3 hover:shadow-neon-purple transition-all duration-300">
                      <div className="flex justify-between">
                        <p className="font-medium text-foreground">{request.desired_course || "Unnamed Course"}</p>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            request.petition 
                              ? "bg-blue-100/50 text-blue-800 backdrop-blur-sm" 
                              : "bg-green-100/50 text-green-800 backdrop-blur-sm"
                          }`}
                        >
                          {request.petition ? "Petition" : "Swap"}
                        </span>
                      </div>
                      {!request.petition && request.current_section && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-muted-foreground">From: </span>
                          {request.current_section}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        <span className="text-muted-foreground">To: </span>
                        {request.desired_section || "Any section"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {formatDate(request.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No requests found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a swap request to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-campus-purple/20 hover:shadow-neon-purple transition-all duration-300 animate-fade-in" style={{animationDelay: "0.5s"}}>
          <CardHeader>
            <CardTitle>Latest Activity</CardTitle>
            <CardDescription>Recent swap requests from all students</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-glow-pulse rounded-full h-8 w-8 border-2 border-campus-purple"></div>
              </div>
            ) : recentRequests.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="glass-card p-3 hover:shadow-neon-purple transition-all duration-300">
                      <div className="flex justify-between">
                        <p className="font-medium text-foreground">{request.desired_course || "Unnamed Course"}</p>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            request.petition 
                              ? "bg-blue-100/50 text-blue-800 backdrop-blur-sm" 
                              : "bg-green-100/50 text-green-800 backdrop-blur-sm"
                          }`}
                        >
                          {request.petition ? "Petition" : "Swap"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.anonymous ? "Anonymous Student" : (request.full_name || "Unknown Student")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Posted: {formatDate(request.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
