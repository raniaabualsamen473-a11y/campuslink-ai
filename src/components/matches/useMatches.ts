
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Match, SwapRequest } from "@/types/swap";
import { toast } from "sonner";
import { sectionsMatch } from "@/utils/sectionUtils";

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

        if (!request.desired_course || !request.current_section || !request.desired_section) {
          console.log("Skipping incomplete request:", request.id);
          continue;
        }

        console.log("Looking for matches for request:", request.id);
        console.log("Desired course:", request.desired_course);
        console.log("Current section:", request.current_section);
        console.log("Desired section:", request.desired_section);
        
        // Find other users who:
        // 1. Want the course I'm offering (same course)
        // 2. Have the section I want (their current = my desired)
        // 3. Want the section I have (their desired = my current)
        // 4. Are not me
        const { data: potentialMatches, error: matchesError } = await supabase
          .from('swap_requests')
          .select('*')
          .neq('user_id', userId) // Not from the same user
          .eq('petition', false) // Not petitions (since we need both current and desired sections)
          .eq('desired_course', request.desired_course) // Same course
          .limit(50);  // Get a reasonable number of potential matches to filter locally
          
        if (matchesError) {
          console.error("Error finding matches:", matchesError);
          throw matchesError;
        }
        
        console.log("Potential matches found before filtering:", potentialMatches?.length || 0);

        // Filter potential matches locally to find perfect and near matches
        if (potentialMatches && potentialMatches.length > 0) {
          const perfectMatches = potentialMatches.filter(match => 
            // They have my desired section
            (match.normalized_current_section && request.normalized_desired_section && 
              sectionsMatch(match.current_section || "", request.desired_section || "")) &&
            // They want my current section
            (match.normalized_desired_section && request.normalized_current_section &&
              sectionsMatch(match.desired_section || "", request.current_section || ""))
          );
          
          console.log("Perfect matches found after filtering:", perfectMatches.length);

          // Convert perfect matches to our Match format
          if (perfectMatches.length > 0) {
            const formattedPerfectMatches: Match[] = perfectMatches.map(match => ({
              id: match.id,
              course: match.desired_course || "Unknown Course",
              currentSection: match.current_section || "Unknown Section",
              desiredSection: match.desired_section || "Unknown Section",
              user: match.full_name || "Anonymous Student",
              isAnonymous: match.anonymous || false,
              matchPercent: 100, // Perfect match
              type: "swap",
              dateCreated: new Date(match.created_at).toLocaleDateString(),
              user_id: match.user_id,
              telegram_username: match.telegram_username
            }));
            
            allMatches.push(...formattedPerfectMatches);
          }
          
          // If we didn't find perfect matches, look for partial matches
          if (perfectMatches.length === 0) {
            console.log("Looking for partial matches");
            
            const partialMatches = potentialMatches.filter(match => 
              // Either they have my desired section
              (match.normalized_current_section && request.normalized_desired_section && 
                sectionsMatch(match.current_section || "", request.desired_section || "")) ||
              // Or they want my current section
              (match.normalized_desired_section && request.normalized_current_section &&
                sectionsMatch(match.desired_section || "", request.current_section || ""))
            );
            
            console.log("Partial matches found:", partialMatches.length);
            
            if (partialMatches.length > 0) {
              const formattedPartialMatches: Match[] = partialMatches.map(match => {
                let matchPercent = 60; // Base match percentage for same course
                
                // Increase match percent if one of the sections matches
                if (match.normalized_current_section && request.normalized_desired_section &&
                    sectionsMatch(match.current_section || "", request.desired_section || "")) {
                  matchPercent += 20; // They have my desired section
                }
                if (match.normalized_desired_section && request.normalized_current_section &&
                    sectionsMatch(match.desired_section || "", request.current_section || "")) {
                  matchPercent += 20; // They want my section
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
              
              allMatches.push(...formattedPartialMatches);
            }
          }
        }
      }
      
      // Sort by match percentage (highest first)
      allMatches.sort((a, b) => b.matchPercent - a.matchPercent);
      // Remove duplicates (same match ID)
      const uniqueMatches = allMatches.filter((match, index, self) => 
        index === self.findIndex(m => m.id === match.id)
      );
      
      console.log("Total unique matches found after processing:", uniqueMatches.length);
      
      setMatches(uniqueMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load potential matches");
    } finally {
      setIsLoading(false);
    }
  };

  return { matches, isLoading, groupedMatches };
};
