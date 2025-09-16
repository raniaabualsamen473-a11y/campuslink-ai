-- Add trigger to call match-drop-requests function after drop request insertions
CREATE TRIGGER trigger_match_drop_requests
  AFTER INSERT ON public.drop_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_drop_request_matching();