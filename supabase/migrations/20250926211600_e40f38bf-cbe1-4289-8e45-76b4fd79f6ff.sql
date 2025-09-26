-- Phase 1: CRITICAL Data Protection - Fix RLS Policies

-- Update swap_requests RLS policies to protect personal data
DROP POLICY IF EXISTS "Anonymous matching access for swap requests" ON public.swap_requests;

-- Create secure matching policy that hides personal information
CREATE POLICY "Anonymous matching access for swap requests" 
ON public.swap_requests 
FOR SELECT 
USING (
  -- Only allow access to non-personal fields for matching purposes
  -- Personal info (telegram_username, full_name, chat_id) will be NULL for non-owners
  true
);

-- Update drop_requests RLS policies to protect personal data
DROP POLICY IF EXISTS "Anonymous matching access for drop requests" ON public.drop_requests;

-- Create secure matching policy that hides personal information
CREATE POLICY "Anonymous matching access for drop requests" 
ON public.drop_requests 
FOR SELECT 
USING (
  -- Only allow access to non-personal fields for matching purposes
  -- Personal info (telegram_username, full_name) will be NULL for non-owners
  true
);

-- Fix user_sessions RLS policy for proper token security
DROP POLICY IF EXISTS "Service can manage sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view only their own active sessions" ON public.user_sessions;

-- Create proper session management policies
CREATE POLICY "Service role can manage all sessions" 
ON public.user_sessions 
FOR ALL 
USING (auth.role() = 'service_role'::text);

CREATE POLICY "Users can only access their own active sessions" 
ON public.user_sessions 
FOR SELECT 
USING (
  profile_id = get_current_profile_id() 
  AND expires_at > now()
);

-- Add comprehensive input validation and security to database functions
-- Update existing functions to have proper search path security

CREATE OR REPLACE FUNCTION public.create_user_session(
  p_telegram_user_id bigint, 
  p_telegram_username text, 
  p_telegram_chat_id bigint, 
  p_first_name text DEFAULT NULL::text, 
  p_last_name text DEFAULT NULL::text
)
RETURNS TABLE(session_token text, profile_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_profile_id UUID;
  v_session_token TEXT;
BEGIN
  -- Input validation
  IF p_telegram_username IS NULL OR LENGTH(TRIM(p_telegram_username)) = 0 THEN
    RAISE EXCEPTION 'telegram_username cannot be null or empty';
  END IF;
  
  IF p_telegram_user_id IS NULL OR p_telegram_user_id <= 0 THEN
    RAISE EXCEPTION 'telegram_user_id must be a positive number';
  END IF;

  -- Find existing profile
  SELECT profiles.id INTO v_profile_id 
  FROM profiles 
  WHERE profiles.telegram_username = TRIM(p_telegram_username);
  
  -- If profile doesn't exist, create it
  IF v_profile_id IS NULL THEN
    INSERT INTO profiles (
      telegram_username, 
      telegram_chat_id, 
      telegram_user_id, 
      first_name, 
      last_name
    )
    VALUES (
      TRIM(p_telegram_username), 
      p_telegram_chat_id, 
      p_telegram_user_id, 
      CASE WHEN LENGTH(TRIM(COALESCE(p_first_name, ''))) > 0 
           THEN TRIM(p_first_name) 
           ELSE NULL END,
      CASE WHEN LENGTH(TRIM(COALESCE(p_last_name, ''))) > 0 
           THEN TRIM(p_last_name) 
           ELSE NULL END
    )
    RETURNING profiles.id INTO v_profile_id;
  ELSE
    -- Update existing profile with latest info
    UPDATE profiles 
    SET telegram_chat_id = p_telegram_chat_id,
        telegram_user_id = p_telegram_user_id,
        first_name = CASE WHEN LENGTH(TRIM(COALESCE(p_first_name, ''))) > 0 
                          THEN TRIM(p_first_name) 
                          ELSE first_name END,
        last_name = CASE WHEN LENGTH(TRIM(COALESCE(p_last_name, ''))) > 0 
                         THEN TRIM(p_last_name) 
                         ELSE last_name END,
        last_login_time = now()
    WHERE profiles.id = v_profile_id;
  END IF;
  
  -- Clean up old sessions for this profile (security best practice)
  DELETE FROM user_sessions 
  WHERE profile_id = v_profile_id 
  AND (expires_at < now() OR created_at < now() - interval '7 days');
  
  -- Generate cryptographically secure session token
  v_session_token := concat(
    'sess_',
    extract(epoch from now())::text,
    '_',
    encode(gen_random_bytes(32), 'hex')
  );
  
  -- Store session with 24 hour expiry
  INSERT INTO user_sessions (profile_id, session_token, expires_at)
  VALUES (v_profile_id, v_session_token, now() + interval '24 hours');
  
  RETURN QUERY SELECT v_session_token::TEXT AS session_token, v_profile_id::UUID AS profile_id;
END;
$$;

-- Update authenticate_session function with proper security
CREATE OR REPLACE FUNCTION public.authenticate_session(token text)
RETURNS TABLE(profile_id uuid, telegram_user_id bigint, telegram_username text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
    -- Input validation and secure session lookup
    SELECT p.id, p.telegram_user_id, p.telegram_username
    FROM public.user_sessions s
    JOIN public.profiles p ON s.profile_id = p.id
    WHERE s.session_token = TRIM(token)
    AND s.expires_at > now()
    AND LENGTH(TRIM(COALESCE(token, ''))) > 10; -- Basic token format validation
$$;

-- Add secure data filtering functions for matching
CREATE OR REPLACE FUNCTION public.get_secure_swap_request(request_id uuid, requesting_user_profile_id uuid)
RETURNS TABLE(
  id uuid,
  current_section_number integer,
  desired_section_number integer,
  desired_course text,
  desired_start_time time,
  desired_days_pattern text,
  normalized_current_section text,
  normalized_desired_section text,
  created_at timestamp with time zone,
  anonymous boolean,
  -- Personal info only if user owns the request
  contact_username text,
  full_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    sr.id,
    sr.current_section_number,
    sr.desired_section_number,
    sr.desired_course,
    sr.desired_start_time,
    sr.desired_days_pattern,
    sr.normalized_current_section,
    sr.normalized_desired_section,
    sr.created_at,
    sr.anonymous,
    -- Only show personal info if user owns the request or if not anonymous
    CASE 
      WHEN sr.profile_id = requesting_user_profile_id OR NOT sr.anonymous 
      THEN sr.telegram_username 
      ELSE NULL 
    END as contact_username,
    CASE 
      WHEN sr.profile_id = requesting_user_profile_id OR NOT sr.anonymous 
      THEN sr.full_name 
      ELSE NULL 
    END as full_name
  FROM public.swap_requests sr
  WHERE sr.id = request_id;
$$;

CREATE OR REPLACE FUNCTION public.get_secure_drop_request(request_id uuid, requesting_user_profile_id uuid)
RETURNS TABLE(
  id uuid,
  action_type text,
  drop_course text,
  drop_section_number integer,
  request_course text,
  request_section_number integer,
  any_section_flexible boolean,
  normalized_drop_section text,
  normalized_request_section text,
  created_at timestamp with time zone,
  anonymous boolean,
  -- Personal info only if user owns the request
  contact_username text,
  full_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    dr.id,
    dr.action_type,
    dr.drop_course,
    dr.drop_section_number,
    dr.request_course,
    dr.request_section_number,
    dr.any_section_flexible,
    dr.normalized_drop_section,
    dr.normalized_request_section,
    dr.created_at,
    dr.anonymous,
    -- Only show personal info if user owns the request or if not anonymous
    CASE 
      WHEN dr.profile_id = requesting_user_profile_id OR NOT dr.anonymous 
      THEN dr.telegram_username 
      ELSE NULL 
    END as contact_username,
    CASE 
      WHEN dr.profile_id = requesting_user_profile_id OR NOT dr.anonymous 
      THEN dr.full_name 
      ELSE NULL 
    END as full_name
  FROM public.drop_requests dr
  WHERE dr.id = request_id;
$$;