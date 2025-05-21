
import { Session, User } from "@supabase/supabase-js";
import { ProfileCompletionValues } from "@/schemas/authSchema";
import { useSignOut } from "./auth/useSignOut";
import { useSignInWithEmail } from "./auth/useSignInWithEmail";
import { useSignUpWithEmail } from "./auth/useSignUpWithEmail";
import { useProfileCompletion } from "./auth/useProfileCompletion";

interface UseAuthMethodsProps {
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const useAuthMethods = ({ setSession, setUser }: UseAuthMethodsProps) => {
  const signOut = useSignOut();
  const signInWithEmail = useSignInWithEmail();
  const signUpWithEmail = useSignUpWithEmail();
  const completeUserProfile = useProfileCompletion({ setUser });

  return {
    signOut,
    signInWithEmail,
    signUpWithEmail,
    completeUserProfile,
  };
};
