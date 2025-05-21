
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSignInWithEmail = () => {
  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        toast.error(error.message || "Failed to sign in");
        return { error, data: null };
      }

      console.log("Sign in successful:", data.session ? "Session created" : "No session");
      toast.success("Signed in successfully!");
      return { data: data.session, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An unexpected error occurred");
      return { error: error as Error, data: null };
    }
  };

  return signInWithEmail;
};
