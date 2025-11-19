# InEpsteinFiles.com - Project Overview

## Current Status
**Phase:** Initial Setup & Development
**Timeline:** Launch target within 24-48 hours
**Priority:** HIGH - Senate release of Epstein files imminent

## What This Is
A search engine that provides definitive YES/NO answers to: "Is [NAME] in the Epstein files?"

**Example URLs:**
- `bill-clinton.inepsteinfiles.com` → Shows evidence from flight logs & depositions
- `inepsteinfiles.com/bill-clinton` → Same result, canonical URL

## Project Goals

### Immediate (Phase 1 - Core Index)
- [x] Project structure set up
- [ ] Python environment configured (Tesseract OCR, packages)
- [ ] Audit existing 64 PDFs → classification report
- [ ] Process high-value documents (Flight Logs, Depositions)
- [ ] Generate `people_index.json` with evidence
- [ ] Build Next.js website with search
- [ ] Deploy to Vercel with domain configured
- [ ] Ready for viral sharing via dynamic social cards

### Near-Term (Phase 2 - Senate Release)
- [ ] Monitor news for high-value document identification
- [ ] Surgical indexing of specific new PDFs
- [ ] Quick redeployment with updated index
- [ ] Maintain source attribution and verification

### Future (Phase 3 - Full Archive)
- [ ] Background processing of remaining documents
- [ ] Expand to phone records, additional sources
- [ ] Community contributions for source verification

## Tech Stack

### Data Pipeline
- **Language:** Python 3.13
- **OCR:** Tesseract (for scanned documents)
- **PDF Processing:** PyMuPDF (fitz)
- **NER:** spacy (name extraction)
- **Output:** JSON index with evidence snippets

### Website
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Search:** Fuse.js (client-side fuzzy search)
- **Social:** @vercel/og (dynamic OG images)
- **Deployment:** Vercel
- **Domain:** inepsteinfiles.com

## Repository Structure

```
├── website/                 # Next.js application
│   ├── app/
│   │   ├── [name]/         # Dynamic routes (/bill-clinton)
│   │   ├── api/og/         # OG image generation
│   │   └── page.tsx        # Homepage with search
│   ├── components/         # Reusable React components
│   └── public/
│       └── people_index.json  # Search data (generated)
│
├── data-pipeline/          # Python processing
│   ├── audit_files.py      # PDF classification
│   ├── process_pdfs.py     # Full pipeline (to build)
│   ├── source_manifest.json  # File tracking with URLs
│   └── output/
│       └── people_index.json
│
├── source-files/           # Raw PDFs (NOT in git)
│   └── initial-dump/       # First batch (64 files)
│
└── reference/              # Docs, specs, design
    ├── requirements/       # PRD & Data Pipeline spec
    └── replit-frontend-design/  # Design guidelines
```

## Key Features

### URL Routing
- **Subdomain:** `[name].inepsteinfiles.com` → Direct search via subdomain
- **Path:** `inepsteinfiles.com/[name]` → Canonical URL for SEO
- **Clean URLs:** No `/name/` segment - users can type URLs directly

### Search Results
- **Binary Answer:** Massive "YES" (red) or "NO" (black)
- **Evidence Cards:** Show exact snippets from source documents
  - Document type (Flight Log, Deposition, etc.)
  - Date and page reference
  - Link to original PDF
  - Verification status (SHA-256 hash)
- **Social Sharing:** Dynamic OG images for viral spread

### Data Integrity
- **SHA-256 Hashing:** Every file cryptographically verified
- **Source Attribution:** Official links to government sources
- **Manual Curation:** User reviews classifications before processing
- **Transparency:** Clear methodology and data sources

## Development Status

### Completed
✅ Project structure created
✅ Documentation (CLAUDE.md, README.md)
✅ Design reference from Replit (ported to Next.js approach)
✅ PRD and technical specs reviewed

### In Progress
🔄 Python environment setup
🔄 PDF audit and classification
🔄 Next.js application bootstrap

### Pending
⏳ Data pipeline implementation
⏳ Website development
⏳ Vercel deployment
⏳ DNS configuration

## Quick Start

### For Development
```bash
# Python pipeline
cd data-pipeline
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run audit
python audit_files.py

# Website
cd website
npm install
npm run dev
```

### For Deployment
```bash
# Build and deploy via Vercel
cd website
npm run build
vercel --prod
```

## Important Notes

### Design Philosophy
- **Speed over perfection** - Launch quickly, iterate after
- **Mobile-first** - Most sharing happens on mobile
- **Bold simplicity** - Inspired by isabevigodadead.com
- **Zero friction** - One search input, immediate answer

### Data Strategy
- **Phase 1:** Core Index (Flight Logs + Depositions) only
- **Phase 2:** Surgical indexing of Senate release high-value docs
- **Phase 3:** Background bulk processing of remaining files
- **Exclusions:** Procedural filings, unproven allegations

### User Workflow for New Files
1. Monitor Twitter/news for document releases
2. Identify 10-20 high-value PDFs with new names
3. Download specific files
4. Add source URLs to `source_manifest.json`
5. Run pipeline on those files only
6. Redeploy website with updated index

## Next Steps
1. Install Tesseract OCR and Python packages
2. Run PDF audit on initial 64 files
3. Review classifications and approve processing
4. Build data pipeline for approved files
5. Bootstrap Next.js website
6. Deploy to Vercel
7. Configure DNS for inepsteinfiles.com

## Contact & Access
- **Owner:** Jessica Suarez (jessica.suarez@gmail.com)
- **Vercel:** jessicasuarez-3910
- **Domain:** inepsteinfiles.com (purchased, needs DNS config)
- **GitHub:** Private repo (will make public post-launch)

---

**Last Updated:** 2024-11-19
**Next Review:** After Phase 1 launch
