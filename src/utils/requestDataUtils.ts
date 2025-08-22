
import { SwapRequest } from "@/types/swap";
import { v4 as uuidv4 } from 'uuid';
import { normalizeSection } from "@/utils/sectionUtils";
import { formatDaysPattern, formatTime } from "@/utils/timeSlotUtils";

/**
 * Creates a structured SwapRequest object from form data
 */
export const prepareRequestData = (
  editingRequestId: string | null,
  userId: string,
  userMetadata: any,
  isAnonymous: boolean,
  requestType: string,
  finalCourseName: string,
  currentSectionNumber: string,
  currentDaysPattern: string,
  currentStartTime: string,
  desiredSectionNumber: string,
  desiredDaysPattern: string,
  desiredStartTime: string,
  reason: string,
  semester: string,
  summerFormat: string,
  telegramUsername: string
): SwapRequest => {
  // Create string representation of sections for backwards compatibility
  const currentSectionString = `Section ${currentSectionNumber} (${formatDaysPattern(currentDaysPattern, semester)} ${formatTime(currentStartTime)})`;
    
  const desiredSectionString = `Section ${desiredSectionNumber} (${formatDaysPattern(desiredDaysPattern, semester)} ${formatTime(desiredStartTime)})`;
  
  return {
    id: editingRequestId || uuidv4(),
    user_id: userId,
    profile_id: userId, // Set profile_id to link with profiles table
    anonymous: isAnonymous,
    
    telegram_username: telegramUsername,
    desired_course: finalCourseName,
    current_section: currentSectionString,
    desired_section: desiredSectionString,
    normalized_current_section: normalizeSection(currentSectionString),
    normalized_desired_section: normalizeSection(desiredSectionString),
    university_id: userMetadata?.university_id,
    full_name: isAnonymous ? null : userMetadata?.full_name,
    email: userMetadata?.email,
    
    // Structured section data
    current_section_number: parseInt(currentSectionNumber),
    current_days_pattern: currentDaysPattern,
    current_start_time: currentStartTime,
    
    desired_section_number: parseInt(desiredSectionNumber),
    desired_days_pattern: desiredDaysPattern,
    desired_start_time: desiredStartTime,
    
    reason: null,
    summer_format: semester === "summer" ? summerFormat : null,
    days_pattern: null,
    preferred_time: null
  };
};

/**
 * Populates form state with existing request data
 */
export const mapRequestDataToForm = (data: SwapRequest): {
  courseName: string;
  requestType: string;
  isAnonymous: boolean;
  telegramUsername: string;
  semester: string;
  summerFormat: string;
  reason: string;
  currentSectionNumber: string;
  currentDaysPattern: string;
  currentStartTime: string;
  desiredSectionNumber: string;
  desiredDaysPattern: string;
  desiredStartTime: string;
} => {
  return {
    courseName: data.desired_course || "",
    requestType: "swap",
    isAnonymous: data.anonymous || false,
    telegramUsername: data.telegram_username || "",
    semester: data.summer_format ? "summer" : "regular",
    summerFormat: data.summer_format || "everyday",
    reason: data.reason || "",
    
    // Set structured section data
    currentSectionNumber: data.current_section_number ? data.current_section_number.toString() : "",
    currentDaysPattern: data.current_days_pattern || "stt",
    currentStartTime: data.current_start_time || "",
    
    desiredSectionNumber: data.desired_section_number ? data.desired_section_number.toString() : "",
    desiredDaysPattern: data.desired_days_pattern || "stt",
    desiredStartTime: data.desired_start_time || ""
  };
};
