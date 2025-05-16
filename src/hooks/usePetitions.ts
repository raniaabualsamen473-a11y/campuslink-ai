
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PetitionCount = {
  course_name: string;
  days_pattern: string | null;
  semester_type: string;
  summer_format: string | null;
  supporter_count: number;
  status: 'active' | 'completed';
  id?: string;
};

export const PETITION_THRESHOLD = 20;

export function usePetitions() {
  const [activePetitions, setActivePetitions] = useState<PetitionCount[]>([]);
  const [completedPetitions, setCompletedPetitions] = useState<PetitionCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userSupportedPetitions, setUserSupportedPetitions] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchPetitions();
  }, [refreshTrigger]);

  const fetchPetitions = async () => {
    try {
      setIsLoading(true);
      
      // Get petition counts from the view
      const { data: petitionCounts, error } = await supabase
        .from('petition_counts')
        .select('*');
        
      if (error) throw error;

      // Get user's supported petitions
      const user = supabase.auth.getUser();
      if ((await user).data?.user) {
        const { data: userPetitions, error: userPetitionsError } = await supabase
          .from('petition_requests')
          .select('course_name, days_pattern, semester_type, summer_format')
          .eq('user_id', (await user).data.user.id);
          
        if (!userPetitionsError && userPetitions) {
          // Create identifiers for user's petitions
          const supportedIds = userPetitions.map(p => 
            createPetitionId(p.course_name, p.days_pattern, p.semester_type, p.summer_format)
          );
          setUserSupportedPetitions(supportedIds);
        }
      }

      // Process the petition counts
      const active: PetitionCount[] = [];
      const completed: PetitionCount[] = [];
      
      petitionCounts?.forEach(petition => {
        const petitionWithId = {
          ...petition,
          id: createPetitionId(
            petition.course_name, 
            petition.days_pattern, 
            petition.semester_type, 
            petition.summer_format
          ),
          status: petition.supporter_count >= PETITION_THRESHOLD ? 'completed' : 'active'
        } as PetitionCount;
        
        if (petition.supporter_count >= PETITION_THRESHOLD) {
          completed.push(petitionWithId);
        } else {
          active.push(petitionWithId);
        }
      });
      
      setActivePetitions(active);
      setCompletedPetitions(completed);
    } catch (error: any) {
      console.error("Error fetching petitions:", error.message);
      toast.error("Failed to load petitions");
    } finally {
      setIsLoading(false);
    }
  };

  const createPetitionId = (
    courseName: string, 
    daysPattern: string | null, 
    semesterType: string, 
    summerFormat: string | null
  ): string => {
    return `${courseName}|${daysPattern || ''}|${semesterType}|${summerFormat || ''}`;
  };

  const supportPetition = async (petition: PetitionCount) => {
    const user = supabase.auth.getUser();
    
    if (!(await user).data?.user) {
      toast.error("You must be logged in to support petitions");
      return false;
    }
    
    try {
      const newPetition = {
        user_id: (await user).data.user.id,
        course_name: petition.course_name,
        days_pattern: petition.days_pattern,
        semester_type: petition.semester_type,
        summer_format: petition.summer_format
      };
      
      const { error } = await supabase
        .from('petition_requests')
        .insert(newPetition);
        
      if (error) throw error;
      
      toast.success("You've successfully supported this petition!");
      setRefreshTrigger(prev => prev + 1);
      return true;
    } catch (error: any) {
      console.error("Error supporting petition:", error.message);
      toast.error("Failed to support petition");
      return false;
    }
  };

  const isUserSupporting = (petitionId: string): boolean => {
    return userSupportedPetitions.includes(petitionId);
  };

  const generatePetitionForm = async (petition: PetitionCount) => {
    // In a real application, this would generate a formal petition form
    // For now, we'll just show a success message
    toast.success("Petition form has been generated and sent to faculty!");
  };

  return {
    activePetitions,
    completedPetitions,
    isLoading,
    supportPetition,
    isUserSupporting,
    generatePetitionForm,
    refreshPetitions: () => setRefreshTrigger(prev => prev + 1)
  };
}
