-- Clean up any duplicate or conflicting triggers
DROP TRIGGER IF EXISTS trg_forward_swap_request ON swap_requests;
DROP TRIGGER IF EXISTS notify_edge_function_on_insert ON swap_requests;

-- Ensure we have the correct trigger for both INSERT and UPDATE
DROP TRIGGER IF EXISTS swap_request_trigger ON swap_requests;
CREATE TRIGGER swap_request_trigger
  AFTER INSERT OR UPDATE ON swap_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_swap_request();