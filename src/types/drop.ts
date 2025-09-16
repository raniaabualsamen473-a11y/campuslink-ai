export interface DropRequest {
  id: string;
  user_id: string;
  profile_id?: string | null;
  action_type: 'drop_only' | 'request_only' | 'drop_and_request';
  
  // Drop fields
  drop_course?: string | null;
  drop_section_number?: number | null;
  
  // Request fields  
  request_course?: string | null;
  request_section_number?: number | null;
  any_section_flexible: boolean;
  
  // User info
  telegram_username?: string | null;
  anonymous: boolean;
  full_name?: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
  normalized_drop_section?: string | null;
  normalized_request_section?: string | null;
}

export type ActionType = 'drop_only' | 'request_only' | 'drop_and_request';

export interface DropRequestFormData {
  action_type: ActionType;
  drop_course: string;
  drop_section_number: string;
  request_course: string;
  request_section_number: string;
  any_section_flexible: boolean;
  telegram_username: string;
  anonymous: boolean;
}