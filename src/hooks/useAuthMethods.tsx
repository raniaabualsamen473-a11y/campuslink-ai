import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

      toast.success("Signed in successfully! Redirecting to your swap requests...");
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
        toast.success("Account created! You are now logged in. Redirecting to your swap requests...");
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
          redirectTo: window.location.origin + '/swap-requests',
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

  return {
    signOut,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  };
};
