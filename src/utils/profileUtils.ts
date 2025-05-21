
import { User } from "@supabase/supabase-js";

/**
 * Checks if a user's profile has all required fields
 * @param user Supabase user object
 * @returns boolean indicating if the profile is complete
 */
export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  
  const userData = user.user_metadata;
  
  // Check required fields
  const hasFirstName = !!userData?.first_name;
  const hasSecondName = !!userData?.second_name;
  const hasLastName = !!userData?.last_name;
  const hasUniversityId = !!userData?.university_id;
  const hasTelegramUsername = !!userData?.telegram_username;
  
  return hasFirstName && hasSecondName && hasLastName && hasUniversityId && hasTelegramUsername;
};

/**
 * Generates a university email from a university ID
 * @param universityId 7-digit university ID
 * @returns formatted university email
 */
export const generateUniversityEmail = (universityId: string): string => {
  if (!universityId || universityId.length !== 7 || !/^\d+$/.test(universityId)) {
    return '';
  }
  
  // Sample logic to generate email prefix
  // In a real app, this would be based on actual university rules
  const prefix = `abc${universityId}`;
  return `${prefix}@ju.edu.jo`;
};
