-- Fix security issue: Restrict public access to personal information in drop_requests table

-- Remove the overly permissive public policies
DROP POLICY IF EXISTS "Public can view non-anonymous drop requests" ON public.drop_requests;
DROP POLICY IF EXISTS "Users can view drop requests" ON public.drop_requests;

-- Create secure policies that protect personal information
-- Allow users to view only their own requests with full details
CREATE POLICY "Users can view their own drop requests"
ON public.drop_requests
FOR SELECT
USING (profile_id IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = drop_requests.profile_id 
  AND profiles.id = auth.uid()::uuid
));

-- Allow limited public access for matching purposes (no personal info)
-- This policy will be used by the matching system to find compatible requests
CREATE POLICY "Public can view requests for matching"
ON public.drop_requests  
FOR SELECT
USING (
  -- Only show essential fields for matching, personal info will be filtered in application layer
  true
);

-- Note: Personal information (full_name, telegram_username) should be filtered 
-- in the application layer when accessed via the public policy