
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Match } from "@/types/swap";

const MatchResults = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // In a real application, this would be a call to your backend
      // to get matches for the current user's requests
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .neq('user_id', user.id)
        .limit(5);
        
      if (error) throw error;
      
      // Mock data transformation for display purposes
      // In a real app, you'd have actual matching logic
      if (data && data.length > 0) {
        const mockMatches: Match[] = data.map(item => ({
          id: item.id,
          course: item.desired_course || "Unknown Course",
          currentSection: item.current_section,
          desiredSection: item.desired_section || "Unknown Section",
          user: item.full_name || "Anonymous Student",
          isAnonymous: item.anonymous || false,
          matchPercent: Math.floor(Math.random() * 40) + 60, // 60-100% match for demo
          type: item.petition ? "petition" : "swap",
          dateCreated: new Date(item.created_at).toLocaleDateString(),
          user_id: item.user_id,
          telegram_username: item.telegram_username
        }));
        
        setMatches(mockMatches);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load potential matches");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = (match: Match) => {
    if (match.telegram_username) {
      toast.success(`Contact information: ${match.telegram_username}`, {
        description: "You can now contact this student via Telegram."
      });
    } else {
      toast.info("Contact information not available", {
        description: "The student hasn't provided contact information."
      });
    }
  };

  return (
    <Card className="border-campus-purple/20">
      <CardHeader>
        <CardTitle className="text-campus-darkPurple">Potential Matches</CardTitle>
        <CardDescription className="text-gray-700">
          Students who might be interested in swapping with you
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading potential matches...</p>
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-black">{match.course}</h3>
                    <div className="mt-1 space-y-1">
                      {match.type === "swap" && match.currentSection && (
                        <p className="text-sm text-gray-700">
                          <span className="text-gray-500">From: </span>
                          {match.currentSection}
                        </p>
                      )}
                      <p className="text-sm text-gray-700">
                        <span className="text-gray-500">To: </span>
                        {match.desiredSection}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {match.matchPercent}% Match
                  </Badge>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-black">
                    Posted by: {match.isAnonymous ? "Anonymous Student" : match.user}
                  </p>
                  <p className="text-xs text-gray-500">{match.dateCreated}</p>
                </div>
                
                <Separator className="my-2" />
                
                <div className="mt-2 flex justify-end">
                  <Button 
                    size="sm" 
                    onClick={() => handleContact(match)}
                    className="bg-campus-purple hover:bg-campus-darkPurple text-white"
                  >
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No potential matches found</p>
            <p className="text-sm text-gray-400 mt-1">
              Submit a request to find students who want to swap with you
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchResults;
