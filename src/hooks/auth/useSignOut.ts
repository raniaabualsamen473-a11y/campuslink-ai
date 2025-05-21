
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSignOut = () => {
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  return signOut;
};
