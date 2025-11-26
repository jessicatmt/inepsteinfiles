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
          <p className="text-gray-600 mt-2">A fair and neutral search tool for official documents</p>
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
              This website basically provides a searchable index of publicly available government documents,
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
              <li><a href="https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&spt=2&p=1&entities=%25P%25Jesus_Christ" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">The king of kings</a>.</li>
            </ul>
          </div>

          {/* 2. AI Indexed */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">2. &ldquo;AI Indexed&rdquo; / Beta Data Warning</h3>
            <p className="text-gray-700 mb-3">
              This site uses automated Optical Character Recognition (OCR) and AI-assisted entity extraction,
              as well as Google&apos;s Pinpoint document collections. <strong>This process is not 100% error-free.</strong>
            </p>
            <p className="text-gray-700">
              While we cross-reference major names, &ldquo;No Results&rdquo; does not guarantee absence from the files,
              and a &ldquo;Positive Result&rdquo; should always be verified against the primary source PDF
              (linked in search results where available).
            </p>
          </div>

          {/* 3. Neutral Research Tool */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">3. Neutral Research Tool</h3>
            <p className="text-gray-700">
              This site is a neutral tool for research, journalism, vibes, and transparency. We do not
              editorialize, accuse, or add commentary to the primary source documents. All data
              is sourced directly from official .gov, court-hosted, or government-released files.
              Any jokes or memes are not meant to imply guilt or humor.
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

        {/* About Section */}
        <section className="mb-12 mt-16">
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-300 pb-2">About</h2>
          <p className="text-gray-700 mb-4">
            Vibe coded in ~48 hours (with a five day covid / party break at the halfway mark). Say <a href="https://x.com/intent/post?text=@jessicasuarez%20hi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">hi</a>.
          </p>
          <p className="text-gray-700 mb-4">
            <a href="https://github.com/jessicatmt/inepsteinfiles" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              This site on github
            </a>
          </p>
          <p className="text-gray-700">
            <a href="sms://233733" className="text-blue-600 hover:underline">
              You&apos;re not alone. Text HOME to 233733
            </a>
          </p>
        </section>

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
