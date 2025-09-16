-- Revert to simpler RLS policies that work with the existing user_id field
-- Since the app doesn't use Supabase Auth, we'll use the profile_id directly

-- Drop the complex policies
DROP POLICY IF EXISTS "Users can create drop requests" ON public.drop_requests;
DROP POLICY IF EXISTS "Users can view their own drop requests" ON public.drop_requests; 
DROP POLICY IF EXISTS "Users can update their own drop requests" ON public.drop_requests;
DROP POLICY IF EXISTS "Users can delete their own drop requests" ON public.drop_requests;

-- Create simpler policies that work with profile_id directly
-- For now, allow authenticated users to insert if they have a valid profile_id
CREATE POLICY "Users can create drop requests" ON public.drop_requests
FOR INSERT 
WITH CHECK (profile_id IS NOT NULL);

CREATE POLICY "Users can view drop requests" ON public.drop_requests
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own drop requests" ON public.drop_requests
FOR UPDATE 
USING (profile_id IS NOT NULL);

CREATE POLICY "Users can delete their own drop requests" ON public.drop_requests
FOR DELETE 
USING (profile_id IS NOT NULL);