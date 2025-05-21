
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSignInWithEmail = () => {
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

  return signInWithEmail;
};
