import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface UserProfile {
  profile_id: string;
  telegram_user_id: number;
  telegram_username: string;
  first_name?: string;
  last_name?: string;
  last_login_time?: string;
  // Backward compatibility properties
  id: string; // Maps to profile_id
  email: string | null; // For components that expect email
}

interface AuthContextType {
  user: UserProfile | null;
  session: any; // For backward compatibility
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithTelegram: (telegramUser: TelegramUser) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  signInWithTelegram: async () => ({ success: false }),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session token
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const sessionToken = localStorage.getItem('telegram_session_token');
      if (!sessionToken) {
        setIsLoading(false);
        return;
      }

      // Validate session with our backend
      const { data, error } = await supabase.functions.invoke('telegram-auth', {
        body: { session_token: sessionToken }
      });

      if (error || !data?.success) {
        console.log('Session validation failed:', error);
        localStorage.removeItem('telegram_session_token');
        setUser(null);
      } else {
        console.log('Session validated successfully:', data.user);
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      localStorage.removeItem('telegram_session_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithTelegram = async (telegramUser: TelegramUser) => {
    try {
      console.log('Signing in with Telegram user:', telegramUser);

      // Send auth data to our Edge Function
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: telegramUser
      });

      if (error) {
        console.error('Telegram auth error:', error);
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        console.error('Telegram auth failed:', data);
        return { success: false, error: data?.error || 'Authentication failed' };
      }

      // Store session token
      const sessionToken = data.session_token;
      const profileId = data.profile_id;
      
      localStorage.setItem('telegram_session_token', sessionToken);

      // Set user data
      const userProfile: UserProfile = {
        profile_id: profileId,
        telegram_user_id: telegramUser.id,
        telegram_username: telegramUser.username || `user_${telegramUser.id}`,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        // Backward compatibility
        id: profileId,
        email: null, // Telegram doesn't provide email
      };

      setUser(userProfile);
      console.log('Successfully signed in with Telegram');
      
      return { success: true };
    } catch (error) {
      console.error('Telegram sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      const sessionToken = localStorage.getItem('telegram_session_token');
      if (sessionToken) {
        // Call logout endpoint
        await supabase.functions.invoke('telegram-auth', {
          body: { session_token: sessionToken },
          method: 'DELETE'
        });
      }
      
      localStorage.removeItem('telegram_session_token');
      setUser(null);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even if server call fails
      localStorage.removeItem('telegram_session_token');
      setUser(null);
      toast.success("Signed out successfully");
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session: user ? { user } : null, // Backward compatibility
        isLoading, 
        signOut, 
        signInWithTelegram
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);