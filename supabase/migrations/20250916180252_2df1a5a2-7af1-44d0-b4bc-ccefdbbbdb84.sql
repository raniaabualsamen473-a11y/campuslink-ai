-- Update RLS policies for matches table to work with custom authentication
-- First drop existing policies
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
DROP POLICY IF EXISTS "Service role can insert matches" ON public.matches;

-- Create new policies that work with the custom auth system
-- Allow public read access to matches (like swap_requests)
CREATE POLICY "Public can view matches" 
ON public.matches 
FOR SELECT 
USING (true);

-- Allow service role to insert matches (for the edge function)
CREATE POLICY "Service role can insert matches" 
ON public.matches 
FOR INSERT 
WITH CHECK (true);

-- Allow service role to manage all match operations
CREATE POLICY "Service role can manage matches" 
ON public.matches 
FOR ALL 
USING (auth.role() = 'service_role');