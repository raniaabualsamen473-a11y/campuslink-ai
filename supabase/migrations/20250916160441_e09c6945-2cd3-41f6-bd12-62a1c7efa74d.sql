-- Create drop_requests table
CREATE TABLE public.drop_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.profiles(id),
  
  -- Action type
  action_type TEXT NOT NULL CHECK (action_type IN ('drop_only', 'request_only', 'drop_and_request')),
  
  -- Drop course fields (required for drop_only and drop_and_request)
  drop_course TEXT,
  drop_section_number INTEGER,
  
  -- Request course fields (required for request_only and drop_and_request)
  request_course TEXT,
  request_section_number INTEGER,
  any_section_flexible BOOLEAN DEFAULT FALSE,
  
  -- User info
  telegram_username TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  full_name TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Normalized sections for matching
  normalized_drop_section TEXT,
  normalized_request_section TEXT,
  
  -- Validation constraints
  CONSTRAINT drop_fields_required 
    CHECK ((action_type = 'drop_only' AND drop_course IS NOT NULL AND drop_section_number IS NOT NULL) OR
           (action_type = 'request_only' AND request_course IS NOT NULL) OR
           (action_type = 'drop_and_request' AND drop_course IS NOT NULL AND drop_section_number IS NOT NULL AND request_course IS NOT NULL)),
  
  CONSTRAINT different_courses_for_drop_and_request
    CHECK (action_type != 'drop_and_request' OR drop_course != request_course)
);

-- Enable RLS
ALTER TABLE public.drop_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create drop requests" ON public.drop_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their own drop requests" ON public.drop_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own drop requests" ON public.drop_requests FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own drop requests" ON public.drop_requests FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Public can view non-anonymous drop requests" ON public.drop_requests FOR SELECT USING (anonymous = FALSE);

-- Create trigger for updated_at
CREATE TRIGGER update_drop_requests_updated_at
BEFORE UPDATE ON public.drop_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to normalize drop request sections
CREATE OR REPLACE FUNCTION public.normalize_drop_request_sections()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalize drop section if present
  IF NEW.drop_course IS NOT NULL AND NEW.drop_section_number IS NOT NULL THEN
    NEW.normalized_drop_section = LOWER(TRIM(NEW.drop_course)) || '_' || NEW.drop_section_number::text;
  END IF;
  
  -- Normalize request section if present and specific
  IF NEW.request_course IS NOT NULL AND NEW.request_section_number IS NOT NULL AND NOT NEW.any_section_flexible THEN
    NEW.normalized_request_section = LOWER(TRIM(NEW.request_course)) || '_' || NEW.request_section_number::text;
  ELSIF NEW.request_course IS NOT NULL AND NEW.any_section_flexible THEN
    NEW.normalized_request_section = LOWER(TRIM(NEW.request_course)) || '_flexible';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to normalize sections
CREATE TRIGGER normalize_drop_request_sections_trigger
BEFORE INSERT OR UPDATE ON public.drop_requests
FOR EACH ROW
EXECUTE FUNCTION public.normalize_drop_request_sections();