import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About & Legal - InEpsteinFiles.com',
  description: 'Legal disclaimer, data methodology, and information about InEpsteinFiles.com - a neutral search tool for official Epstein documents.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-black p-4">
      <div className="max-w-3xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-4xl font-black uppercase tracking-tight hover:underline">
            InEpsteinFiles.com
          </Link>
          <p className="text-gray-600 mt-2">A neutral search tool for official documents</p>
        </div>

        {/* Legal Disclaimer Section */}
        <section id="legal" className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-300 pb-2">
            Legal Disclaimer & Data Methodology
          </h2>

          {/* 1. Public Records */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">1. Public Records / No Guilt Implied</h3>
            <p className="text-gray-700 mb-3">
              This website provides a searchable index of publicly available government documents,
              including flight logs, unsealed court exhibits from <em>Giuffre v. Maxwell</em>,
              and releases from the Epstein Files Transparency Act.
            </p>
            <p className="text-gray-700 mb-3 font-semibold">
              The presence of a name in these documents does NOT imply that the individual
              committed a crime, was accused of a crime, or had knowledge of the crimes committed
              by Jeffrey Epstein or Ghislaine Maxwell.
            </p>
            <p className="text-gray-700 mb-2">
              Many individuals listed in these records appear for innocuous reasons, including but
              not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
              <li>Third parties mentioned in passing during testimony.</li>
              <li>Employees, contractors, or service staff.</li>
              <li>Appeared on the same page of a magazine or newspaper in an unrelated piece.</li>
              <li>Passengers on flights for unrelated business or social purposes.</li>
              <li>Law enforcement or legal professionals named in procedural filings.</li>
            </ul>
          </div>

          {/* 2. AI Indexed */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">2. "AI Indexed" / Beta Data Warning</h3>
            <p className="text-gray-700 mb-3">
              To make thousands of pages of PDF evidence searchable, this site uses automated
              Optical Character Recognition (OCR) and AI-assisted entity extraction, as well as Google's Pinpoint document collections.
              <strong> This process is not 100% error-free.</strong>
            </p>
            <p className="text-gray-700">
              While we cross-reference major names against verified flight manifests, "No Results"
              does not guarantee absence from the files, and a "Positive Result" should always be
              verified against the primary source PDF (linked in search results where available).
              We are currently in <strong>Beta</strong> and processing new files daily.
            </p>
          </div>

          {/* 3. Neutral Research Tool */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">3. Neutral Research Tool</h3>
            <p className="text-gray-700">
              This site is a neutral tool for research, journalism, and transparency. We do not
              editorialize, accuse, or add commentary to the primary source documents. All data
              is sourced directly from official .gov, court-hosted, or government-released files.
            </p>
          </div>

          {/* 4. Corrections */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">4. Corrections & Removal</h3>
            <p className="text-gray-700">
              If you believe an entry is the result of an OCR/data processing error, please use
              the <strong>FAKE NEWS</strong> link found at the bottom of the search result page. Validated
              errors regarding identity or transcription will be reviewed.
            </p>
          </div>
        </section>

        {/* Back to Search */}
        <div className="text-center border-t border-gray-300 pt-8">
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            Search a Name
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 mt-8 text-xs text-gray-600">
          <Link href="https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&spt=2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
            Browse full database (5000+ documents)
          </Link>
          {' • '}
          <a href="https://twitter.com/jessicasuarez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
            @jessicasuarez
          </a>
        </div>
      </div>
    </main>
  );
}
