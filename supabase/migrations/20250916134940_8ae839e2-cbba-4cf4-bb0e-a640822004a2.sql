-- Fix remaining security issues

-- 1. Fix profiles table RLS policy conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic profile info for matches" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create proper restrictive policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view profiles in matches" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT match_user_id FROM public.matches WHERE requester_user_id = auth.uid()
    UNION
    SELECT requester_user_id FROM public.matches WHERE match_user_id = auth.uid()
  )
);

-- 2. Ensure user_roles table has proper RLS (if it was the table without policies)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::app_role);

-- 3. Reduce verification code expiry to 5 minutes for better security
-- This will be handled in the edge function, but let's clean up expired codes
SELECT cleanup_expired_verification_codes();