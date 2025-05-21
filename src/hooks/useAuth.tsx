
import { useState, createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useAuthSession } from "./useAuthSession";
import { useAuthMethods } from "./useAuthMethods";
import { ProfileCompletionValues } from "@/schemas/authSchema";
import { isProfileComplete } from "@/utils/profileUtils";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isProfileComplete: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUpWithEmail: (email: string, password: string, userData?: {
    telegram_username?: string;
    full_name?: string;
    first_name?: string;
    second_name?: string;
    third_name?: string;
    last_name?: string;
    university_id?: string;
    university_email?: string;
  }) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signInWithGoogle: () => Promise<void>;
  completeUserProfile: (profileData: ProfileCompletionValues) => Promise<{
    success: boolean;
    error: Error | null;
  }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isProfileComplete: false,
  signOut: async () => {},
  signInWithEmail: async () => ({ error: null, data: null }),
  signUpWithEmail: async () => ({ error: null, data: null }),
  signInWithGoogle: async () => {},
  completeUserProfile: async () => ({ success: false, error: null }),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { session, user, isLoading, setSession, setUser, setIsLoading } = useAuthSession();
  const { signOut, signInWithEmail, signUpWithEmail, signInWithGoogle, completeUserProfile } = useAuthMethods({ setSession, setUser });
  
  const profileComplete = !user ? false : isProfileComplete(user);

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        isLoading, 
        isProfileComplete: profileComplete,
        signOut, 
        signInWithEmail, 
        signUpWithEmail,
        signInWithGoogle,
        completeUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
