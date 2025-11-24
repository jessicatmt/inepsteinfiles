# InEpsteinFiles.com - Claude Code Project Instructions

## Import Structure
@/Users/Me/ClaudeWorkspace/CLAUDE.md
@README.md

## Project Overview
**InEpsteinFiles.com** is a time-sensitive search engine that verifies if names appear in official Epstein documents. Congress voted to release new files on Nov 18, 2024, and releases are expected imminently.

**Primary Goal:** Launch a functional search engine ASAP to be ready when new documents drop.

## 🎯 STRATEGIC DECISION: Manual-First MVP (Nov 19, 2024)

**Context:** After multi-model AI consultation (Gemini 2.5 Pro + GPT-5.1), unanimous recommendation to pursue Manual-First MVP approach for 24-48hr timeline.

### Phase 1: Manual V1 MVP (CURRENT - Launch Target: 24-48 hours)
**Scope:**
- **5 priority PDFs**: New emails, flight logs, contact book, birthday books (1-4)
- **35 curated names**: High-profile figures (Trump, Clinton, Gates, Prince Andrew, etc.)
- **Simple text search**: PyMuPDF extraction + case-insensitive string matching
- **Basic snippets**: ±150 chars around matches
- **SHA-256 hashing**: With `UNVERIFIED` status + transparency messaging
- **Next.js website**: Homepage, /[name] routes, OG images, legal disclaimers

**What we're SKIPPING for V1:**
- ❌ spaCy NER (name extraction)
- ❌ Automated PDF classification
- ❌ Complex DocType-specific parsing
- ❌ Full verification against known_hashes.json
- ❌ Processing all 64 PDFs

**Why Manual-First:**
- Meets 24-48hr timeline realistically
- Launches with high-value content (most-searched names)
- De-risks technical complexity
- Allows for viral spread during news cycle

### Phase 2: Automated Pipeline (Post-Launch - Parallel Development)
**Scope:**
- Full NER with spaCy for name discovery
- Automated PDF classification
- Complex parsing (Q&A extraction, flight log tables)
- Processing all 64+ PDFs
- SHA-256 verification against official hashes
- Scale to full 65k+ page archive

**Timeline:** Build in parallel after V1 launch, deploy as updates

**Transition Strategy:** Manual V1 data becomes seed/validation for automated pipeline

## Project Context

### Timeline
- **Critical:** New Epstein files released Nov 18, 2024
- **V1 Target:** Launch within 24-48 hours (Manual MVP)
- **V2 Target:** Automated pipeline within 1-2 weeks post-launch
- **Strategy:** Fast manual launch → Iterate with automation

### Key Documents
- **PRD v1.5:** `/reference/requirements/Product Requirements Document (PRD) InEpsteinFiles.com v1.5.md`
- **Data Pipeline Spec v1.2:** `/reference/requirements/Data Pipeline & Engineering Specification v1.2.md`
- **Design Guidelines:** `/reference/replit-frontend-design/design_guidelines.md`

### Assets Available
- 64 PDFs in `/source-files/initial-dump/` (classification unknown)
- Replit design reference in `/reference/replit-frontend-design/`
- Existing audit script at `/data-pipeline/audit_files.py`

## Technical Architecture

### Tech Stack
- **Data Pipeline:** Python 3.13 + PyMuPDF + Tesseract OCR + spacy NER
- **Website:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Search:** Fuse.js (client-side fuzzy search)
- **Social Cards:** @vercel/og (dynamic OG image generation)
- **Deployment:** Vercel
- **Domain:** inepsteinfiles.com

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

### Data Processing
1. **Always verify before processing:**
   - Run audit first, generate classification report
   - Pause for human review of classifications
   - Only process files approved by user

2. **Source tracking is critical:**
   - Every PDF must have an entry in `source_manifest.json`
   - Include: filename, source_url, sha256 hash, classification, date_added
   - User will manually add official source URLs for verification

3. **Classification priorities (per Data Pipeline spec):**
   - **P0 (Process for v1):** Flight Logs, Depositions, Contact Books
   - **P1 (After launch):** Phone Records
   - **EXCLUDE:** Legal procedural filings, unproven complaints

4. **Data integrity:**
   - Generate SHA-256 hashes for all processed files
   - Mark verification status in output JSON
   - Never index unverified or questionable sources

### Development Priorities
1. **Speed over perfection:** Launch quickly, iterate after
2. **Core features only:** Search, YES/NO results, evidence cards, social sharing
3. **Mobile-first:** Most users will share on mobile
4. **Viral engineering:** Dynamic social cards are critical for spread

### When New Files Release
**User will:**
- Monitor news/Twitter for high-value documents
- Tell you which specific PDFs to download and index
- Provide official source URLs for verification

**You should:**
- Create surgical indexing process for specific files
- Update source_manifest.json
- Regenerate people_index.json
- Redeploy website automatically

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

## Success Criteria
- ✅ Functional search with clean URL routing
- ✅ Dynamic social cards for viral sharing
- ✅ Clear YES/NO results with source evidence
- ✅ Mobile-responsive design
- ✅ Deployed to inepsteinfiles.com
- ✅ Ready to quickly add new documents when released
- ✅ Transparent source attribution and verification

---

**Last Updated:** 2025-11-24
**Status:** Active - Site Launched, Maintenance Mode
**Priority:** Medium - Monitor for new document releases

## Recent Major Updates

### 2025-11-24: GitHub Actions Workflow Improvements
- ✅ Added automated CI testing for all PRs
- ✅ Disabled auto-merge - manual approval required
- ✅ Added issue verification process
- ✅ Complete workflow documentation added
- See: `.logs/inepsteinfiles_2025-11-24.md` for details
