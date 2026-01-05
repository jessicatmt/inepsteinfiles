-- Searches table RLS policies
-- Run this in the Supabase SQL editor
--
-- NOTE: If your 'searches' table ALREADY EXISTS, skip the CREATE TABLE
-- and just run the ALTER TABLE and CREATE POLICY statements below.
-- Your existing table likely uses 'last_searched' instead of 'created_at'.

-- Uncomment this block ONLY if table doesn't exist:
-- CREATE TABLE IF NOT EXISTS searches (
--   id BIGSERIAL PRIMARY KEY,
--   slug TEXT NOT NULL,
--   display_name TEXT,
--   last_searched TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );
-- CREATE INDEX IF NOT EXISTS idx_searches_slug ON searches (slug);
-- CREATE INDEX IF NOT EXISTS idx_searches_last_searched ON searches (last_searched DESC);

-- Enable Row Level Security (run this regardless)
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from anon users (for tracking searches)
-- Use CREATE OR REPLACE to avoid errors if policy exists
DROP POLICY IF EXISTS "Allow insert for search tracking" ON searches;
CREATE POLICY "Allow insert for search tracking" ON searches
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy: Allow select for analytics (trending feature)
-- This is safe because searches only contain slug/display_name, no PII
DROP POLICY IF EXISTS "Allow select for trending analytics" ON searches;
CREATE POLICY "Allow select for trending analytics" ON searches
  FOR SELECT TO anon
  USING (true);

-- Comment for documentation
COMMENT ON TABLE searches IS 'Stores search tracking entries for trending analytics';
