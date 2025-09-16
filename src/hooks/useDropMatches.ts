import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DropMatch {
  id: string;
  course: string;
  section: string;
  user: string;
  isAnonymous: boolean;
  type: "drop" | "request";
  dateCreated: string;
  user_id: string;
  telegram_username?: string;
  action_type: string;
}

export const useDropMatches = (userId: string | undefined, refreshTrigger: number) => {
  const [matches, setMatches] = useState<DropMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [groupedMatches, setGroupedMatches] = useState<Record<string, DropMatch[]>>({});

  // Group matches by course when the matches state updates
  useEffect(() => {
    const grouped = matches.reduce<Record<string, DropMatch[]>>((acc, match) => {
      const courseName = match.course;
      if (!acc[courseName]) {
        acc[courseName] = [];
      }
      acc[courseName].push(match);
      return acc;
    }, {});
    
    setGroupedMatches(grouped);
  }, [matches]);

  // Fetch matches when user changes or refreshTrigger changes
  useEffect(() => {
    if (userId) {
      fetchMatches(userId);
    }
  }, [userId, refreshTrigger]);

  const fetchMatches = async (userId: string) => {
    setIsLoading(true);
    try {
      console.log("Fetching drop matches for user:", userId);
      
      // Get matches where the user is either the requester or the match_user
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`requester_user_id.eq.${userId},match_user_id.eq.${userId}`);
        
      if (matchesError) {
        console.error("Error fetching drop matches:", matchesError);
        throw matchesError;
      }
      
      console.log("Drop matches found:", matchesData?.length || 0);
      
      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        setIsLoading(false);
        return;
      }
      
      // Format matches for display
      const formattedMatches: DropMatch[] = matchesData.map(match => {
        // Determine if this user is the requester or the match
        const isRequester = match.requester_user_id === userId;
        const otherUserId = isRequester ? match.match_user_id : match.requester_user_id;
        const otherUserName = isRequester ? match.match_full_name : "Course Dropper";
        const otherUserTelegram = isRequester ? match.match_telegram : null;

        return {
          id: match.id,
          course: match.desired_course || "Unknown Course",
          section: isRequester ? match.current_section || "Unknown Section" : match.desired_section || "Unknown Section",
          user: otherUserName || "Anonymous Student",
          isAnonymous: !otherUserName,
          type: isRequester ? "request" : "drop",
          dateCreated: new Date().toLocaleDateString(), // matches don't have created_at
          user_id: otherUserId || "",
          telegram_username: otherUserTelegram,
          action_type: isRequester ? "Someone wants to take your spot" : "Someone is dropping a course you want"
        };
      });
      
      console.log("Formatted drop matches:", formattedMatches.length);
      setMatches(formattedMatches);
    } catch (error) {
      console.error("Error fetching drop matches:", error);
      toast.error("Failed to load potential matches");
    } finally {
      setIsLoading(false);
    }
  };

  return { matches, isLoading, groupedMatches };
};