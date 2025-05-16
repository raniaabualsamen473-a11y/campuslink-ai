
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Match, SwapRequest } from "@/types/swap";
import { toast } from "sonner";

export const useMatches = (userId: string | undefined, refreshTrigger: number) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [groupedMatches, setGroupedMatches] = useState<Record<string, Match[]>>({});

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

  // Fetch matches when user changes or refreshTrigger changes
  useEffect(() => {
    if (userId) {
      fetchMatches(userId);
    }
  }, [userId, refreshTrigger]);

  const fetchMatches = async (userId: string) => {
    setIsLoading(true);
    try {
      console.log("Fetching matches for user:", userId);
      
      // First, get the current user's requests to find potential matches against
      const { data: userRequests, error: userRequestsError } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('user_id', userId);
        
      if (userRequestsError) {
        console.error("Error fetching user requests:", userRequestsError);
        throw userRequestsError;
      }
      
      console.log("User requests found:", userRequests?.length || 0, userRequests);
      
      if (!userRequests || userRequests.length === 0) {
        setMatches([]);
        setIsLoading(false);
        return;
      }
      
      // For each user request, find potential matches
      const allMatches: Match[] = [];
      
      for (const request of userRequests) {
        // Skip petition requests as they don't have a current section to swap
        if (request.petition) {
          console.log("Skipping petition request:", request.id);
          continue;
        }

        console.log("Looking for matches for request:", request.id);
        console.log("Desired course:", request.desired_course);
        console.log("Current section (normalized):", request.normalized_current_section);
        console.log("Desired section (normalized):", request.normalized_desired_section);
        
        // Find potential matches - looking for people who:
        // 1. Want the course I'm offering
        // 2. Have the section I want
        // 3. Are not me
        const { data: potentialMatches, error: matchesError } = await supabase
          .from('swap_requests')
          .select('*')
          .neq('user_id', userId) // Not from the same user
          .eq('petition', false) // Not petitions (since we need both current and desired sections)
          .eq('desired_course', request.desired_course) // Same course
          .eq('normalized_current_section', request.normalized_desired_section) // They have my desired section
          .eq('normalized_desired_section', request.normalized_current_section) // They want my section
          .limit(30);
          
        if (matchesError) {
          console.error("Error finding matches:", matchesError);
          throw matchesError;
        }
        
        console.log("Perfect matches found:", potentialMatches?.length || 0);
        
        if (potentialMatches && potentialMatches.length > 0) {
          const formattedMatches: Match[] = potentialMatches.map(match => ({
            id: match.id,
            course: match.desired_course || "Unknown Course",
            currentSection: match.current_section || "Unknown Section", // Using the full section text
            desiredSection: match.desired_section || "Unknown Section", // Using the full section text
            user: match.full_name || "Anonymous Student",
            isAnonymous: match.anonymous || false,
            matchPercent: 100, // Perfect match
            type: "swap",
            dateCreated: new Date(match.created_at).toLocaleDateString(),
            user_id: match.user_id,
            telegram_username: match.telegram_username
          }));
          
          allMatches.push(...formattedMatches);
        }
        
        // If no perfect matches, look for partial matches (just same course)
        if (allMatches.length === 0) {
          console.log("No perfect matches, looking for partial matches");
          // Look for partial matches (just course match)
          const { data: partialMatches, error: partialError } = await supabase
            .from('swap_requests')
            .select('*')
            .neq('user_id', userId) // Not from the same user
            .eq('desired_course', request.desired_course) // Same course
            .limit(20);
            
          if (partialError) {
            console.error("Error finding partial matches:", partialError);
            throw partialError;
          }
          
          console.log("Partial matches found:", partialMatches?.length || 0);
          
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
                currentSection: match.current_section || "Unknown Section", // Using the full section text
                desiredSection: match.desired_section || "Unknown Section", // Using the full section text
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
      console.log("Total matches found after processing:", allMatches.length);
      
      setMatches(allMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load potential matches");
    } finally {
      setIsLoading(false);
    }
  };

  return { matches, isLoading, groupedMatches };
};
