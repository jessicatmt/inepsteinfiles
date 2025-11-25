# InEpsteinFiles.com

> A transparent search engine for the Epstein files

## About

InEpsteinFiles.com provides a simple, transparent way to search official Epstein court documents released through Freedom of Information Act (FOIA) requests and Congressional releases. Get definitive YES/NO answers to whether a name appears in the official documents, with direct links to source evidence.

**Example:** Visit `inepsteinfiles.com/bill-clinton` to see if Bill Clinton appears in the documents. 

## Features

- 🔍 **Simple Search** - Enter names to get immediate YES/NO results
- ✅ **Verification** - All documents tracked with SHA-256 cryptographic hashes
- 📱 **Mobile-First** - Clean, responsive design optimized for sharing
- 🎨 **Dynamic Social Cards** - Share-optimized OG images for every search

## How It Works
1. I gather documents either manually (if from tricky sources like pacer or paid court transcript sites, from DOJ/FBI vaults) or by dropping the Google Drive foldesr (congress's preferred way to share large document releases) into Pinpoint. 
2. Based on searching there and from other sources / looking at analytics etc I created a MVP shortlist of the most frequently searched and frequently appearing names of associates (removing victims,etc). 
3. Since Pinpoint has no API or MCP at all, I had to use a Playwright python script to manualy search for entities and their document totals. 
4. Made a json file with the top x names in Epstein files, their entity IDs, their people search results (so uses collection ID and entity IDs) to link, and their current document counts. 
5. That json file populated the starting set of pages, names, twitter cards, etc. 

- Note: 
	- I did some python (vibe)-coded pdf parsing from a limited set of the most juicy docs -- little black book, flight manifests, birhtday book, texts, documents from the Epstein estate. That did work for OCR, finding relevant names, pulling excerpts from each appearance in the doc. I know it works but parsing a whole database of names and thousands of scans of sometimes not OCR'd, redacted, documents will take more time. 
- So the data pipeline from my original ambitious spec does work. Thats:
	- **Language**: Python 3.13
	- **PDF Processing**: PyMuPDF (fitz)
	- **OCR**: Tesseract (for scanned documents)
	- **NLP**: spaCy (name extraction)
	- **Output**: JSON index with evidence snippets



### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Search**: Fuse.js (client-side fuzzy search)
- **Social Cards**: @vercel/og (dynamic image generation)
- **Deployment**: Vercel

## License

This project will be licensed under the MIT License - (TODO: get and add language)


## Disclaimer

This is an independent project and is not affiliated with any government agency, court, or official investigation. All documents indexed are from publicly available sources. This site provides search functionality only and makes no claims about the accuracy or completeness of the underlying documents.

The appearance of a name in documents does not imply guilt, wrongdoing, or association with illegal activities. Context is essential - read the source documents.

(TODO: Even though all the docs are in Pinpoint now, I want to document the many, many official sources from courts, gov sites, congress, etc)

## Contact

- PLZ HELP ME: [Here's how to file bugs if you're here early and also thank you so much](https://github.com/jessicatmt/inepsteinfiles/issues/45)
- Report issues: [GitHub Issues](https://github.com/jessicatmt/inepsteinfiles/issues)
- Suggest documents: Open an issue with "Document Suggestion" label

