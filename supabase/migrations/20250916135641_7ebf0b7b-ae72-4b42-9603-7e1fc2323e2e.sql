-- Fix the create_user_session function to properly use gen_random_bytes from pgcrypto extension
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
  
  -- Generate session token using encode with random bytes
  v_session_token := encode(public.gen_random_bytes(32), 'base64');
  
  -- Store session with 24 hour expiry
  INSERT INTO user_sessions (profile_id, session_token, expires_at)
  VALUES (v_profile_id, v_session_token, now() + interval '24 hours');
  
  -- Return session data with explicit column names
  RETURN QUERY SELECT v_session_token::TEXT AS session_token, v_profile_id::UUID AS profile_id;
END;
$function$;