export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      matches: {
        Row: {
          current_section: string | null
          desired_course: string | null
          desired_section: string | null
          match_full_name: string | null
          match_telegram: string | null
          match_user_id: string | null
          normalized_current_section: string | null
          normalized_desired_section: string | null
          request_id: string | null
          requester_user_id: string | null
        }
        Insert: {
          current_section?: string | null
          desired_course?: string | null
          desired_section?: string | null
          match_full_name?: string | null
          match_telegram?: string | null
          match_user_id?: string | null
          normalized_current_section?: string | null
          normalized_desired_section?: string | null
          request_id?: string | null
          requester_user_id?: string | null
        }
        Update: {
          current_section?: string | null
          desired_course?: string | null
          desired_section?: string | null
          match_full_name?: string | null
          match_telegram?: string | null
          match_user_id?: string | null
          normalized_current_section?: string | null
          normalized_desired_section?: string | null
          request_id?: string | null
          requester_user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_login_time: string | null
          last_name: string | null
          telegram_chat_id: number
          telegram_user_id: number
          telegram_username: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_login_time?: string | null
          last_name?: string | null
          telegram_chat_id: number
          telegram_user_id: number
          telegram_username: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_login_time?: string | null
          last_name?: string | null
          telegram_chat_id?: number
          telegram_user_id?: number
          telegram_username?: string
          updated_at?: string
        }
        Relationships: []
      }
      swap_requests: {
        Row: {
          anonymous: boolean | null
          chat_id: number | null
          created_at: string
          current_days_pattern: string | null
          current_section: string | null
          current_section_number: number | null
          current_start_time: string | null
          days_pattern: string | null
          desired_course: string | null
          desired_days_pattern: string
          desired_section: string | null
          desired_section_number: number
          desired_start_time: string
          full_name: string | null
          id: string
          normalized_current_section: string | null
          normalized_desired_section: string | null
          preferred_time: string | null
          profile_id: string | null
          reason: string | null
          semester_type: string | null
          summer_format: string | null
          telegram_username: string | null
          user_id: string
        }
        Insert: {
          anonymous?: boolean | null
          chat_id?: number | null
          created_at?: string
          current_days_pattern?: string | null
          current_section?: string | null
          current_section_number?: number | null
          current_start_time?: string | null
          days_pattern?: string | null
          desired_course?: string | null
          desired_days_pattern: string
          desired_section?: string | null
          desired_section_number: number
          desired_start_time: string
          full_name?: string | null
          id?: string
          normalized_current_section?: string | null
          normalized_desired_section?: string | null
          preferred_time?: string | null
          profile_id?: string | null
          reason?: string | null
          semester_type?: string | null
          summer_format?: string | null
          telegram_username?: string | null
          user_id: string
        }
        Update: {
          anonymous?: boolean | null
          chat_id?: number | null
          created_at?: string
          current_days_pattern?: string | null
          current_section?: string | null
          current_section_number?: number | null
          current_start_time?: string | null
          days_pattern?: string | null
          desired_course?: string | null
          desired_days_pattern?: string
          desired_section?: string | null
          desired_section_number?: number
          desired_start_time?: string
          full_name?: string | null
          id?: string
          normalized_current_section?: string | null
          normalized_desired_section?: string | null
          preferred_time?: string | null
          profile_id?: string | null
          reason?: string | null
          semester_type?: string | null
          summer_format?: string | null
          telegram_username?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swap_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          profile_id: string
          session_token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          profile_id: string
          session_token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          profile_id?: string
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_codes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          telegram_username: string
          used: boolean
          verification_code: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          telegram_username: string
          used?: boolean
          verification_code: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          telegram_username?: string
          used?: boolean
          verification_code?: string
        }
        Relationships: []
      }
    }
    Views: {
      swap_request_matches: {
        Row: {
          current_section: string | null
          desired_course: string | null
          desired_section: string | null
          match_full_name: string | null
          match_telegram: string | null
          match_user_id: string | null
          normalized_current_section: string | null
          normalized_desired_section: string | null
          request_id: string | null
          requester_user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      authenticate_session: {
        Args: { token: string }
        Returns: {
          profile_id: string
          telegram_user_id: number
          telegram_username: string
        }[]
      }
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      cleanup_expired_verification_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_user_session: {
        Args: {
          p_telegram_user_id: number
          p_telegram_username: string
          p_telegram_chat_id: number
          p_first_name?: string
          p_last_name?: string
        }
        Returns: {
          session_token: string
          profile_id: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
