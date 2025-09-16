-- Fix matches table RLS policies
-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow service role to insert matches" ON public.matches;
DROP POLICY IF EXISTS "Users can read their own matches" ON public.matches;

-- Create proper RLS policies for matches table
CREATE POLICY "Users can view their own matches" 
ON public.matches 
FOR SELECT 
USING ((auth.uid() = requester_user_id) OR (auth.uid() = match_user_id));

CREATE POLICY "Service role can insert matches" 
ON public.matches 
FOR INSERT 
WITH CHECK (true);

-- Ensure no updates or deletes are allowed by regular users
-- Only service role should manage matches