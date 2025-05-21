
import { User } from "@supabase/supabase-js";

export const isProfileComplete = (user: User): boolean => {
  const metadata = user.user_metadata || {};
  
  // Check if all required profile fields are present
  return !!(
    metadata.full_name &&
    metadata.university_id &&
    metadata.university_email
  );
};
