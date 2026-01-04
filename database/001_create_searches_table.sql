-- Create searches table to track search queries
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/etsgwyifhsasexistnpy/editor

CREATE TABLE IF NOT EXISTS searches (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  display_name TEXT,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_searches_slug ON searches(slug);

-- Create index on searched_at for trending queries
CREATE INDEX IF NOT EXISTS idx_searches_searched_at ON searches(searched_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (tracking searches)
CREATE POLICY "Allow public inserts" ON searches
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow public reads (viewing trending)
CREATE POLICY "Allow public reads" ON searches
  FOR SELECT
  TO anon
  USING (true);

-- Create a view for trending searches (most searched in last 7 days)
CREATE OR REPLACE VIEW trending_searches AS
SELECT
  slug,
  display_name,
  COUNT(*) as search_count,
  MAX(searched_at) as last_searched
FROM searches
WHERE searched_at > NOW() - INTERVAL '7 days'
GROUP BY slug, display_name
ORDER BY search_count DESC
LIMIT 10;

-- Grant access to the view
GRANT SELECT ON trending_searches TO anon;
