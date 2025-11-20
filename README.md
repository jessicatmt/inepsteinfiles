# InEpsteinFiles.com

> A transparent search engine for official Epstein court documents

## About

InEpsteinFiles.com provides a simple, transparent way to search official Epstein court documents released through Freedom of Information Act (FOIA) requests and Congressional releases. Get definitive YES/NO answers to whether a name appears in the official documents, with direct links to source evidence.

**Example:** Visit `inepsteinfiles.com/bill-clinton` to see if Bill Clinton appears in the documents, along with exact page references and context.

## Features

- 🔍 **Simple Search** - Enter any name to get immediate YES/NO results
- 📄 **Source Evidence** - Every result links to exact page numbers in original PDFs
- ✅ **Verification** - All documents tracked with SHA-256 cryptographic hashes
- 📱 **Mobile-First** - Clean, responsive design optimized for sharing
- 🔗 **Clean URLs** - Direct access via `inepsteinfiles.com/[name]`
- 🎨 **Dynamic Social Cards** - Share-optimized OG images for every search

## How It Works

1. **Document Processing**: Official PDFs are processed using OCR and natural language processing
2. **Name Extraction**: Names are extracted and indexed with surrounding context
3. **Verification**: All source files are cryptographically hashed and tracked
4. **Search**: Fast client-side fuzzy search matches names and variations
5. **Results**: Clear YES/NO answer with evidence cards linking to original documents

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Search**: Fuse.js (client-side fuzzy search)
- **Social Cards**: @vercel/og (dynamic image generation)
- **Deployment**: Vercel

### Data Pipeline
- **Language**: Python 3.13
- **PDF Processing**: PyMuPDF (fitz)
- **OCR**: Tesseract (for scanned documents)
- **NLP**: spaCy (name extraction)
- **Output**: JSON index with evidence snippets

## Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.13+
- Tesseract OCR

### Setup

```bash
# Clone the repository
git clone https://github.com/jessicatmt/inepsteinfiles.git
cd inepsteinfiles

# Set up the data pipeline
cd data-pipeline
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up the website
cd ../website
npm install
```

## Usage

### Running the Website Locally

```bash
cd website
npm run dev
```

Visit `http://localhost:3000` to access the search interface.

### Processing Documents

```bash
cd data-pipeline
source venv/bin/activate

# Audit PDF files
python audit_files.py

# Process approved documents
python process_pdfs.py

# Output is generated at: output/people_index.json
```

### Deploying

The website automatically deploys to Vercel on push to `main`:

```bash
cd website
npm run build
vercel --prod
```

## Project Structure

```
inepsteinfiles/
├── website/                 # Next.js application
│   ├── app/                 # App Router pages and API routes
│   ├── components/          # React components
│   └── public/              # Static assets and generated JSON
├── data-pipeline/           # Python document processing
│   ├── audit_files.py       # PDF classification
│   ├── process_pdfs.py      # Processing pipeline
│   └── output/              # Generated search index
└── reference/               # Documentation and specifications
```

## Data Integrity

All documents are:
- **Verified**: SHA-256 hashes for every source file
- **Attributed**: Links to official government sources
- **Transparent**: Clear methodology and data sources

We only index documents from:
- Court filings and depositions
- FOIA releases
- Congressional document releases

We do NOT index:
- Unverified sources
- Procedural legal filings without evidentiary value
- Unproven allegations or complaints

## Contributing

Contributions are welcome! Here's how you can help:

1. **Source Verification**: Help verify SHA-256 hashes against official sources
2. **Bug Reports**: Report issues via GitHub Issues
3. **Document Submissions**: Suggest official documents for indexing
4. **Code Contributions**: Submit PRs for improvements

Please ensure all contributions maintain our standards for source verification and data integrity.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This is an independent project and is not affiliated with any government agency, court, or official investigation. All documents indexed are from publicly available sources. This site provides search functionality only and makes no claims about the accuracy or completeness of the underlying documents.

The appearance of a name in documents does not imply guilt, wrongdoing, or association with illegal activities. Context is essential - read the source documents.

## Contact

- Report issues: [GitHub Issues](https://github.com/jessicatmt/inepsteinfiles/issues)
- Suggest documents: Open an issue with "Document Suggestion" label

---

Built with transparency and accountability in mind.
