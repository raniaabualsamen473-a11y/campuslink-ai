-- Fix security linter issues from previous migration

-- Remove SECURITY DEFINER from views (ERROR 1 & 2 from linter)
-- Replace secure views without SECURITY DEFINER
DROP VIEW IF EXISTS public.secure_swap_requests;
DROP VIEW IF EXISTS public.secure_drop_requests;

-- Recreate views without SECURITY DEFINER (using RLS instead)
CREATE VIEW public.secure_swap_requests AS
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
  -- Personal info filtered based on RLS and ownership
  CASE 
    WHEN sr.profile_id = get_current_profile_id() OR NOT COALESCE(sr.anonymous, true)
    THEN sr.telegram_username 
    ELSE NULL 
  END as contact_username,
  CASE 
    WHEN sr.profile_id = get_current_profile_id() OR NOT COALESCE(sr.anonymous, true)
    THEN sr.full_name 
    ELSE NULL 
  END as full_name
FROM public.swap_requests sr;

CREATE VIEW public.secure_drop_requests AS
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
  -- Personal info filtered based on RLS and ownership
  CASE 
    WHEN dr.profile_id = get_current_profile_id() OR NOT COALESCE(dr.anonymous, true)
    THEN dr.telegram_username 
    ELSE NULL 
  END as contact_username,
  CASE 
    WHEN dr.profile_id = get_current_profile_id() OR NOT COALESCE(dr.anonymous, true)
    THEN dr.full_name 
    ELSE NULL 
  END as full_name
FROM public.drop_requests dr;

-- Fix function search path issues (WARN 3 from linter)
-- Add SET search_path to all functions that don't have it

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.user_sessions 
  WHERE expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT role FROM public.user_roles WHERE user_id = $1
    UNION
    SELECT 'user'::app_role
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.verification_codes 
  WHERE expires_at < now() OR used = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_swap_request()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    'https://pbqpbupsmzafbzlxccov.supabase.co/functions/v1/forward-swap-request',
    jsonb_build_object('record', to_jsonb(NEW)),
    '{}'::jsonb,
    jsonb_build_object('Content-Type', 'application/json')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_n8n_swap_request()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://artificialdynamo04.app.n8n.cloud/webhook/swap-request',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_edge_function_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM pg_notify('swap_requests_inserted', json_build_object('record', NEW)::text);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_drop_request_sections()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Normalize drop section if present
  IF NEW.drop_course IS NOT NULL AND NEW.drop_section_number IS NOT NULL THEN
    NEW.normalized_drop_section = LOWER(TRIM(NEW.drop_course)) || '_' || NEW.drop_section_number::text;
  END IF;
  
  -- Normalize request section if present and specific
  IF NEW.request_course IS NOT NULL AND NEW.request_section_number IS NOT NULL AND NOT NEW.any_section_flexible THEN
    NEW.normalized_request_section = LOWER(TRIM(NEW.request_course)) || '_' || NEW.request_section_number::text;
  ELSIF NEW.request_course IS NOT NULL AND NEW.any_section_flexible THEN
    NEW.normalized_request_section = LOWER(TRIM(NEW.request_course)) || '_flexible';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_drop_request_matching()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Call the match-drop-requests edge function asynchronously
  PERFORM net.http_post(
    url := 'https://pbqpbupsmzafbzlxccov.supabase.co/functions/v1/match-drop-requests',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'record', row_to_json(NEW)
    )
  );
  
  RETURN NEW;
END;
$$;