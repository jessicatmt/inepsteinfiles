-- Searches table for tracking search analytics
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS searches (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient queries on slug
CREATE INDEX IF NOT EXISTS idx_searches_slug ON searches (slug);

-- Index for time-based queries (trending)
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches (created_at DESC);

-- Enable Row Level Security
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from anon users (for tracking searches)
CREATE POLICY "Allow insert for search tracking" ON searches
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy: Allow select for analytics (trending feature)
-- This is safe because searches only contain slug/display_name, no PII
CREATE POLICY "Allow select for trending analytics" ON searches
  FOR SELECT TO anon
  USING (true);

-- Comment for documentation
COMMENT ON TABLE searches IS 'Stores search tracking entries for trending analytics';
