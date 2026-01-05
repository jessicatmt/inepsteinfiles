-- Rate limiting table for persistent rate limit tracking
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_created
  ON rate_limits (identifier, created_at DESC);

-- Index for cleanup operations
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at
  ON rate_limits (created_at);

-- Enable Row Level Security
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from anon users (for rate limit tracking)
CREATE POLICY "Allow insert for rate limiting" ON rate_limits
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy: Allow select for rate limit checking
CREATE POLICY "Allow select for rate limit checking" ON rate_limits
  FOR SELECT TO anon
  USING (true);

-- Policy: Allow delete for cleanup (expired entries)
CREATE POLICY "Allow delete for rate limit cleanup" ON rate_limits
  FOR DELETE TO anon
  USING (true);

-- Optional: Create a function to auto-cleanup old rate limit entries
-- This runs every hour to clean up entries older than 1 hour
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for documentation
COMMENT ON TABLE rate_limits IS 'Stores rate limit tracking entries for API endpoints';
