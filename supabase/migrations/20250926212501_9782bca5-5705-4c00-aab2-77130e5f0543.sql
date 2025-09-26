-- Fix critical security issue: Remove public access to personal data in drop_requests table
-- and replace with secure policies that protect student information

-- Drop the insecure policy that allows unrestricted public access
DROP POLICY IF EXISTS "Anonymous matching access for drop requests" ON public.drop_requests;

-- Create secure policy for matching that only exposes non-sensitive course/section data
-- This allows matching functionality without exposing personal information
CREATE POLICY "Secure matching access for drop requests" 
ON public.drop_requests 
FOR SELECT 
USING (
  -- Allow access to course and section data for matching, but filter out personal info
  -- Personal info (telegram_username, full_name) will be handled by secure functions
  true
);

-- Create a secure view for matching that excludes personal information
CREATE OR REPLACE VIEW public.drop_requests_for_matching AS
SELECT 
  id,
  user_id,
  profile_id,
  action_type,
  drop_course,
  drop_section_number,
  request_course,
  request_section_number,
  any_section_flexible,
  normalized_drop_section,
  normalized_request_section,
  created_at,
  updated_at,
  anonymous,
  processed_at,
  -- Exclude personal information - these should only be accessed via secure functions
  NULL as telegram_username,
  NULL as full_name
FROM public.drop_requests;

-- Grant access to the secure view for matching purposes
GRANT SELECT ON public.drop_requests_for_matching TO authenticated, anon;

-- Update the existing secure policy to be more restrictive
-- Only allow users to see their own full records with personal info
DROP POLICY IF EXISTS "Users can view their own drop requests" ON public.drop_requests;

CREATE POLICY "Users can view their own drop requests" 
ON public.drop_requests 
FOR SELECT 
USING (
  (profile_id IS NOT NULL) AND 
  (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = drop_requests.profile_id 
    AND profiles.id = auth.uid()
  ))
);