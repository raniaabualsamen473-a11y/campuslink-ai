-- Create performance indexes for matching optimization
CREATE INDEX IF NOT EXISTS idx_drop_requests_normalized_sections ON drop_requests(normalized_drop_section, normalized_request_section);
CREATE INDEX IF NOT EXISTS idx_drop_requests_courses ON drop_requests(drop_course, request_course);
CREATE INDEX IF NOT EXISTS idx_drop_requests_user_processed ON drop_requests(user_id, processed_at);

CREATE INDEX IF NOT EXISTS idx_swap_requests_normalized_sections ON swap_requests(normalized_current_section, normalized_desired_section);
CREATE INDEX IF NOT EXISTS idx_swap_requests_courses ON swap_requests(desired_course, current_section);
CREATE INDEX IF NOT EXISTS idx_swap_requests_user ON swap_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(requester_user_id, match_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_course_sections ON matches(desired_course, normalized_desired_section);

-- Enable real-time for matches table
ALTER TABLE matches REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE matches;