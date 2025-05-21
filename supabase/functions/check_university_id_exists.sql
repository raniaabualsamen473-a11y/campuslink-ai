
-- Create a function to check if a university ID exists
CREATE OR REPLACE FUNCTION public.check_university_id_exists(uni_id TEXT)
RETURNS TABLE(exists BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE raw_user_meta_data->>'university_id' = uni_id
  );
END;
$$;
