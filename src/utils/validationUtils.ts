
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SectionData {
  number: number;
  pattern: string;
  time: string;
}

/**
 * Validates that all required form fields are completed
 */
export const validateSwapFormFields = (
  requestType: string,
  courseName: string,
  customCourseName: string,
  currentSectionNumber: string,
  currentStartTime: string,
  desiredSectionNumber: string,
  desiredStartTime: string,
  telegramUsername: string
): boolean => {
  const finalCourseName = customCourseName || courseName;
  
  if (!finalCourseName) {
    toast.error("Please select or enter a course name");
    return false;
  }
  
  if (requestType === "swap") {
    console.log('Validating current section fields:', { currentSectionNumber, currentStartTime });
    if (!currentSectionNumber || !currentStartTime) {
      toast.error("Please complete all current section fields", {
        description: `Missing: ${!currentSectionNumber ? 'section number' : ''} ${!currentStartTime ? 'start time' : ''}`
      });
      return false;
    }
    
    // Check if current and desired sections are identical
    if (currentSectionNumber === desiredSectionNumber) {
      toast.error("Current section and desired section cannot be the same");
      return false;
    }
  }
  
  if (!desiredSectionNumber || !desiredStartTime) {
    toast.error("Please complete all desired section fields");
    return false;
  }
  

  return true;
};

/**
 * Checks for duplicate requests to prevent users from submitting the same request multiple times
 */
export const checkForDuplicateRequest = async (
  userId: string, 
  courseName: string, 
  currentSectionData: SectionData | null, 
  desiredSectionData: SectionData | null
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('desired_course', courseName);
    
    if (error) throw error;
    
    if (currentSectionData) {
      return checkForDuplicateSwap(data, currentSectionData, desiredSectionData);
    } else {
      return checkForDuplicatePetition(data, desiredSectionData);
    }
  } catch (error: any) {
    console.error("Error checking for duplicate requests:", error);
    return false; // Allow submission if check fails
  }
};

/**
 * Checks for duplicate swap requests
 */
const checkForDuplicateSwap = (
  existingRequests: any[], 
  currentSection: SectionData, 
  desiredSection: SectionData | null
): boolean => {
  return existingRequests?.some(req => 
    req.current_section_number === currentSection.number && 
    req.current_days_pattern === currentSection.pattern &&
    req.current_start_time === currentSection.time &&
    req.desired_section_number === desiredSection?.number &&
    req.desired_days_pattern === desiredSection?.pattern &&
    req.desired_start_time === desiredSection?.time
  ) || false;
};

/**
 * Checks for duplicate petition requests
 */
const checkForDuplicatePetition = (
  existingRequests: any[], 
  desiredSection: SectionData | null
): boolean => {
  return existingRequests?.some(req => 
    req.petition && 
    req.desired_section_number === desiredSection?.number &&
    req.desired_days_pattern === desiredSection?.pattern &&
    req.desired_start_time === desiredSection?.time
  ) || false;
};
