-- Remove petition-related database structures

-- Drop the check_petition_threshold function first (since it might be referenced by triggers)
DROP FUNCTION IF EXISTS public.check_petition_threshold() CASCADE;

-- Drop the petition_counts view
DROP VIEW IF EXISTS public.petition_counts CASCADE;

-- Drop the petition_requests table
DROP TABLE IF EXISTS public.petition_requests CASCADE;

-- Remove the petition column from swap_requests table
ALTER TABLE public.swap_requests DROP COLUMN IF EXISTS petition;