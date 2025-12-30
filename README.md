# InEpsteinFiles.com

**Is [NAME] in the Epstein files? Find out instantly.**

[![Live Site](https://img.shields.io/badge/Live-inepsteinfiles.com-blue)](https://inepsteinfiles.com)

## What is this?

A single-purpose search engine that tells you whether a name appears in official Epstein court documents.

**Try it:**
- [inepsteinfiles.com/bill-clinton](https://inepsteinfiles.com/bill-clinton)
- [inepsteinfiles.com/donald-trump](https://inepsteinfiles.com/donald-trump)
- [inepsteinfiles.com/prince-andrew](https://inepsteinfiles.com/prince-andrew)

You get an immediate **YES** or **NO** with a link to search the source documents yourself.

## How it works

1. Enter any name in the search box
2. Get an instant YES or NO answer
3. See how many documents mention that person
4. Click through to search the full document collection in [Google Journalist Studio Pinpoint](https://journaliststudio.google.com/pinpoint/)

**Currently indexed:** ~470 names across 9,000+ documents

## What's in the index?

We index **official government releases:**
- Flight logs (exhibits from US v. Maxwell)
- Court depositions (unsealed by Judge Preska)
- Official contact records
- Congressional document releases

**We do NOT index:**
- Unproven allegations or complaints
- Procedural legal filings
- Media reports or third-party claims

## Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, shadcn/ui
- **Search:** Fuse.js (client-side fuzzy matching)
- **Social Cards:** @vercel/og (dynamic Twitter/OG images)
- **Document Backend:** Google Journalist Studio Pinpoint
- **Deployment:** Vercel

## Contributing

Found a bug? Have a suggestion?

- [Report an issue](https://github.com/jessicatmt/inepsteinfiles/issues)
- [How to file bugs](https://github.com/jessicatmt/inepsteinfiles/issues/45)

## Development

See [PROJECT.md](PROJECT.md) for development setup (local file, not in repo).

```bash
# Quick start
make dev        # Start dev server at localhost:3000
make test       # Run tests
make deploy     # Deploy to production
```

## Disclaimer

This tool shows information from **official government documents only**.

- The appearance of a name does not imply guilt or wrongdoing
- Context is essential — read the source documents
- This is an independent project, not affiliated with any government agency

## License

MIT License

---

Built Nov 2024. [Visit InEpsteinFiles.com →](https://inepsteinfiles.com)
