---
title: Supabase Connected to Vercel
type: note
permalink: milestones/supabase-connected-to-vercel
tags:
- supabase
- vercel
- database
- milestone
---

# Supabase Connected to Vercel

## Milestone Completed: 2025-12-30

Successfully connected Supabase database to Vercel project for InEpsteinFiles.com data backend migration.

## Configuration

- [Database Name](is) `inepsteinfiles`
- [Region](is) Washington, D.C., USA (East) - iad1
- [Plan](is) Supabase Free Plan
- [Vercel Project](is) `website`
- [Environments](includes) Development, Preview, Production

## Environment Variables Synced

All 10 variables synced to Vercel:
- `POSTGRES_URL` - Direct database connection
- `POSTGRES_PRISMA_URL` - Prisma-optimized connection
- `POSTGRES_URL_NON_POOLING` - Non-pooled connection
- `POSTGRES_USER` / `POSTGRES_PASSWORD` - Credentials
- `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` - API access
- `SUPABASE_JWT_SECRET` - JWT signing
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Client-side access

## Useful Links

- [Vercel Env Vars](links_to) https://vercel.com/jessicas-projects-9c100f35/website/settings/environment-variables
- [Supabase Dashboard](links_to) https://supabase.com/dashboard/project/etsgwyifhsasexistnpy

## Next Steps

1. ~~Verify Vercel env vars~~ ✅
2. Access Supabase Dashboard - explore
3. Create database schema
4. Create feature/data-platform branch
5. Add USE_NEW_BACKEND feature flag
6. Build ingestion script
