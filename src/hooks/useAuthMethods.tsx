
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

  const signUpWithEmail = async (email: string, password: string, userData?: {
    telegram_username?: string;
    full_name?: string;
    first_name?: string;
    second_name?: string;
    third_name?: string;
    last_name?: string;
    university_id?: string;
    university_email?: string;
  }) => {
    try {
      // Prepare metadata with user profile information
      const metadata = {
        telegram_username: userData?.telegram_username || null,
        full_name: userData?.full_name || null,
        first_name: userData?.first_name || null,
        second_name: userData?.second_name || null,
        third_name: userData?.third_name || null,
        last_name: userData?.last_name || null,
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

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) {
        toast.error(error.message || "Failed to sign in with Google");
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const completeUserProfile = async (profileData: ProfileCompletionValues) => {
    try {
      // Prepare full name from parts
      const fullName = profileData.thirdName 
        ? `${profileData.firstName} ${profileData.secondName} ${profileData.thirdName} ${profileData.lastName}`
        : `${profileData.firstName} ${profileData.secondName} ${profileData.lastName}`;
      
      // Generate university email from ID
      const universityEmail = `${profileData.universityId.slice(0, 3)}${profileData.universityId}@ju.edu.jo`;
      
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          first_name: profileData.firstName,
          second_name: profileData.secondName,
          third_name: profileData.thirdName || null,
          last_name: profileData.lastName,
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
    signInWithGoogle,
    completeUserProfile,
  };
};
