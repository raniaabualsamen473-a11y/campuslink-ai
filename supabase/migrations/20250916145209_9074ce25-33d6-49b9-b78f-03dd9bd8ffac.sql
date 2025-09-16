-- Drop the existing trigger that only fires on INSERT
DROP TRIGGER IF EXISTS swap_request_trigger ON swap_requests;

-- Recreate the trigger to fire on both INSERT and UPDATE
CREATE TRIGGER swap_request_trigger
  AFTER INSERT OR UPDATE ON swap_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_swap_request();