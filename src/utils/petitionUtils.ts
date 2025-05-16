
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PetitionRequestData = {
  course_name: string;
  section_number?: number | null;
  days_pattern?: string | null;
  start_time?: string | null;
  semester_type: string;
  summer_format?: string | null;
  anonymous?: boolean;
  telegram_username?: string | null;
  full_name?: string | null;
  email?: string | null;
  university_id?: number | null;
};

export const submitPetition = async (
  userId: string,
  petitionData: PetitionRequestData
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('petition_requests')
      .insert({
        user_id: userId,
        ...petitionData
      });

    if (error) {
      console.error("Error submitting petition:", error);
      toast.error("Failed to submit petition request");
      return false;
    }

    toast.success("Petition submitted successfully!");
    return true;
  } catch (error: any) {
    console.error("Error in petition submission:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
};

export const checkExistingPetition = async (
  userId: string, 
  courseName: string,
  daysPattern: string | null, 
  semesterType: string,
  summerFormat: string | null
): Promise<boolean> => {
  try {
    const query = supabase
      .from('petition_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('course_name', courseName)
      .eq('semester_type', semesterType);
    
    if (semesterType === 'regular') {
      query.eq('days_pattern', daysPattern);
    } else if (semesterType === 'summer') {
      query.eq('summer_format', summerFormat);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking existing petition:", error);
    return false;
  }
};
