
-- Create a function to check if a university email exists
CREATE OR REPLACE FUNCTION public.check_university_email_exists(uni_email TEXT)
RETURNS TABLE(exists BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE raw_user_meta_data->>'university_email' = uni_email
  );
END;
$$;
