-- Fix handle_swap_request URL to call the correct Edge Function path
CREATE OR REPLACE FUNCTION public.handle_swap_request()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
begin
  perform net.http_post(
    url := 'https://pbqpbupsmzafbzlxccov.supabase.co/functions/v1/forward-swap-request', 
    headers := '{"Content-Type":"application/json"}',
    body := json_build_object('record', NEW)::text
  );
  return new;
end;
$function$;

-- Ensure trigger exists to call the webhook on insert
DROP TRIGGER IF EXISTS trg_forward_swap_request ON public.swap_requests;
CREATE TRIGGER trg_forward_swap_request
AFTER INSERT ON public.swap_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_swap_request();

-- Prevent duplicate swap requests by same user for same course/sections
CREATE UNIQUE INDEX IF NOT EXISTS ux_swap_requests_unique_by_user_course_sections
ON public.swap_requests (user_id, desired_course, current_section, desired_section);

-- Prevent duplicate match records (request matched with same user more than once)
CREATE UNIQUE INDEX IF NOT EXISTS ux_matches_unique
ON public.matches (request_id, match_user_id);
