# InEpsteinFiles.com

**Search the Epstein files. Get a definitive answer.**

## What is this?

A single-purpose search engine that tells you whether a specific name appears in official government documents related to Jeffrey Epstein.

**Just type a name:**
- `bill-clinton.inepsteinfiles.com` ← Try it
- `inepsteinfiles.com/donald-trump`
- `inepsteinfiles.com/prince-andrew`

You get an immediate **YES** or **NO** with direct evidence from source documents.

## Why does this exist?

With 65,000+ pages of Epstein-related documents being released by Congress and the courts, it's nearly impossible for individuals to search through everything. This tool makes it instant.

**Our mission:**
- Provide accurate, verifiable answers
- Show exact evidence (no speculation)
- Maintain transparency about sources
- Make information accessible to everyone

## How it works

### Data Sources
We index **only official government releases:**
- Flight logs (exhibits from US v. Maxwell)
- Court depositions (unsealed by Judge Preska)
- Official contact records
- Senate-released documents

**We do NOT index:**
- Unproven allegations or complaints
- Procedural legal filings
- Third-party claims or media reports

### The Search Process
1. **Enter any name** in the search box
2. **Get an instant answer:** YES or NO
3. **See the evidence:**
   - Direct quotes from documents
   - Document type and date
   - Link to original PDF
   - Verification hash (proof of authenticity)

### Verification
Every document is:
- **Cryptographically verified** with SHA-256 hashes
- **Source-attributed** with links to official releases
- **Manually curated** to exclude false positives

## Example Results

### If someone IS in the files:
```
YES
BILL CLINTON appears in the Epstein files

Evidence:
📄 FLIGHT LOG - February 2001
   "...passenger manifest included: Bill Clinton..."
   Source: US v. Maxwell Trial Exhibit GX-4

📄 DEPOSITION - March 2015
   "...I was introduced to Bill Clinton at Ghislaine's London townhouse..."
   Source: Giuffre v. Maxwell Deposition Transcript
```

### If someone is NOT in the files:
```
NO
MICHAEL JORDAN is NOT in the Epstein files

We've indexed flight logs, depositions, and contact records.
This name does not appear in any official documents.

Note: We're still processing the Senate release (65k+ pages).
Check back as we expand the index.
```

## Share Results

Every search generates a **unique, shareable URL** with dynamic social cards for Twitter/Facebook/etc.

Perfect for:
- Setting the record straight
- Fact-checking claims
- Providing evidence in debates

## Technical Details

### Built With
- **Data Pipeline:** Python + Tesseract OCR + spacy NER
- **Website:** Next.js 14 + Tailwind CSS
- **Search:** Client-side fuzzy matching (Fuse.js)
- **Deployment:** Vercel
- **Open Source:** Coming soon (after initial launch)

### Privacy & Security
- No user accounts required
- No tracking or analytics
- No data collection
- Searches are client-side (private)

## Data Transparency

### What we include:
✅ Flight logs from trial exhibits
✅ Court depositions (unsealed)
✅ Official contact books
✅ Senate-released documents

### What we exclude:
❌ Procedural legal filings (lawyer names, not associates)
❌ Unproven complaints or allegations
❌ Media reports or third-party claims
❌ Redacted/illegible documents

### Source Attribution
Every result shows:
- Document title and type
- Date and page number
- Link to original PDF
- SHA-256 hash for verification

## Roadmap

### Phase 1: Core Index (Current)
- Flight logs from US v. Maxwell
- Unsealed depositions (Jan 2024 batch)
- High-quality, verified documents only

### Phase 2: Senate Release
- Surgical indexing of high-value documents
- Community-identified important files
- Continuous expansion as documents are verified

### Phase 3: Full Archive
- Background processing of remaining documents
- Additional source integration
- API access for researchers

## Contributing

**Coming soon:** Once we're live and stable, we'll open source the code and accept community contributions for:
- Source verification
- Document classification
- Bug fixes and improvements
- Translations

## Disclaimer

This tool provides information from **official government documents only**. It does not:
- Make claims about guilt or innocence
- Draw conclusions beyond what appears in documents
- Include allegations from unverified sources

**What you see is what's in the files.** Nothing more, nothing less.

## Contact

Questions? Concerns? Found an error?
- Email: ***REMOVED***
- Report issues on GitHub (link coming soon)

## License

Coming soon - will be fully open source after initial launch.

---

**Built with transparency. Powered by public records. Designed for truth.**

[Visit InEpsteinFiles.com →](https://inepsteinfiles.com)
