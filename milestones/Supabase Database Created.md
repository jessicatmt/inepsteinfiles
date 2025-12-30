---
title: Supabase Database Created
type: note
permalink: milestones/supabase-database-created
---

# Supabase Database Created - 2025-12-30

## Milestone
Started [Phase 1](data-backend-migration-plan-v2.md) of the data backend migration.

## Configuration
- **Database Name**: `inepsteinfiles`
- **Region**: Washington, D.C., USA (East) - iad1
- **Plan**: Supabase Free Plan ($0/month)
- **Environment Prefix**: NEXT_PUBLIC_

## What This Enables
- [Supabase](https://supabase.com) provides managed Postgres database
- 500 MB database space on free tier
- Supabase Storage for PDF files
- Built-in full-text search via Postgres FTS
- Auto-configured environment variables in Vercel

## Next Steps
1. Verify Vercel env vars (SUPABASE_URL, SUPABASE_ANON_KEY)
2. Create database schema per [migration plan](data-backend-migration-plan-v2.md)
3. Create `feature/data-platform` branch
4. Build ingestion pipeline

## Related
- [InEpsteinFiles](../projects/inepsteinfiles) - Main project
- [Data Migration Plan v2](../documents/plans/data-backend-migration-plan-v2.md) - Full plan