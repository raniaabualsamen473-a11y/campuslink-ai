
export interface Match {
  id: string;
  course: string;
  currentSection: string | null;
  desiredSection: string;
  user: string;
  isAnonymous: boolean;
  matchPercent: number;
  type: "swap" | "petition";
  dateCreated: string;
  user_id: string;
  telegram_username: string | null;
}

export interface SwapRequest {
  id: string;
  user_id: string;
  anonymous: boolean;
  petition: boolean;
  telegram_username: string | null;
  desired_course: string | null;
  current_section: string | null;
  desired_section: string | null;
  notes: string | null;
  university_id: number | null;
  full_name: string | null;
  email: string | null;
  flexible_time?: boolean | null;
  flexible_days?: boolean | null;
  reason?: string | null;
  summer_format?: string | null;
  days_pattern?: string | null;
  preferred_time?: string | null;
  created_at?: string;
}
