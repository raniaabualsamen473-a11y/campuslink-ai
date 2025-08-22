-- Fix profile linking for Telegram notifications
-- Step 1: Update existing swap requests to link with profiles
UPDATE swap_requests 
SET profile_id = profiles.id 
FROM profiles 
WHERE swap_requests.user_id = profiles.id 
AND swap_requests.profile_id IS NULL;

-- Step 2: Make profile_id not null for future inserts  
-- We'll handle this in the application code instead of database constraint