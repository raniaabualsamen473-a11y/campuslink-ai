-- Drop existing RLS policies that use auth.uid()
DROP POLICY IF EXISTS "Users can create drop requests" ON public.drop_requests;
DROP POLICY IF EXISTS "Users can view their own drop requests" ON public.drop_requests;
DROP POLICY IF EXISTS "Users can update their own drop requests" ON public.drop_requests;
DROP POLICY IF EXISTS "Users can delete their own drop requests" ON public.drop_requests;

-- Create new RLS policies using the custom authentication system
CREATE POLICY "Users can create drop requests" ON public.drop_requests
FOR INSERT 
WITH CHECK (profile_id = get_current_profile_id());

CREATE POLICY "Users can view their own drop requests" ON public.drop_requests
FOR SELECT 
USING (profile_id = get_current_profile_id());

CREATE POLICY "Users can update their own drop requests" ON public.drop_requests
FOR UPDATE 
USING (profile_id = get_current_profile_id());

CREATE POLICY "Users can delete their own drop requests" ON public.drop_requests
FOR DELETE 
USING (profile_id = get_current_profile_id());