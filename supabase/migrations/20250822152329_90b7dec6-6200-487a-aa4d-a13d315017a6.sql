-- Fix the handle_swap_request function to use correct positional parameters for net.http_post
CREATE OR REPLACE FUNCTION public.handle_swap_request()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
begin
  perform net.http_post(
    'https://pbqpbupsmzafbzlxccov.supabase.co/functions/v1/forward-swap-request',  -- url
    jsonb_build_object('record', to_jsonb(NEW)),  -- body (jsonb)
    '{}'::jsonb,  -- params (empty jsonb)
    jsonb_build_object('Content-Type', 'application/json')  -- headers (jsonb)
  );
  return new;
end;
$function$;