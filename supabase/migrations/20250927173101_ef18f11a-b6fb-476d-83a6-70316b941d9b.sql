-- Fix the create_user_session function to resolve column ambiguity
DROP FUNCTION IF EXISTS public.create_user_session(bigint, text, bigint, text, text);

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
SET search_path TO 'public'
AS $function$
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

  -- Find existing profile - explicitly qualify column names
  SELECT p.id INTO v_profile_id 
  FROM public.profiles p 
  WHERE p.telegram_username = TRIM(p_telegram_username);
  
  -- If profile doesn't exist, create it
  IF v_profile_id IS NULL THEN
    INSERT INTO public.profiles (
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
    RETURNING id INTO v_profile_id;
  ELSE
    -- Update existing profile with latest info
    UPDATE public.profiles 
    SET telegram_chat_id = p_telegram_chat_id,
        telegram_user_id = p_telegram_user_id,
        first_name = CASE WHEN LENGTH(TRIM(COALESCE(p_first_name, ''))) > 0 
                          THEN TRIM(p_first_name) 
                          ELSE first_name END,
        last_name = CASE WHEN LENGTH(TRIM(COALESCE(p_last_name, ''))) > 0 
                         THEN TRIM(p_last_name) 
                         ELSE last_name END,
        last_login_time = now()
    WHERE id = v_profile_id;
  END IF;
  
  -- Clean up old sessions for this profile (security best practice)
  DELETE FROM public.user_sessions 
  WHERE user_sessions.profile_id = v_profile_id 
  AND (expires_at < now() OR created_at < now() - interval '7 days');
  
  -- Generate cryptographically secure session token
  v_session_token := concat(
    'sess_',
    extract(epoch from now())::text,
    '_',
    encode(gen_random_bytes(32), 'hex')
  );
  
  -- Store session with 24 hour expiry
  INSERT INTO public.user_sessions (profile_id, session_token, expires_at)
  VALUES (v_profile_id, v_session_token, now() + interval '24 hours');
  
  RETURN QUERY SELECT v_session_token::TEXT AS session_token, v_profile_id::UUID AS profile_id;
END;
$function$;

-- Update verification code expiry time from 5 to 10 minutes and improve cleanup
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.verification_codes 
  WHERE expires_at < now() OR used = true;
  
  -- Also clean up old unused codes older than 1 hour
  DELETE FROM public.verification_codes 
  WHERE created_at < now() - interval '1 hour';
END;
$function$;