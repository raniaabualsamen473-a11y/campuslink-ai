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

  // Debug logging
  console.log('Dashboard Debug - Full User Object:', JSON.stringify(user, null, 2));
  console.log('Dashboard Debug - User ID Properties:', {
    id: user?.id,
    user_id: user?.user_id,
    telegram_id: user?.telegram_id,
    sub: user?.sub,
    uid: user?.uid
  });

  useEffect(() => {
    console.log('Dashboard useEffect - User:', user);
    
    if (user === null) {
      // User is definitely not logged in
      console.log('User is null - not logged in');
      setIsLoading(false);
    } else if (user === undefined) {
      // User state is still loading
      console.log('User is undefined - still loading auth state');
      setIsLoading(true);
    } else if (user) {
      // User exists - try multiple ID properties for different auth systems
      const userId = user.id || user.user_id || user.sub || user.uid || user.telegram_id;
      console.log('User found. ID properties check:', {
        id: user.id,
        user_id: user.user_id,
        sub: user.sub,
        uid: user.uid,
        telegram_id: user.telegram_id,
        resolved_userId: userId
      });
      
      if (userId) {
        console.log('Using resolved user ID:', userId);
        fetchDashboardData(userId);
      } else {
        console.log('No valid user ID found, but showing dashboard anyway with empty data');
        setIsLoading(false);
      }
    } else {
      console.log('Unexpected user state:', user);
      setIsLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async (userId?: string) => {
    const resolvedUserId = userId || user?.id || user?.user_id || user?.sub || user?.uid || user?.telegram_id;
    
    if (!user) {
      console.log('fetchDashboardData: No user found');
      setIsLoading(false);
      return;
    }
    
    console.log('fetchDashboardData: Starting data fetch for user ID:', resolvedUserId);
    setIsLoading(true);
    
    try {
      // Get user's swap requests
      console.log('Fetching swap requests...');
      const { data: userRequestsData, error: userRequestsError } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('user_id', resolvedUserId || 'no-user-id')
        .order('created_at', { ascending: false })
        .limit(5);
        
      console.log('Swap requests result:', userRequestsData, userRequestsError);
      if (userRequestsError) console.error('Swap requests error:', userRequestsError);

      // Get user's drop requests
      console.log('Fetching drop requests...');
      const { data: userDropRequestsData, error: userDropRequestsError } = await supabase
        .from('drop_requests')
        .select('*')
        .eq('user_id', resolvedUserId || 'no-user-id')
        .order('created_at', { ascending: false })
        .limit(5);
        
      console.log('Drop requests result:', userDropRequestsData, userDropRequestsError);
      if (userDropRequestsError) console.error('Drop requests error:', userDropRequestsError);
      
      // Get total requests count
      console.log('Fetching total requests count...');
      const { count: requestsCount, error: requestsCountError } = await supabase
        .from('swap_requests')
        .select('*', { count: 'exact', head: true });
        
      console.log('Total requests count:', requestsCount, requestsCountError);
      if (requestsCountError) console.error('Total requests error:', requestsCountError);

      // Get total drop requests count
      console.log('Fetching total drop requests count...');
      const { count: dropRequestsCount, error: dropRequestsCountError } = await supabase
        .from('drop_requests')
        .select('*', { count: 'exact', head: true });
        
      console.log('Total drop requests count:', dropRequestsCount, dropRequestsCountError);
      if (dropRequestsCountError) console.error('Total drop requests error:', dropRequestsCountError);

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

      if (dropOnlyError) console.error('Drop only error:', dropOnlyError);
      if (requestOnlyError) console.error('Request only error:', requestOnlyError);
      if (dropAndRequestError) console.error('Drop and request error:', dropAndRequestError);
      
      // Get latest requests
      const { data: latestRequests, error: latestRequestsError } = await supabase
        .from('swap_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (latestRequestsError) console.error('Latest requests error:', latestRequestsError);
      
      // Get count of unique users that have created requests
      const { data: uniqueUsers, error: uniqueUsersError } = await supabase
        .from('swap_requests')
        .select('user_id', { count: 'exact', head: false })
        .not('user_id', 'is', null);
        
      if (uniqueUsersError) console.error('Unique users error:', uniqueUsersError);
      
      // Count distinct user_ids
      const distinctUserIds = new Set();
      if (uniqueUsers) {
        uniqueUsers.forEach(req => {
          if (req.user_id) {
            distinctUserIds.add(req.user_id);
          }
        });
      }

      console.log('Setting state with fetched data...');
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
      
      console.log('Data fetch completed successfully');
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
      console.log('fetchDashboardData: Loading set to false');
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

  console.log('Dashboard Render - User state:', user);
  console.log('Dashboard Render - Is Loading:', isLoading);

  if (user === null) {
    console.log('Rendering: User not logged in');
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground text-lg">Please log in to view your dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  if (user === undefined) {
    console.log('Rendering: Authentication loading');
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-glow-pulse rounded-full h-12 w-12 border-4 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering: Main dashboard');
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-all duration-300" style={{animationDelay: "0.1s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-white">Your Swaps</CardTitle>
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

        <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-all duration-300" style={{animationDelay: "0.15s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-white">Your Drops</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-2">
                <ArrowDownUp className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <CardDescription className="text-slate-400">Your drop entries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{userDropRequests.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-all duration-300" style={{animationDelay: "0.2s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white">Drop Only</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 p-2">
                <ArrowDownUp className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <CardDescription className="text-xs text-slate-400">Platform drops</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">{dropOnlyCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-all duration-300" style={{animationDelay: "0.25s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white">Request Only</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-2">
                <MessageSquare className="h-4 w-4 text-green-400" />
              </div>
            </div>
            <CardDescription className="text-xs text-slate-400">Platform requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{requestOnlyCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-all duration-300" style={{animationDelay: "0.3s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white">Drop & Request</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-2">
                <ArrowDownUp className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <CardDescription className="text-xs text-slate-400">Combined entries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{dropAndRequestCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-all duration-300" style={{animationDelay: "0.35s"}}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white">All Requests</CardTitle>
              <div className="rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20 p-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <CardDescription className="text-xs text-slate-400">Platform total</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">{totalRequests + totalDropRequests}</p>
          </CardContent>
        </Card>
        
         <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-all duration-300" style={{animationDelay: "0.4s"}}>
           <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
               <CardTitle className="text-sm font-medium text-white">Active Users</CardTitle>
               <div className="rounded-full bg-gradient-to-r from-green-500/20 to-lime-500/20 p-2">
                 <Users className="h-4 w-4 text-green-400" />
               </div>
             </div>
             <CardDescription className="text-xs text-slate-400">Platform users</CardDescription>
           </CardHeader>
           <CardContent>
             <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">{activeUsers}</p>
           </CardContent>
         </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-all duration-300" style={{animationDelay: "0.5s"}}>
          <CardHeader>
            <CardTitle className="text-white">Recent Swap Requests</CardTitle>
            <CardDescription className="text-slate-400">Your most recent swap requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="flex justify-center py-6">
                 <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent"></div>
               </div>
            ) : userRequests.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {userRequests.map((request) => (
                     <div key={request.id} className="bg-slate-700 border border-slate-600 p-3 rounded-lg hover:bg-slate-650 transition-all duration-300">
                       <div className="flex justify-between">
                         <p className="font-medium text-white">{request.desired_course || "Unnamed Course"}</p>
                        <span 
                          className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30"
                        >
                          Swap
                        </span>
                      </div>
                      {request.current_section && (
                        <p className="text-sm text-slate-400 mt-1">
                          <span className="text-slate-300">From: </span>
                          {request.current_section}
                        </p>
                      )}
                      <p className="text-sm text-slate-400">
                        <span className="text-slate-300">To: </span>
                        {request.desired_section || "Any section"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Created: {formatDate(request.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-400">No swap requests found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Create a swap request to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600 hover:bg-slate-700 transition-all duration-300" style={{animationDelay: "0.6s"}}>
          <CardHeader>
            <CardTitle className="text-white">Recent Drop Requests</CardTitle>
            <CardDescription className="text-slate-400">Your most recent drop & request entries</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent"></div>
              </div>
            ) : userDropRequests.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {userDropRequests.map((request) => (
                    <div key={request.id} className="bg-slate-700 border border-slate-600 p-3 rounded-lg hover:bg-slate-650 transition-all duration-300">
                      <div className="flex justify-between">
                        <p className="font-medium text-white">
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
                        <p className="text-sm text-slate-400 mt-1">
                          <span className="text-slate-300">Dropping: </span>
                          {request.drop_course} Section {request.drop_section_number}
                        </p>
                      )}
                      {request.request_course && (
                        <p className="text-sm text-slate-400">
                          <span className="text-slate-300">Requesting: </span>
                          {request.request_course} {request.any_section_flexible ? "(Any Section)" : `Section ${request.request_section_number}`}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Created: {formatDate(request.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-400">No drop requests found</p>
                <p className="text-sm text-slate-500 mt-1">
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