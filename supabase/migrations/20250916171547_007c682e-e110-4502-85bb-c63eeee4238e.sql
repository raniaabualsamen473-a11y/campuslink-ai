-- Add processed_at field to drop_requests table to prevent duplicate processing
ALTER TABLE public.drop_requests 
ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for better performance on processed_at queries
CREATE INDEX idx_drop_requests_processed_at ON public.drop_requests(processed_at);