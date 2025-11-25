# InEpsteinFiles.com - Claude Code Project Instructions

## Import Structure
@/Users/Me/ClaudeWorkspace/CLAUDE.md
@README.md

## Project Overview
**InEpsteinFiles.com** is a search engine that shows if names appear in official Epstein documents. Launched Nov 2024 in response to Congressional file releases.

**Status:** ✅ **LAUNCHED** - Live at [inepsteinfiles.com](https://inepsteinfiles.com)

## What Actually Shipped (MVP - Nov 2024)

### The Pinpoint Integration Approach
Instead of the originally planned PDF processing pipeline, we shipped a faster MVP using **Google Journalist Studio Pinpoint** as the document search backend.

**What's Live:**
- **~50 curated names**: High-profile figures manually researched
- **Pinpoint entity linking**: Each person links to their entity search in our Pinpoint collection
- **Document counts**: Pulled from Pinpoint via Playwright scraper (no API available)
- **YES/NO results**: Based on whether entity has documents in collection
- **Dynamic Twitter cards**: @vercel/og with photo backgrounds
- **Next.js website**: Homepage, /[name] routes, /about page with legal disclaimers

**How Data Gets Updated:**
1. User adds documents to Pinpoint collection (manual or via Google Drive folders)
2. Search Pinpoint for entity, get Knowledge Graph entity ID from HTML
3. Run Playwright scraper to extract entity IDs and document counts
4. Update `people_index.json` with new counts
5. Redeploy website

### What We Didn't Ship (V1+ Features)
These were in the original PRD but cut for speed:

- ❌ **Evidence excerpts**: No ±150 char snippets around name matches
- ❌ **Page-level linking**: Links to full collection, not specific pages
- ❌ **SHA-256 verification**: Not actively hashing/verifying (aspirational)
- ❌ **spaCy NER**: Name discovery via ML - exists but not running at scale
- ❌ **Automated PDF processing**: PyMuPDF/Tesseract pipeline works but not deployed
- ❌ **"Definitive" claims**: Can't guarantee completeness with 6000+ files

### MVP Workarounds & Known Issues
- **URL version params**: `?v=20251125` for Twitter card cache busting
- **No Pinpoint API**: All entity data scraped via Playwright
- **Manual name curation**: No automated name discovery from documents
- **Document counts are estimates**: Pinpoint's entity matching isn't perfect

## V1+ Roadmap (Post-MVP)

**Data Pipeline** (exists, needs scaling):
- Full NER with spaCy for name discovery
- Automated PDF classification
- Evidence excerpt extraction with page numbers
- SHA-256 verification against official hashes
- Processing full 65k+ page archive

**Website Enhancements**:
- Evidence cards with specific page references
- Direct PDF viewer integration
- Name variation matching
- Search within documents

**Timeline:** Build incrementally as time allows

## Project Context

### Timeline
- **Nov 18, 2024:** Congress releases Epstein files
- **Nov 19-24, 2024:** MVP development (pivoted to Pinpoint approach)
- **Nov 24, 2024:** Site launched
- **Current:** Maintenance mode, monitoring for new document releases

### Key Documents
- **PRD v1.5:** `/reference/requirements/Product Requirements Document (PRD) InEpsteinFiles.com v1.5.md` *(aspirational - not all features shipped)*
- **Data Pipeline Spec v1.2:** `/reference/requirements/Data Pipeline & Engineering Specification v1.2.md` *(V1+ reference)*
- **GitHub Issue #55:** Tracks what was cut from MVP and planned for later

### Current Assets
- **Pinpoint collection:** ~6000 documents (user-maintained)
- **people_index.json:** ~50 curated names with entity IDs and counts
- **Data pipeline scripts:** Working but not deployed at scale

## Technical Architecture

### Tech Stack (What's Actually Running)
- **Document Backend:** Google Journalist Studio Pinpoint (no API - scraped via Playwright)
- **Website:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Search:** Fuse.js (client-side fuzzy search for name autocomplete)
- **Social Cards:** @vercel/og (dynamic Twitter card generation)
- **Deployment:** Vercel (auto-deploy from GitHub main branch)
- **Domain:** inepsteinfiles.com

### Tech Stack (Exists but Not Deployed)
- **Data Pipeline:** Python 3.13 + PyMuPDF + Tesseract OCR + spaCy NER
- **Purpose:** PDF parsing, OCR, name extraction - works on small scale, not running in production

### URL Structure (CRITICAL)
- **Subdomain:** `bill-clinton.inepsteinfiles.com` → `/bill-clinton`
- **Path:** `inepsteinfiles.com/bill-clinton`
- **NO `/name/` segment** - keep URLs clean and intuitive

### Project Structure
```
/projects/inepsteinfiles/
├── CLAUDE.md                    # This file - behavioral instructions
├── README.md                    # Claude-facing project overview
├── README.github.md             # Public GitHub README (marketing)
├── .env                         # Project-specific environment variables
├── .logs/                       # Project logs and progress tracking
│   └── inepsteinfiles_YYYY-MM-DD.md
├── /website/                    # Next.js 14 application
│   ├── app/                     # App Router
│   │   ├── [name]/page.tsx     # Dynamic routes: /bill-clinton
│   │   ├── api/og/[name]/route.ts  # Dynamic OG images
│   │   └── page.tsx             # Homepage
│   ├── components/              # React components
│   ├── public/                  # Static assets & people_index.json
│   └── package.json
├── /data-pipeline/              # Python processing scripts
│   ├── audit_files.py           # PDF classification (existing)
│   ├── process_pdfs.py          # Full processing pipeline (to build)
│   ├── requirements.txt         # Python dependencies
│   ├── source_manifest.json     # File tracking with source URLs
│   └── /output/                 # Generated JSON outputs
│       └── people_index.json
├── /source-files/               # Raw PDFs (NOT in git)
│   └── initial-dump/            # First batch of 64 PDFs
├── /reference/                  # Historical docs, research, design
│   ├── requirements/            # PRD and specs
│   └── replit-frontend-design/  # Design reference
└── /documents/                  # Project documentation
```

## Behavioral Guidelines

### Current Data Workflow (Pinpoint-Based)
1. **Adding new documents:**
   - User adds documents to Pinpoint collection (manual upload or Google Drive folder)
   - Documents are automatically indexed by Pinpoint

2. **Updating name data:**
   - Run Playwright scraper to extract entity IDs and counts from Pinpoint
   - Update `people_index.json` with new data
   - Push to GitHub → auto-deploys to Vercel

3. **Adding new names:**
   - Research Knowledge Graph entity ID for the person
   - Add entry to `people_index.json` with entity_id, slug, display name
   - Run scraper to get document count
   - Redeploy

### V1+ Data Pipeline (When Ready to Scale)
*These guidelines apply when running the full PDF processing pipeline:*

1. **Always verify before processing:**
   - Run audit first, generate classification report
   - Pause for human review of classifications
   - Only process files approved by user

2. **Source tracking:**
   - Every PDF should have an entry in `source_manifest.json`
   - Include: filename, source_url, sha256 hash, classification, date_added

3. **Classification priorities:**
   - **High Value:** Flight Logs, Depositions, Contact Books
   - **Medium:** Phone Records, Correspondence
   - **Exclude:** Legal procedural filings, unproven complaints

### Development Priorities
1. **Stability first:** Site is launched, avoid breaking changes
2. **Data accuracy:** Verify counts and entity IDs before updating
3. **Mobile-first:** Most users share on mobile
4. **Twitter optimization:** Social cards drive traffic

### When New Files Release
**User will:**
- Add documents to Pinpoint collection
- Identify high-profile names to add

**You should:**
- Run scraper to update entity counts
- Add new names to people_index.json if requested
- Verify data accuracy before deploying

### Deployment & Updates
- **Environment:** Use `.env.master` for shared keys, local `.env` for project-specific
- **GitHub:** Private repo initially, make public after launch
- **Vercel:** Automatic deployments from main branch
- **Domain:** Manual DNS configuration required (provide step-by-step guide)

## Key Decisions & Context

### From User Preferences
- Email: jessica.suarez@gmail.com
- Vercel account: jessicasuarez-3910
- Unfamiliar with: Next.js App Router, Vercel deployment, Tailwind
- Python environment: 3.13.7 installed, Tesseract needs installation
- Manual monitoring: User will identify high-value PDFs from news

### Design Philosophy
**Inspired by isabevigodadead.com:**
- Bold, unmistakable answers (massive "YES" or "NO")
- Clean, single-purpose design
- Zero-friction sharing
- Progressive disclosure of details
- Respectful but impactful execution

### Non-Goals (Per PRD)
- ❌ NOT indexing MP3s, videos, raw images in Phase 1
- ❌ NOT indexing procedural legal filings (dilutes search quality)
- ❌ NOT attempting to OCR all 65k pages on Day 1 (surgical approach)

## Working with This Project

### Starting a Session
1. Read this file and README.md for current status
2. Check `.logs/inepsteinfiles_YYYY-MM-DD.md` for recent work
3. Review todo list for pending tasks
4. Ask clarifying questions if uncertain

### Making Changes
1. **Data Pipeline:** Always test on sample files first
2. **Website:** Use design_guidelines.md as reference
3. **Deployment:** Document every step for future updates
4. **Logs:** Update project log proactively with decisions and progress

### GitHub Workflow (IMPORTANT - Updated 2025-11-24)
**All PRs now require manual approval and testing before merge:**

1. **Automated Testing** - CI runs on every PR
   - Linter, tests, and build must pass
   - You'll be notified of results

2. **Manual Review Required**
   - Auto-merge is DISABLED
   - Maintainer approval required for all PRs
   - Review checklist posted automatically

3. **Issue Verification Process**
   - Issues do NOT auto-close after PR merge
   - Must test fix in production
   - Manually close with verification comment

**For Claude-generated PRs:**
- Label: `claude-generated` + `awaiting-review`
- Review automatically requested from @jessicatmt
- Manual merge only
- Verification reminder posted on linked issues

**Complete workflow documentation:** `.github/WORKFLOW_GUIDE.md`

### Communication Style
- Be concise and action-oriented (this is time-sensitive)
- Ask questions only when truly necessary
- Provide clear status updates at major milestones
- Flag blockers immediately

## What Shipped vs What Didn't

### ✅ Shipped (MVP)
- Functional search with clean URL routing
- Dynamic Twitter cards for viral sharing
- Clear YES/NO results with document counts
- Mobile-responsive design
- Deployed to inepsteinfiles.com
- /about page with legal disclaimers

### ⏳ Partially Working
- Source attribution (links to Pinpoint collection, not specific pages)
- Verification (SHA-256 hashing exists in scripts, not actively used)

### ❌ Not Shipped (V1+ Features)
- Evidence excerpts with page numbers
- Automated name discovery via NER
- Full PDF processing pipeline at scale
- "Definitive" completeness claims

---

**Last Updated:** 2025-11-25
**Status:** ✅ Launched - Maintenance Mode
**Priority:** Low - Monitor for new document releases, occasional data updates

## Recent Updates

### 2025-11-25: Documentation Sync
- Updated CLAUDE.md and README.md to reflect MVP reality
- Clarified what shipped vs what's planned for V1+
- Synced with GitHub README and Issue #55

### 2025-11-24: GitHub Actions Workflow
- Added automated CI testing for all PRs
- Disabled auto-merge - manual approval required
- Added issue verification process
- See: `.logs/inepsteinfiles_2025-11-24.md` for details
