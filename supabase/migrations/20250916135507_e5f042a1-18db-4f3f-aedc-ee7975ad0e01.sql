-- Enable pgcrypto extension for gen_random_bytes function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clean up used verification codes so users can get fresh ones
DELETE FROM public.verification_codes WHERE used = true OR expires_at < now();