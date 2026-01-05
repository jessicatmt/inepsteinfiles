-- Performance indexes for scalability
-- Run this in the Supabase SQL editor
-- These indexes improve query performance as tables grow

-- Index for trending_searches view (filters by searched_at)
-- DESC ordering optimizes "recent searches" queries
CREATE INDEX IF NOT EXISTS idx_searches_searched_at
  ON searches (searched_at DESC);

-- Index for search tracking and grouping by slug
CREATE INDEX IF NOT EXISTS idx_searches_slug
  ON searches (slug);

-- Index for rate limiting lookups by identifier
-- This is critical for rate limit check performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier
  ON rate_limits (identifier);

-- Index for rate limit cleanup (deleting expired entries)
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at
  ON rate_limits (created_at);

-- Index for reports by slug (for potential future analytics)
CREATE INDEX IF NOT EXISTS idx_reports_slug
  ON reports (slug);

-- Comment for documentation
COMMENT ON INDEX idx_searches_searched_at IS 'Optimizes trending_searches view filtering';
COMMENT ON INDEX idx_searches_slug IS 'Optimizes grouping by slug for trending';
COMMENT ON INDEX idx_rate_limits_identifier IS 'Optimizes rate limit lookups';
COMMENT ON INDEX idx_rate_limits_created_at IS 'Optimizes expired rate limit cleanup';
COMMENT ON INDEX idx_reports_slug IS 'Optimizes report aggregation by slug';
