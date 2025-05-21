
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileCompletionValues } from "@/schemas/authSchema";
import { useProfileVerification } from "./useProfileVerification";

type UseProfileCompletionProps = {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const useProfileCompletion = ({ setUser }: UseProfileCompletionProps) => {
  const { checkUniversityIdExists, checkUniversityEmailExists } = useProfileVerification();

  const completeUserProfile = async (profileData: ProfileCompletionValues) => {
    try {
      // Generate university email from name and ID
      const namePrefix = profileData.fullName.slice(0, 3).toLowerCase();
      const defaultUniversityEmail = `${namePrefix}${profileData.universityId}@ju.edu.jo`;
      
      // The actual email to use could come from a form field if we add it to the schema
      // For now, we'll just use the generated one
      const universityEmail = defaultUniversityEmail;
      
      // Check if university ID is already in use by another user
      const { exists: universityIdExists } = await checkUniversityIdExists(profileData.universityId);
      if (universityIdExists) {
        toast.error("This University ID is already registered with an account");
        return { error: new Error("University ID already in use"), success: false };
      }
      
      // Check if university email is already in use by another user
      const { exists: universityEmailExists } = await checkUniversityEmailExists(universityEmail);
      if (universityEmailExists) {
        toast.error("This University email is already registered with an account");
        return { error: new Error("University email already in use"), success: false };
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          university_id: profileData.universityId,
          university_email: universityEmail,
          telegram_username: profileData.telegramUsername || null,
        }
      });

      if (error) {
        toast.error(error.message || "Failed to update profile");
        return { error, success: false };
      }

      setUser(data.user);
      toast.success("Profile completed successfully!");
      return { success: true, error: null };
    } catch (error) {
      console.error("Profile completion error:", error);
      toast.error("An unexpected error occurred");
      return { error, success: false };
    }
  };

  return completeUserProfile;
};
