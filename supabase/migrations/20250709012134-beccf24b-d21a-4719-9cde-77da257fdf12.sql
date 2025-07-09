-- Create profiles table for Telegram-based authentication
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_username TEXT NOT NULL UNIQUE,
    telegram_chat_id BIGINT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    telegram_user_id BIGINT NOT NULL UNIQUE,
    last_login_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_profiles_telegram_username ON public.profiles(telegram_username);
CREATE INDEX idx_profiles_telegram_chat_id ON public.profiles(telegram_chat_id);
CREATE INDEX idx_profiles_telegram_user_id ON public.profiles(telegram_user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update swap_requests table to reference profiles instead of auth.users
ALTER TABLE public.swap_requests 
ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update petition_requests table to reference profiles instead of auth.users  
ALTER TABLE public.petition_requests
ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create sessions table for Telegram-based authentication
CREATE TABLE public.user_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create session policies
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (profile_id IN (SELECT id FROM public.profiles));

CREATE POLICY "Service can manage sessions" 
ON public.user_sessions 
FOR ALL 
USING (true);

-- Create index for session performance
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_sessions_profile_id ON public.user_sessions(profile_id);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Update RLS policies for swap_requests to work with new profile system
DROP POLICY IF EXISTS "Enable read access for all users" ON public.swap_requests;
DROP POLICY IF EXISTS "Users can view their own swap requests" ON public.swap_requests;
DROP POLICY IF EXISTS "Users can create their own swap requests" ON public.swap_requests;
DROP POLICY IF EXISTS "Users can update their own swap requests" ON public.swap_requests;
DROP POLICY IF EXISTS "Users can delete their own swap requests" ON public.swap_requests;

CREATE POLICY "Public can view swap requests" 
ON public.swap_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create swap requests" 
ON public.swap_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own swap requests" 
ON public.swap_requests 
FOR UPDATE 
USING (profile_id IN (SELECT id FROM public.profiles WHERE telegram_user_id = current_setting('app.current_user_id')::BIGINT))
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE telegram_user_id = current_setting('app.current_user_id')::BIGINT));

CREATE POLICY "Users can delete their own swap requests" 
ON public.swap_requests 
FOR DELETE 
USING (profile_id IN (SELECT id FROM public.profiles WHERE telegram_user_id = current_setting('app.current_user_id')::BIGINT));

-- Update RLS policies for petition_requests
DROP POLICY IF EXISTS "Users can create their own petitions" ON public.petition_requests;

CREATE POLICY "Public can view petitions" 
ON public.petition_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create petitions" 
ON public.petition_requests 
FOR INSERT 
WITH CHECK (true);

-- Function to authenticate user with session token
CREATE OR REPLACE FUNCTION public.authenticate_session(token TEXT)
RETURNS TABLE(profile_id UUID, telegram_user_id BIGINT, telegram_username TEXT)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT p.id, p.telegram_user_id, p.telegram_username
    FROM public.user_sessions s
    JOIN public.profiles p ON s.profile_id = p.id
    WHERE s.session_token = token 
    AND s.expires_at > now();
$$;

-- Function to create or update user session
CREATE OR REPLACE FUNCTION public.create_user_session(
    p_telegram_user_id BIGINT,
    p_telegram_username TEXT,
    p_telegram_chat_id BIGINT,
    p_first_name TEXT DEFAULT NULL,
    p_last_name TEXT DEFAULT NULL
)
RETURNS TABLE(session_token TEXT, profile_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id UUID;
    v_session_token TEXT;
BEGIN
    -- Generate session token
    v_session_token := encode(gen_random_bytes(32), 'base64');
    
    -- Create or update profile
    INSERT INTO public.profiles (telegram_user_id, telegram_username, telegram_chat_id, first_name, last_name, last_login_time)
    VALUES (p_telegram_user_id, p_telegram_username, p_telegram_chat_id, p_first_name, p_last_name, now())
    ON CONFLICT (telegram_user_id) 
    DO UPDATE SET 
        telegram_username = EXCLUDED.telegram_username,
        telegram_chat_id = EXCLUDED.telegram_chat_id,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        last_login_time = now(),
        updated_at = now()
    RETURNING id INTO v_profile_id;
    
    -- Clean up expired sessions for this user
    DELETE FROM public.user_sessions 
    WHERE profile_id = v_profile_id AND expires_at < now();
    
    -- Create new session (expires in 30 days)
    INSERT INTO public.user_sessions (profile_id, session_token, expires_at)
    VALUES (v_profile_id, v_session_token, now() + interval '30 days');
    
    RETURN QUERY SELECT v_session_token, v_profile_id;
END;
$$;