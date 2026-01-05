-- Reports table for "Fake News" reports
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient queries on slug
CREATE INDEX IF NOT EXISTS idx_reports_slug ON reports (slug);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from anon users (for submitting reports)
-- Rate limiting is handled at the application level
CREATE POLICY "Allow insert for report submission" ON reports
  FOR INSERT TO anon
  WITH CHECK (true);

-- Note: No SELECT policy for anon - reports are admin-only readable
-- If you need to read reports, create a service role policy or use the dashboard

-- Comment for documentation
COMMENT ON TABLE reports IS 'Stores fake news report submissions';
