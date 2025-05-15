
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { sectionsMatch } from "@/utils/sectionUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Match } from "@/types/swap";
import { MessageSquare } from "lucide-react";

interface MatchResultsProps {
  refreshTrigger?: number; // Prop to trigger refresh when new request is submitted
}

const MatchResults = ({ refreshTrigger = 0 }: MatchResultsProps) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [groupedMatches, setGroupedMatches] = useState<Record<string, Match[]>>({});

  // Refresh matches when user changes or refreshTrigger changes
  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user, refreshTrigger]);

  // Group matches by course when the matches state updates
  useEffect(() => {
    const grouped = matches.reduce<Record<string, Match[]>>((acc, match) => {
      const courseName = match.course;
      if (!acc[courseName]) {
        acc[courseName] = [];
      }
      acc[courseName].push(match);
      return acc;
    }, {});
    
    setGroupedMatches(grouped);
  }, [matches]);

  const fetchMatches = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First, get the current user's requests to find potential matches against
      const { data: userRequests, error: userRequestsError } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('user_id', user.id);
        
      if (userRequestsError) throw userRequestsError;
      
      if (!userRequests || userRequests.length === 0) {
        setMatches([]);
        setIsLoading(false);
        return;
      }
      
      // For each user request, find potential matches
      const allMatches: Match[] = [];
      
      for (const request of userRequests) {
        // Skip petition requests as they don't have a current section to swap
        if (request.petition) continue;
        
        // Find potential matches by comparing normalized fields
        const { data: potentialMatches, error: matchesError } = await supabase
          .from('swap_requests')
          .select('*')
          .neq('user_id', user.id) // Not from the same user
          .ilike('desired_course', request.desired_course) // Same course (case insensitive)
          .eq('normalized_desired_section', request.normalized_current_section) // They want my section
          .eq('normalized_current_section', request.normalized_desired_section) // They have my desired section
          .limit(30);
          
        if (matchesError) throw matchesError;
        
        if (potentialMatches && potentialMatches.length > 0) {
          const formattedMatches: Match[] = potentialMatches.map(match => ({
            id: match.id,
            course: match.desired_course || "Unknown Course",
            currentSection: match.current_section || "Unknown Section",
            desiredSection: match.desired_section || "Unknown Section",
            user: match.full_name || "Anonymous Student",
            isAnonymous: match.anonymous || false,
            matchPercent: 100, // Perfect match
            type: match.petition ? "petition" : "swap",
            dateCreated: new Date(match.created_at).toLocaleDateString(),
            user_id: match.user_id,
            telegram_username: match.telegram_username
          }));
          
          allMatches.push(...formattedMatches);
        }
      }
      
      // Handle case where no perfect matches were found - show partial matches
      if (allMatches.length === 0) {
        // Look for partial matches (just course match)
        for (const request of userRequests) {
          const { data: partialMatches, error: partialError } = await supabase
            .from('swap_requests')
            .select('*')
            .neq('user_id', user.id) // Not from the same user
            .ilike('desired_course', request.desired_course) // Same course (case insensitive)
            .limit(20);
            
          if (partialError) throw partialError;
          
          if (partialMatches && partialMatches.length > 0) {
            const formattedMatches: Match[] = partialMatches.map(match => {
              let matchPercent = 60; // Base match percentage for same course
              
              // Increase match percent if one of the sections matches
              if (match.normalized_desired_section === request.normalized_current_section) {
                matchPercent += 20; // They want my section
              }
              if (match.normalized_current_section === request.normalized_desired_section) {
                matchPercent += 20; // They have my desired section
              }
              
              return {
                id: match.id,
                course: match.desired_course || "Unknown Course",
                currentSection: match.current_section || "Unknown Section",
                desiredSection: match.desired_section || "Unknown Section",
                user: match.full_name || "Anonymous Student",
                isAnonymous: match.anonymous || false,
                matchPercent,
                type: match.petition ? "petition" : "swap",
                dateCreated: new Date(match.created_at).toLocaleDateString(),
                user_id: match.user_id,
                telegram_username: match.telegram_username
              };
            });
            
            allMatches.push(...formattedMatches);
          }
        }
      }
      
      // Sort by match percentage (highest first)
      allMatches.sort((a, b) => b.matchPercent - a.matchPercent);
      
      setMatches(allMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load potential matches");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = (match: Match) => {
    if (match.telegram_username) {
      openTelegramChat(match.telegram_username);
    } else {
      toast.info("Contact information not available", {
        description: "The student hasn't provided contact information."
      });
    }
  };

  const openTelegramChat = (username: string | null) => {
    if (!username) {
      toast.info("Telegram username not available", {
        description: "The student hasn't provided their Telegram username."
      });
      return;
    }
    
    // Add @ symbol if not present
    const formattedUsername = username.startsWith('@') ? username : '@' + username;
    // Remove @ symbol for the URL
    const cleanUsername = formattedUsername.substring(1);
    window.open(`https://t.me/${cleanUsername}`, '_blank');
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
        ) : Object.keys(groupedMatches).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedMatches).map(([courseName, courseMatches]) => (
              <div key={courseName} className="space-y-4">
                <h3 className="font-semibold text-lg text-black border-b pb-2">{courseName}</h3>
                
                <div className="space-y-4">
                  {courseMatches.map((match) => (
                    <div key={match.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
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
                        <Badge variant="outline" className={`${
                          match.matchPercent === 100 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}>
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
                      
                      <div className="mt-2 flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openTelegramChat(match.telegram_username)}
                          className="text-blue-500 border-blue-300 hover:bg-blue-50"
                          title="Chat on Telegram"
                        >
                          <MessageSquare size={16} className="mr-1" />
                          Chat
                        </Button>
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
