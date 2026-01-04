-- Create reports table to track "Fake News" flags
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/etsgwyifhsasexistnpy/editor

CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_slug ON reports(slug);

-- Create index on reported_at for recent reports
CREATE INDEX IF NOT EXISTS idx_reports_reported_at ON reports(reported_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (submitting reports)
CREATE POLICY "Allow public inserts" ON reports
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow public reads (for potential admin dashboard)
CREATE POLICY "Allow public reads" ON reports
  FOR SELECT
  TO anon
  USING (true);

-- View for most reported names (useful for admin review)
CREATE OR REPLACE VIEW most_reported AS
SELECT
  slug,
  COUNT(*) as report_count,
  MAX(reported_at) as last_reported
FROM reports
GROUP BY slug
ORDER BY report_count DESC
LIMIT 20;

-- Grant access to the view
GRANT SELECT ON most_reported TO anon;
