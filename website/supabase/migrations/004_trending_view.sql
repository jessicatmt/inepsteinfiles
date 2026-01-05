-- Trending searches view for analytics
-- Run this in the Supabase SQL editor AFTER 002_searches_table.sql

-- Create a materialized view for better performance on trending queries
-- This aggregates searches from the last 24 hours
CREATE OR REPLACE VIEW trending_searches AS
SELECT
  slug,
  display_name,
  COUNT(*) as search_count
FROM searches
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY slug, display_name
ORDER BY search_count DESC
LIMIT 50;

-- Note: Views inherit RLS from the underlying tables
-- The searches table allows SELECT for anon, so this view is readable

-- Comment for documentation
COMMENT ON VIEW trending_searches IS 'Aggregated trending searches from the last 24 hours';
