
-- Create a function to get users by metadata key and value
CREATE OR REPLACE FUNCTION public.get_users_by_meta(meta_key TEXT, meta_value TEXT)
RETURNS TABLE(user_id UUID) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT id::UUID
  FROM auth.users 
  WHERE raw_user_meta_data->>meta_key = meta_value;
END;
$$;
