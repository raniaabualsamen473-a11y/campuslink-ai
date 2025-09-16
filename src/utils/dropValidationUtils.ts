import { supabase } from "@/integrations/supabase/client";
import { ActionType } from "@/types/drop";

export interface DropValidationFields {
  action_type: ActionType;
  drop_course: string;
  drop_section_number: string;
  request_course: string;
  request_section_number: string;
  any_section_flexible: boolean;
}

export const validateDropRequestFields = (fields: DropValidationFields): string | null => {
  const { action_type, drop_course, drop_section_number, request_course, request_section_number, any_section_flexible } = fields;

  // Validate based on action type
  if (action_type === 'drop_only') {
    if (!drop_course?.trim()) {
      return "Drop course is required for drop only requests";
    }
    if (!drop_section_number?.trim()) {
      return "Drop section number is required for drop only requests";
    }
  }

  if (action_type === 'request_only') {
    if (!request_course?.trim()) {
      return "Request course is required for request only requests";
    }
    if (!any_section_flexible && !request_section_number?.trim()) {
      return "Request section number is required unless 'Any section is fine' is checked";
    }
  }

  if (action_type === 'drop_and_request') {
    if (!drop_course?.trim()) {
      return "Drop course is required for drop and request";
    }
    if (!drop_section_number?.trim()) {
      return "Drop section number is required for drop and request";
    }
    if (!request_course?.trim()) {
      return "Request course is required for drop and request";
    }
    if (!any_section_flexible && !request_section_number?.trim()) {
      return "Request section number is required unless 'Any section is fine' is checked";
    }
    
    // Check that drop and request courses are different
    if (drop_course.trim().toLowerCase() === request_course.trim().toLowerCase()) {
      return "Drop course and request course must be different for drop and request";
    }
  }

  return null;
};

// Check if user is already enrolled in requested course (from swap_requests)
export const checkForCrossEnrollmentConflict = async (
  userId: string,
  requestCourse: string,
  requestSectionNumber?: string
): Promise<string | null> => {
  try {
    const { data: existingRequests, error } = await supabase
      .from('swap_requests')
      .select('desired_course, current_section, desired_section_number')
      .eq('user_id', userId);

    if (error) throw error;

    // Check if user is currently enrolled in the course they want to request
    const isAlreadyEnrolled = existingRequests?.some(request => {
      const currentCourseName = request.current_section?.split(' ')[0] || '';
      return currentCourseName.toLowerCase() === requestCourse.toLowerCase();
    });

    if (isAlreadyEnrolled) {
      return `You are already enrolled in ${requestCourse}. You cannot request a course you're already taking.`;
    }

    return null;
  } catch (error) {
    console.error("Error checking cross-enrollment conflict:", error);
    return "Error validating request. Please try again.";
  }
};

// Check for duplicate drop requests
export const checkForDuplicateDropRequest = async (
  userId: string,
  actionType: ActionType,
  dropCourse?: string,
  dropSectionNumber?: string,
  requestCourse?: string,
  requestSectionNumber?: string,
  excludeId?: string
): Promise<string | null> => {
  try {
    let query = supabase
      .from('drop_requests')
      .select('id, action_type, drop_course, drop_section_number, request_course, request_section_number')
      .eq('user_id', userId);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data: existingRequests, error } = await query;

    if (error) throw error;

    // Check for duplicate requests
    const isDuplicate = existingRequests?.some(request => {
      if (request.action_type !== actionType) return false;

      // For drop_only and drop_and_request, check drop course/section
      if ((actionType === 'drop_only' || actionType === 'drop_and_request') && 
          dropCourse && dropSectionNumber) {
        const dropMatches = request.drop_course?.toLowerCase() === dropCourse.toLowerCase() &&
                          request.drop_section_number === parseInt(dropSectionNumber);
        
        if (actionType === 'drop_only') return dropMatches;
        
        // For drop_and_request, also check request course
        if (actionType === 'drop_and_request' && requestCourse) {
          const requestMatches = request.request_course?.toLowerCase() === requestCourse.toLowerCase() &&
                               (requestSectionNumber ? request.request_section_number === parseInt(requestSectionNumber) : true);
          return dropMatches && requestMatches;
        }
      }

      // For request_only, check request course/section
      if (actionType === 'request_only' && requestCourse) {
        return request.request_course?.toLowerCase() === requestCourse.toLowerCase() &&
               (requestSectionNumber ? request.request_section_number === parseInt(requestSectionNumber) : true);
      }

      return false;
    });

    if (isDuplicate) {
      return "You already have a similar request. Please check your active requests below.";
    }

    return null;
  } catch (error) {
    console.error("Error checking for duplicate request:", error);
    return "Error validating request. Please try again.";
  }
};