# InEpsteinFiles.com

> A search engine for the Epstein files

**Status:** ✅ Live at [inepsteinfiles.com](https://inepsteinfiles.com)

## About

InEpsteinFiles.com provides a simple way to search if names appear in official Epstein court documents. Get YES/NO answers with links to document collections in Google Journalist Studio Pinpoint.

**Example:** Visit `inepsteinfiles.com/bill-clinton` to see if Bill Clinton appears in the documents.

## Features (What's Live)

- 🔍 **Simple Search** - Enter names to get immediate YES/NO results
- ✅ **Pinpoint Integration** - Links to full document collections
- 📱 **Mobile-First** - Clean, responsive design optimized for sharing
- 🎨 **Dynamic Social Cards** - Share-optimized OG images for every search

## How It Works (MVP Approach)

1. Documents are added to a Pinpoint collection (manual upload or Google Drive folders)
2. A curated list of 469 names is maintained
3. Playwright scraper extracts Knowledge Graph entity IDs and document counts from Pinpoint
4. `people_index.json` stores names, entity IDs, and counts
5. Website displays YES/NO based on whether documents exist for that entity

**Note:** The original PRD included PDF parsing, OCR, NER, and evidence excerpts. That pipeline exists but wasn't deployed for the MVP launch. See GitHub Issue #55 for what was cut and what's planned for V1+.

## Tech Stack

### Frontend (Running)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Search**: Fuse.js (client-side fuzzy search)
- **Social Cards**: @vercel/og (dynamic image generation)
- **Deployment**: Vercel

### Data Backend (Running)
- **Documents**: Google Journalist Studio Pinpoint (no API)
- **Scraping**: Playwright (Python) for entity extraction
- **Data**: `people_index.json` with 469 indexed names

### Data Pipeline (Exists, Not Deployed)
- **Language**: Python 3.13
- **PDF Processing**: PyMuPDF (fitz)
- **OCR**: Tesseract (for scanned documents)
- **NLP**: spaCy (name extraction)
- **Output**: JSON index with evidence snippets

## Quick Start

### Using Makefile (Recommended)

```bash
# Install dependencies and start development server
make dev
# Visit http://localhost:3000

# Or step by step:
make install          # Install website dependencies
make dev              # Start development server (auto-installs if needed)
make build            # Build for production
make test             # Run tests
make lint             # Run linter

# See all available commands
make help

# Deploying
make deploy           # Deploy to production (auto-deploys to Vercel)
```

## Available Makefile Commands

The project includes a Makefile for common development tasks:

**Website Development:**
- `make install` - Install website dependencies (npm install)
- `make dev` - Start development server (auto-installs dependencies, runs on http://localhost:3000)
- `make build` - Build website for production
- `make start` - Start production server
- `make lint` - Run ESLint
- `make test` - Run tests
- `make test-watch` - Run tests in watch mode
- `make test-coverage` - Run tests with coverage

**Deployment:**
- `make deploy` - Deploy to production (git push origin main, auto-deploys to Vercel)

**Data Pipeline:**
- `make install-pipeline` - Install Python dependencies

**Utilities:**
- `make clean` - Clean build artifacts and node_modules
- `make help` - Show all available commands

## Project Structure

```
inepsteinfiles/
├── website/                 # Next.js application
│   ├── app/                 # App Router pages and API routes
│   ├── components/          # React components
│   └── public/              # Static assets and people_index.json
├── data-pipeline/           # Python processing scripts (not deployed)
│   ├── extract_pinpoint_entities.py  # Entity scraper
│   ├── process_csv_updates.py        # CSV data processor
│   └── [various fix scripts]
└── .github/                 # CI/CD workflows and PR templates
```

## Development Workflow

- **Automated Testing**: All PRs run CI tests (linter, tests, build)
- **Manual Review**: PRs require maintainer approval before merging
- **Issue Verification**: Fixes must be tested in production before closing issues

See [`.github/WORKFLOW_GUIDE.md`](.github/WORKFLOW_GUIDE.md) for details.

## V1+ Features (Not Shipped)

These were planned but cut for the quick launch:
- Evidence excerpts with page numbers
- SHA-256 verification
- Automated name discovery via NER
- Full PDF processing at scale

Tracked in: [GitHub Issue #55](https://github.com/jessicatmt/inepsteinfiles/issues/55)

## License

MIT License (TODO: add LICENSE file)

## Disclaimer

This is an independent project and is not affiliated with any government agency, court, or official investigation. All documents indexed are from publicly available sources.

The appearance of a name in documents does not imply guilt, wrongdoing, or association with illegal activities. Context is essential - read the source documents.

## Contact

- Bug reports: [How to file bugs](https://github.com/jessicatmt/inepsteinfiles/issues/45)
- Issues: [GitHub Issues](https://github.com/jessicatmt/inepsteinfiles/issues)

---

Built Nov 2024 in ~48 hours (with a five day covid/party break at the halfway mark).
