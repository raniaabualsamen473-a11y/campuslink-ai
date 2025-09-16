-- Add trigger to call matching function when drop requests are inserted
CREATE OR REPLACE FUNCTION public.trigger_drop_request_matching()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the match-drop-requests edge function asynchronously
  PERFORM net.http_post(
    url := 'https://pbqpbupsmzafbzlxccov.supabase.co/functions/v1/match-drop-requests',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'record', row_to_json(NEW)
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to run matching on new drop requests
CREATE TRIGGER trigger_drop_request_matching_on_insert
AFTER INSERT ON public.drop_requests
FOR EACH ROW
EXECUTE FUNCTION public.trigger_drop_request_matching();