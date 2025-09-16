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

  // Set up real-time subscription for matches table (simplified like swap matches)
  useEffect(() => {
    if (!userId) return;

    console.log("Setting up real-time subscription for drop matches");
    
    const channel = supabase
      .channel('drop-matches-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `requester_user_id.eq.${userId}`
        },
        (payload) => {
          console.log('New drop match detected for requester:', payload);
          fetchMatches(userId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `match_user_id.eq.${userId}`
        },
        (payload) => {
          console.log('New drop match detected for match user:', payload);
          fetchMatches(userId);
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchMatches = async (userId: string) => {
    setIsLoading(true);
    try {
      console.log("Fetching drop matches for user:", userId);
      
      // Get only DROP-related matches (not swap matches) 
      // Drop matches are identified by having null current_section (since droppers don't have a "current" section)
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .is('current_section', null); // Only drop matches, not swap matches
        
      if (matchesError) {
        console.error("Error fetching drop matches:", matchesError);
        throw matchesError;
      }
      
      console.log("All drop matches found:", matchesData?.length || 0);
      
      // Filter for matches relevant to the current user
      const userMatches = matchesData?.filter(match => 
        match.requester_user_id === userId || match.match_user_id === userId
      ) || [];
      
      console.log("User drop matches found:", userMatches.length);
      console.log("Raw user drop matches data:", userMatches);
      
      if (userMatches.length === 0) {
        setMatches([]);
        setIsLoading(false);
        return;
      }
      
      // Format matches for display - optimize profile lookups
      const formattedMatches: DropMatch[] = [];
      
      // Batch profile lookups to improve performance
      const requesterUserIds = userMatches
        .filter(match => match.requester_user_id !== userId)
        .map(match => match.requester_user_id)
        .filter(Boolean);
      
      let dropperProfiles: Record<string, any> = {};
      if (requesterUserIds.length > 0) {
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, telegram_username, first_name, last_name')
            .in('id', requesterUserIds);
          
          if (profiles) {
            dropperProfiles = profiles.reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {} as Record<string, any>);
          }
        } catch (error) {
          console.error("Error batch fetching dropper profiles:", error);
        }
      }
      
      for (const match of userMatches) {
        console.log("Processing drop match:", match);
        
        // In drop matches:
        // - requester_user_id = person who dropped the course (making it available)
        // - match_user_id = person who wants the course
        // - desired_section = what the wanter gets (the dropped course/section)
        
        const isDropper = match.requester_user_id === userId;
        const isWanter = match.match_user_id === userId;
        
        let displayInfo: {
          otherUserId: string;
          otherUserName: string;
          otherUserTelegram: string | null;
          type: "drop" | "request";
          actionType: string;
        } = {
          otherUserId: "",
          otherUserName: "Unknown",
          otherUserTelegram: null,
          type: "drop",
          actionType: ""
        };
        
        if (isDropper) {
          // This user dropped the course, show them who wants it
          // Use info from edge function (match_telegram and match_full_name are already populated)
          displayInfo = {
            otherUserId: match.match_user_id || "",
            otherUserName: match.match_full_name || "Anonymous Student", 
            otherUserTelegram: match.match_telegram,
            type: "drop",
            actionType: "Someone wants the course you dropped"
          };
        } else if (isWanter) {
          // This user wants the course, show them who dropped it
          const dropperProfile = dropperProfiles[match.requester_user_id || ""];
          displayInfo = {
            otherUserId: match.requester_user_id || "",
            otherUserName: dropperProfile ? 
              `${dropperProfile.first_name || ''} ${dropperProfile.last_name || ''}`.trim() || 
              dropperProfile.telegram_username || "Course Dropper" 
              : "Course Dropper",
            otherUserTelegram: dropperProfile?.telegram_username || null,
            type: "request",
            actionType: "Someone dropped a course you want"
          };
        }

        const courseName = match.desired_course || "Unknown Course";
        const sectionInfo = match.desired_section || "Unknown Section";

        formattedMatches.push({
          id: match.id,
          course: courseName,
          section: sectionInfo,
          user: displayInfo.otherUserName,
          isAnonymous: !displayInfo.otherUserName || displayInfo.otherUserName === "Course Dropper",
          type: displayInfo.type,
          dateCreated: new Date().toLocaleDateString(),
          user_id: displayInfo.otherUserId,
          telegram_username: displayInfo.otherUserTelegram,
          action_type: displayInfo.actionType
        });
      }
      console.log("Formatted drop matches:", formattedMatches);
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