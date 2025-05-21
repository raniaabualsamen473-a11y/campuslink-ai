
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfileVerification } from "./useProfileVerification";

type UserSignupData = {
  telegram_username?: string;
  full_name?: string;
  first_name?: string;
  second_name?: string;
  third_name?: string;
  last_name?: string;
  university_id?: string;
  university_email?: string;
};

// Define the base URL for the application
const APP_BASE_URL = "https://preview--campuslink-ai.lovable.app";

export const useSignUpWithEmail = () => {
  const { checkUniversityIdExists, checkUniversityEmailExists } = useProfileVerification();

  const sendWelcomeEmail = async (email: string, name: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: {
          type: "welcome",
          email: email,
          name: name || email,
          details: {}
        }
      });
      
      if (error) {
        console.error("Error sending welcome email:", error);
      }
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  };

  const signUpWithEmail = async (email: string, password: string, userData?: UserSignupData) => {
    try {
      // Check if university ID is already in use
      if (userData?.university_id) {
        const { exists: universityIdExists } = await checkUniversityIdExists(userData.university_id);
        if (universityIdExists) {
          toast.error("This University ID is already registered with an account");
          return { error: new Error("University ID already in use"), data: null };
        }
      }
      
      // Check if university email is already in use
      if (userData?.university_email) {
        const { exists: universityEmailExists } = await checkUniversityEmailExists(userData.university_email);
        if (universityEmailExists) {
          toast.error("This University email is already registered with an account");
          return { error: new Error("University email already in use"), data: null };
        }
      }

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

      // Use the hardcoded APP_BASE_URL instead of window.location.origin
      const redirectUrl = `${APP_BASE_URL}/auth?verified=true`;
      console.log("Using redirect URL for verification:", redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: redirectUrl
        },
      });

      if (error) {
        // Handle specific errors
        if (error.message.includes("User already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else if (error.message.includes("rate limit")) {
          toast.error("Too many attempts. Please try again later.");
        } else {
          toast.error(error.message || "Failed to sign up");
        }
        console.error("Sign up error:", error);
        return { error, data: null };
      }

      // If email confirmation is not required, we'll have a session
      if (data.session) {
        toast.success("Account created! You are now logged in.");
        
        // Send welcome email if user is immediately logged in
        if (data.user) {
          await sendWelcomeEmail(email, userData?.full_name || email.split('@')[0]);
        }
        
        return { data: data.session, error: null };
      }
      
      // Otherwise, show a message about email confirmation
      toast.success("Account created! Please check your email for verification.", {
        duration: 8000,
      });
      
      return { data: null, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An unexpected error occurred");
      return { error: error as Error, data: null };
    }
  };

  return signUpWithEmail;
};
