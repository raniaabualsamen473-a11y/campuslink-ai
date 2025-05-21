
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileCompletionValues } from "@/schemas/authSchema";

interface UseAuthMethodsProps {
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const useAuthMethods = ({ setSession, setUser }: UseAuthMethodsProps) => {
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to sign in");
        return { error, data: null };
      }

      toast.success("Signed in successfully!");
      return { data: data.session, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An unexpected error occurred");
      return { error: error as Error, data: null };
    }
  };

  const checkUniversityIdExists = async (universityId: string) => {
    // Use a custom query instead of RPC to check university ID
    const { data, error } = await supabase
      .from('auth.users')
      .select('id')
      .eq('raw_user_meta_data->>university_id', universityId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the error code for "no rows returned"
      console.error("Error checking university ID:", error);
      return false;
    }
    
    // If we got data back, the ID exists
    return !!data;
  };

  const checkUniversityEmailExists = async (universityEmail: string) => {
    // Use a custom query instead of RPC to check university email
    const { data, error } = await supabase
      .from('auth.users')
      .select('id')
      .eq('raw_user_meta_data->>university_email', universityEmail)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error("Error checking university email:", error);
      return false;
    }
    
    // If we got data back, the email exists
    return !!data;
  };

  const signUpWithEmail = async (email: string, password: string, userData?: {
    telegram_username?: string;
    full_name?: string;
    university_id?: string;
    university_email?: string;
  }) => {
    try {
      // Check if university ID is already in use
      if (userData?.university_id) {
        const universityIdExists = await checkUniversityIdExists(userData.university_id);
        if (universityIdExists) {
          toast.error("This University ID is already registered with an account");
          return { error: new Error("University ID already in use"), data: null };
        }
      }
      
      // Check if university email is already in use
      if (userData?.university_email) {
        const universityEmailExists = await checkUniversityEmailExists(userData.university_email);
        if (universityEmailExists) {
          toast.error("This University email is already registered with an account");
          return { error: new Error("University email already in use"), data: null };
        }
      }

      // Prepare metadata with user profile information
      const metadata = {
        telegram_username: userData?.telegram_username || null,
        full_name: userData?.full_name || null,
        university_id: userData?.university_id || null,
        university_email: userData?.university_email || null,
      };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to sign up");
        console.error("Sign up error:", error);
        return { error, data: null };
      }

      // If email confirmation is not required, we'll have a session
      if (data.session) {
        toast.success("Account created! You are now logged in.");
        return { data: data.session, error: null };
      }
      
      // Otherwise, show a message about email confirmation
      toast.success("Account created! Check your email for verification.", {
        duration: 6000,
      });
      
      return { data: null, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An unexpected error occurred");
      return { error: error as Error, data: null };
    }
  };

  const completeUserProfile = async (profileData: ProfileCompletionValues) => {
    try {
      // Generate university email from ID
      const universityEmail = `${profileData.universityId.slice(0, 3)}${profileData.universityId}@ju.edu.jo`;
      
      // Check if university ID is already in use by another user
      const universityIdExists = await checkUniversityIdExists(profileData.universityId);
      if (universityIdExists) {
        toast.error("This University ID is already registered with an account");
        return { error: new Error("University ID already in use"), success: false };
      }
      
      // Check if university email is already in use by another user
      const universityEmailExists = await checkUniversityEmailExists(universityEmail);
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

  return {
    signOut,
    signInWithEmail,
    signUpWithEmail,
    completeUserProfile,
  };
};
