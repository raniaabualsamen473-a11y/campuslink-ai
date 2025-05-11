import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUpWithEmail: (email: string, password: string, userData?: {
    telegram_username?: string;
    full_name?: string;
    university_id?: string;
  }) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
  signInWithEmail: async () => ({ error: null, data: null }),
  signUpWithEmail: async () => ({ error: null, data: null }),
  signInWithGoogle: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Session found" : "No session");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

      toast.success("Signed in successfully");
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
    university_id?: string;
  }) => {
    try {
      // Prepare metadata with user profile information
      const metadata = {
        telegram_username: userData?.telegram_username || null,
        full_name: userData?.full_name || null,
        university_id: userData?.university_id || null,
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

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        isLoading, 
        signOut, 
        signInWithEmail, 
        signUpWithEmail,
        signInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
