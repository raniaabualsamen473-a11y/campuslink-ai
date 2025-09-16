
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SwapRequest } from "@/types/swap";
import { Users, MessageSquare, Calendar, ArrowDownUp } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [userRequests, setUserRequests] = useState<SwapRequest[]>([]);
  const [userDropRequests, setUserDropRequests] = useState<any[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [recentRequests, setRecentRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user || !user.id) {
      console.log('No authenticated user found');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    try {
      // Get user's swap requests
      const { data: userRequestsData, error: userRequestsError } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (userRequestsError) throw userRequestsError;

      // Get user's drop requests
      const { data: userDropRequestsData, error: userDropRequestsError } = await supabase
        .from('drop_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (userDropRequestsError) throw userDropRequestsError;
      
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
      setUserDropRequests(userDropRequestsData || []);
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

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 galaxy-bg min-h-screen">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 galaxy-bg min-h-screen">
      <div className="flex items-center mb-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground neon-glow">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="glass-card neon-border hover:shadow-neon-purple transition-all duration-300 animate-fade-in bg-card/90 backdrop-blur-sm" style={{animationDelay: "0.1s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-card-foreground">Swap Requests</CardTitle>
              <div className="rounded-full bg-primary/20 p-2 shadow-neon-purple">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardDescription className="text-muted-foreground">Active swap requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-card-foreground">{userRequests.length}</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border hover:shadow-neon-purple transition-all duration-300 animate-fade-in bg-card/90 backdrop-blur-sm" style={{animationDelay: "0.15s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-card-foreground">Drop Requests</CardTitle>
              <div className="rounded-full bg-primary/20 p-2 shadow-neon-purple">
                <ArrowDownUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardDescription className="text-muted-foreground">Drop & request entries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-card-foreground">{userDropRequests.length}</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card neon-border hover:shadow-neon-purple transition-all duration-300 animate-fade-in bg-card/90 backdrop-blur-sm" style={{animationDelay: "0.2s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-card-foreground">Total Requests</CardTitle>
              <div className="rounded-full bg-primary/20 p-2 shadow-neon-purple">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardDescription className="text-muted-foreground">Across all students</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-card-foreground">{totalRequests}</p>
          </CardContent>
        </Card>
        
         <Card className="glass-card neon-border hover:shadow-neon-purple transition-all duration-300 animate-fade-in bg-card/90 backdrop-blur-sm" style={{animationDelay: "0.25s"}}>
           <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
               <CardTitle className="text-lg font-medium text-card-foreground">Active Users</CardTitle>
               <div className="rounded-full bg-primary/20 p-2 shadow-neon-purple">
                 <Users className="h-5 w-5 text-primary" />
               </div>
             </div>
             <CardDescription className="text-muted-foreground">Students using ClassSwap</CardDescription>
           </CardHeader>
           <CardContent>
             <p className="text-3xl font-bold text-card-foreground">{activeUsers}</p>
           </CardContent>
         </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card neon-border hover:shadow-neon-purple transition-all duration-300 animate-fade-in bg-card/90 backdrop-blur-sm" style={{animationDelay: "0.3s"}}>
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Swap Requests</CardTitle>
            <CardDescription className="text-muted-foreground">Your most recent swap requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="flex justify-center py-6">
                 <div className="animate-glow-pulse rounded-full h-8 w-8 border-2 border-primary"></div>
               </div>
            ) : userRequests.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {userRequests.map((request) => (
                     <div key={request.id} className="bg-card/70 border border-border/50 p-3 rounded-lg hover:shadow-neon-purple transition-all duration-300">
                       <div className="flex justify-between">
                         <p className="font-medium text-card-foreground">{request.desired_course || "Unnamed Course"}</p>
                        <span 
                          className="text-xs px-2 py-1 rounded-full bg-green-100/50 text-green-800 backdrop-blur-sm"
                        >
                          Swap
                        </span>
                      </div>
                      {request.current_section && (
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
                <p className="text-muted-foreground">No swap requests found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a swap request to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card neon-border hover:shadow-neon-purple transition-all duration-300 animate-fade-in bg-card/90 backdrop-blur-sm" style={{animationDelay: "0.35s"}}>
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Drop Requests</CardTitle>
            <CardDescription className="text-muted-foreground">Your most recent drop & request entries</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-glow-pulse rounded-full h-8 w-8 border-2 border-primary"></div>
              </div>
            ) : userDropRequests.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {userDropRequests.map((request) => (
                    <div key={request.id} className="bg-card/70 border border-border/50 p-3 rounded-lg hover:shadow-neon-purple transition-all duration-300">
                      <div className="flex justify-between">
                        <p className="font-medium text-card-foreground">
                          {request.drop_course || request.request_course || "Unnamed Course"}
                        </p>
                        <span 
                          className="text-xs px-2 py-1 rounded-full bg-blue-100/50 text-blue-800 backdrop-blur-sm"
                        >
                          {request.action_type === 'drop_only' ? 'Drop' : 
                           request.action_type === 'request_only' ? 'Request' : 'Drop & Request'}
                        </span>
                      </div>
                      {request.drop_course && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-muted-foreground">Dropping: </span>
                          {request.drop_course} Section {request.drop_section_number}
                        </p>
                      )}
                      {request.request_course && (
                        <p className="text-sm text-muted-foreground">
                          <span className="text-muted-foreground">Requesting: </span>
                          {request.request_course} {request.any_section_flexible ? "(Any Section)" : `Section ${request.request_section_number}`}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {formatDate(request.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No drop requests found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a drop request to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
