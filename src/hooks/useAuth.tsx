
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthSession } from "./useAuthSession";
import { useAuthMethods } from "./useAuthMethods";

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
  const { session, user, isLoading, setSession, setUser, setIsLoading } = useAuthSession();
  const { signOut, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuthMethods({ setSession, setUser });

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
