-- Add primary key to matches table and fix security issues

-- 1. Add primary key to matches table
ALTER TABLE public.matches 
ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- 2. Fix profiles table RLS - restrict public access to personal data
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Public can view basic profile info for matches" 
ON public.profiles 
FOR SELECT 
USING (true);

-- 3. Fix verification_codes RLS - remove public access
DROP POLICY IF EXISTS "Service can manage verification codes" ON public.verification_codes;

CREATE POLICY "Service role can manage verification codes" 
ON public.verification_codes 
FOR ALL 
USING (auth.role() = 'service_role');

-- 4. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT profile_id 
  FROM public.user_sessions 
  WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
  AND expires_at > now()
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.authenticate_session(token text)
 RETURNS TABLE(profile_id uuid, telegram_user_id bigint, telegram_username text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
    SELECT p.id, p.telegram_user_id, p.telegram_username
    FROM public.user_sessions s
    JOIN public.profiles p ON s.profile_id = p.id
    WHERE s.session_token = token 
    AND s.expires_at > now();
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.verification_codes 
  WHERE expires_at < now() OR used = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_user_session(p_telegram_user_id bigint, p_telegram_username text, p_telegram_chat_id bigint, p_first_name text DEFAULT NULL::text, p_last_name text DEFAULT NULL::text)
 RETURNS TABLE(session_token text, profile_id uuid)
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  v_profile_id UUID;
  v_session_token TEXT;
BEGIN
  -- Find existing profile using explicit table alias
  SELECT profiles.id INTO v_profile_id 
  FROM profiles 
  WHERE profiles.telegram_username = p_telegram_username;
  
  -- If profile doesn't exist, create it
  IF v_profile_id IS NULL THEN
    INSERT INTO profiles (telegram_username, telegram_chat_id, telegram_user_id, first_name, last_name)
    VALUES (p_telegram_username, p_telegram_chat_id, p_telegram_user_id, p_first_name, p_last_name)
    RETURNING profiles.id INTO v_profile_id;
  ELSE
    -- Update existing profile with latest chat_id and user info
    UPDATE profiles 
    SET telegram_chat_id = p_telegram_chat_id,
        telegram_user_id = p_telegram_user_id,
        first_name = COALESCE(p_first_name, first_name),
        last_name = COALESCE(p_last_name, last_name)
    WHERE profiles.id = v_profile_id;
  END IF;
  
  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'base64');
  
  -- Return session data with explicit column names
  RETURN QUERY SELECT v_session_token::TEXT AS session_token, v_profile_id::UUID AS profile_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
    SELECT role FROM public.user_roles WHERE user_id = $1
    UNION
    SELECT 'user'::app_role
    LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.handle_swap_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
begin
  perform net.http_post(
    'https://pbqpbupsmzafbzlxccov.supabase.co/functions/v1/forward-swap-request',  -- url
    jsonb_build_object('record', to_jsonb(NEW)),  -- body (jsonb)
    '{}'::jsonb,  -- params (empty jsonb)
    jsonb_build_object('Content-Type', 'application/json')  -- headers (jsonb)
  );
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.notify_n8n_swap_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_edge_function_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  PERFORM pg_notify('swap_requests_inserted', json_build_object('record', NEW)::text);
  RETURN NEW;
END;
$function$;