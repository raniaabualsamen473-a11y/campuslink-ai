-- Fix the handle_swap_request function to use proper JSONB headers
CREATE OR REPLACE FUNCTION public.handle_swap_request()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
begin
  perform net.http_post(
    url := 'https://pbqpbupsmzafbzlxccov.supabase.co/functions/v1/forward-swap-request', 
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := json_build_object('record', NEW)::text
  );
  return new;
end;
$function$;

-- Remove the duplicate trigger that might be causing conflicts
DROP TRIGGER IF EXISTS notify_edge_function_trigger ON public.swap_requests;

-- Ensure the correct trigger exists for handling swap requests
DROP TRIGGER IF EXISTS trg_forward_swap_request ON public.swap_requests;
CREATE TRIGGER trg_forward_swap_request
  AFTER INSERT ON public.swap_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_swap_request();