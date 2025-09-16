
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
  const [totalDropRequests, setTotalDropRequests] = useState(0);
  const [dropOnlyCount, setDropOnlyCount] = useState(0);
  const [requestOnlyCount, setRequestOnlyCount] = useState(0);
  const [dropAndRequestCount, setDropAndRequestCount] = useState(0);
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

      // Get total drop requests count
      const { count: dropRequestsCount, error: dropRequestsCountError } = await supabase
        .from('drop_requests')
        .select('*', { count: 'exact', head: true });
        
      if (dropRequestsCountError) throw dropRequestsCountError;

      // Get drop request breakdowns
      const { count: dropOnlyCountData, error: dropOnlyError } = await supabase
        .from('drop_requests')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'drop_only');

      const { count: requestOnlyCountData, error: requestOnlyError } = await supabase
        .from('drop_requests')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'request_only');

      const { count: dropAndRequestCountData, error: dropAndRequestError } = await supabase
        .from('drop_requests')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'drop_and_request');

      if (dropOnlyError) throw dropOnlyError;
      if (requestOnlyError) throw requestOnlyError;
      if (dropAndRequestError) throw dropAndRequestError;
      
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
      setTotalDropRequests(dropRequestsCount || 0);
      setDropOnlyCount(dropOnlyCountData || 0);
      setRequestOnlyCount(requestOnlyCountData || 0);
      setDropAndRequestCount(dropAndRequestCountData || 0);
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
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center mb-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        <Card className="galaxy-bg glass-card hover:shadow-neon-purple neon-border transition-all duration-300 animate-fade-in animate-float" style={{animationDelay: "0.1s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-foreground animate-glow-pulse">Your Swaps</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-2 shadow-neon-purple">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <CardDescription className="text-muted-foreground">Your swap requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{userRequests.length}</p>
          </CardContent>
        </Card>

        <Card className="galaxy-bg glass-card hover:shadow-neon-blue neon-border transition-all duration-300 animate-fade-in animate-float" style={{animationDelay: "0.15s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-foreground animate-glow-pulse">Your Drops</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-2 shadow-neon-blue">
                <ArrowDownUp className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <CardDescription className="text-muted-foreground">Your drop entries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{userDropRequests.length}</p>
          </CardContent>
        </Card>

        <Card className="galaxy-bg glass-card hover:shadow-neon-red neon-border transition-all duration-300 animate-fade-in animate-float" style={{animationDelay: "0.2s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground animate-glow-pulse">Drop Only</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 p-2 shadow-neon-red">
                <ArrowDownUp className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <CardDescription className="text-xs text-muted-foreground">Platform drops</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">{dropOnlyCount}</p>
          </CardContent>
        </Card>

        <Card className="galaxy-bg glass-card hover:shadow-neon-green neon-border transition-all duration-300 animate-fade-in animate-float" style={{animationDelay: "0.25s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground animate-glow-pulse">Request Only</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-2 shadow-neon-green">
                <MessageSquare className="h-4 w-4 text-green-400" />
              </div>
            </div>
            <CardDescription className="text-xs text-muted-foreground">Platform requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{requestOnlyCount}</p>
          </CardContent>
        </Card>

        <Card className="galaxy-bg glass-card hover:shadow-neon-purple neon-border transition-all duration-300 animate-fade-in animate-float" style={{animationDelay: "0.3s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground animate-glow-pulse">Drop & Request</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-2 shadow-neon-purple">
                <ArrowDownUp className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <CardDescription className="text-xs text-muted-foreground">Combined entries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{dropAndRequestCount}</p>
          </CardContent>
        </Card>
        
        <Card className="galaxy-bg glass-card hover:shadow-neon-blue neon-border transition-all duration-300 animate-fade-in animate-float" style={{animationDelay: "0.35s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground animate-glow-pulse">All Requests</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20 p-2 shadow-neon-blue">
                <MessageSquare className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <CardDescription className="text-xs text-muted-foreground">Platform total</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">{totalRequests + totalDropRequests}</p>
          </CardContent>
        </Card>
        
         <Card className="galaxy-bg glass-card hover:shadow-neon-green neon-border transition-all duration-300 animate-fade-in animate-float" style={{animationDelay: "0.4s"}}>
           <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
               <CardTitle className="text-sm font-medium text-foreground animate-glow-pulse">Active Users</CardTitle>
               <div className="rounded-full bg-gradient-to-r from-green-500/20 to-lime-500/20 p-2 shadow-neon-green">
                 <Users className="h-4 w-4 text-green-400" />
               </div>
             </div>
             <CardDescription className="text-xs text-muted-foreground">Platform users</CardDescription>
           </CardHeader>
           <CardContent>
             <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">{activeUsers}</p>
           </CardContent>
         </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="galaxy-bg glass-card hover:shadow-neon-purple neon-border transition-all duration-300 animate-fade-in animate-float" style={{animationDelay: "0.5s"}}>
          <CardHeader>
            <CardTitle className="text-foreground animate-glow-pulse">Recent Swap Requests</CardTitle>
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
                     <div key={request.id} className="galaxy-bg glass-card p-3 hover:shadow-neon-purple neon-border transition-all duration-300 animate-float">
                       <div className="flex justify-between">
                         <p className="font-medium text-foreground">{request.desired_course || "Unnamed Course"}</p>
                        <span 
                          className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30"
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

        <Card className="galaxy-bg glass-card hover:shadow-neon-blue neon-border transition-all duration-300 animate-fade-in animate-float" style={{animationDelay: "0.6s"}}>
          <CardHeader>
            <CardTitle className="text-foreground animate-glow-pulse">Recent Drop Requests</CardTitle>
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
                    <div key={request.id} className="galaxy-bg glass-card p-3 hover:shadow-neon-blue neon-border transition-all duration-300 animate-float">
                      <div className="flex justify-between">
                        <p className="font-medium text-foreground">
                          {request.drop_course || request.request_course || "Unnamed Course"}
                        </p>
                        <span 
                          className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
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
