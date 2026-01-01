# Database Setup for Most Searched Feature

This directory contains SQL migrations for the InEpsteinFiles.com database.

## Prerequisites

- Supabase account with project created
- Environment variables configured in Vercel (already done per milestones/)

## Setup Instructions

### 1. Run the SQL Migration

1. Go to your Supabase SQL Editor:
   https://supabase.com/dashboard/project/etsgwyifhsasexistnpy/editor

2. Copy the contents of `001_create_searches_table.sql`

3. Paste and run the SQL in the editor

4. Verify the table was created:
   ```sql
   SELECT * FROM searches LIMIT 1;
   SELECT * FROM trending_searches;
   ```

### 2. Verify Environment Variables

These should already be set in Vercel (configured in Dec 2024):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

If running locally, create a `.env.local` file in the `website/` directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Test the Feature

1. Deploy or run locally:
   ```bash
   cd website
   npm run dev
   ```

2. Search for a name on the site

3. Check that the search was tracked:
   ```sql
   SELECT * FROM searches ORDER BY created_at DESC LIMIT 10;
   ```

4. View trending searches:
   ```sql
   SELECT * FROM trending_searches;
   ```

## Schema Overview

### `searches` table
- Tracks individual search queries
- Fields: `id`, `slug`, `display_name`, `searched_at`, `created_at`
- Indexed on `slug` and `searched_at` for performance

### `trending_searches` view
- Materialized view showing most searched names in last 7 days
- Auto-calculates search counts
- Limited to top 10 results

## API Endpoints

- `POST /api/track-search` - Track a search (called automatically)
- `GET /api/trending` - Get trending searches (cached 5 min)

## Features

- ✅ Automatic search tracking on result pages
- ✅ "Most Searched" section on homepage
- ✅ Real-time updates (with 5min cache)
- ✅ Graceful degradation (tracking failures don't affect UX)
- ✅ Row Level Security enabled for data protection
