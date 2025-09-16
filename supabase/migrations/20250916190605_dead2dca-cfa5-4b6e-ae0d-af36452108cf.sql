-- Remove duplicate trigger that's causing double processing
DROP TRIGGER IF EXISTS trigger_match_drop_requests ON drop_requests;

-- Keep only the properly named trigger
-- trigger_drop_request_matching_on_insert will remain as the single trigger