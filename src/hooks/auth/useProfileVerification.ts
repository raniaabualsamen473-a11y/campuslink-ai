
import { supabase } from "@/integrations/supabase/client";

type VerificationResult = {
  exists: boolean;
  error?: string;
};

export const useProfileVerification = () => {
  const checkUniversityIdExists = async (universityId: string): Promise<VerificationResult> => {
    try {
      // First fetch user IDs from user_roles table
      const { data: userIdsData } = await supabase
        .from('user_roles')
        .select('user_id');
      
      if (!userIdsData || userIdsData.length === 0) {
        return { exists: false };
      }
      
      // Check each user to see if they have the matching university ID
      for (const { user_id } of userIdsData) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(user_id);
          if (userData?.user?.user_metadata?.university_id === universityId) {
            return { exists: true };
          }
        } catch (error) {
          console.error(`Error checking user ${user_id}:`, error);
        }
      }
      
      return { exists: false };
    } catch (error) {
      console.error("Error in checkUniversityIdExists:", error);
      return { exists: false, error: "Failed to check university ID" };
    }
  };

  const checkUniversityEmailExists = async (universityEmail: string): Promise<VerificationResult> => {
    try {
      // First fetch user IDs from user_roles table
      const { data: userIdsData } = await supabase
        .from('user_roles')
        .select('user_id');
      
      if (!userIdsData || userIdsData.length === 0) {
        return { exists: false };
      }
      
      // Check each user to see if they have the matching university email
      for (const { user_id } of userIdsData) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(user_id);
          if (userData?.user?.user_metadata?.university_email === universityEmail) {
            return { exists: true };
          }
        } catch (error) {
          console.error(`Error checking user ${user_id}:`, error);
        }
      }
      
      return { exists: false };
    } catch (error) {
      console.error("Error in checkUniversityEmailExists:", error);
      return { exists: false, error: "Failed to check university email" };
    }
  };

  return {
    checkUniversityIdExists,
    checkUniversityEmailExists
  };
};
