import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Person, PeopleIndex, getDocumentTitle } from '@/types';

// VIRALITY FEATURE: Generate metadata for SEO and Twitter cards
export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const person = await getPersonData(name);

  if (!person) {
    return {
      title: 'Name Not Found | InEpsteinFiles.com',
    };
  }

  const found = person.found_in_documents;
  const title = `${person.display_name} ${found ? 'IS' : 'IS NOT'} in the Epstein Files`;
  const description = found
    ? `${person.display_name} appears ${person.total_matches} times across ${person.documents.length} official documents including ${person.documents.map(d => getDocumentTitle(d.filename, d.source_attribution)).join(', ')}.`
    : `${person.display_name} does not appear in the Epstein files we've indexed.`;

  const canonicalUrl = `https://inepsteinfiles.com/${name}`;
  const ogImage = `https://inepsteinfiles.com/api/og/${name}`;

  return {
    title,
    description,
    // VIRALITY FEATURE: Canonical URL for SEO
    alternates: {
      canonical: canonicalUrl,
    },
    // VIRALITY FEATURE: Twitter Card meta tags
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@inepsteinfiles',
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'InEpsteinFiles.com',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${person.display_name} - Epstein Files Search`,
        },
      ],
      type: 'website',
    },
  };
}

// Generate static params for all names
export async function generateStaticParams() {
  const data: PeopleIndex = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/people_index.json`)
    .then(res => res.json())
    .catch(() => ({
      _metadata: {
        version: '',
        generated: '',
        description: '',
        total_names: 0,
        total_documents: 0,
        verification_note: ''
      },
      people: []
    }));

  return data.people.map((person) => ({
    name: person.slug,
  }));
}

async function getPersonData(slug: string): Promise<Person | null> {
  const data: PeopleIndex = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/people_index.json`, {
    next: { revalidate: 3600 }
  }).then(res => res.json());

  return data.people.find(p => p.slug === slug) || null;
}

export default async function NamePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const person = await getPersonData(name);

  if (!person) {
    notFound();
  }

  const found = person.found_in_documents;
  const shareUrl = `https://inepsteinfiles.com/${name}`;
  const shareText = `${person.display_name} ${found ? 'IS' : 'IS NOT'} in the Epstein files`;

  // VIRALITY FEATURE: Share on X (Twitter) URL
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-12">
        <Link href="/" className="text-gray-400 hover:text-white text-sm md:text-base">
          ← Back to Search
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mt-4">
          InEpsteinFiles.com
        </h1>
      </header>

      {/* Main Result */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-light mb-6">
          Is <span className="font-bold">{person.display_name}</span> in the Epstein files?
        </h2>

        {/* YES/NO Answer */}
        <div className={`text-6xl md:text-9xl font-black mb-8 ${found ? 'text-red-600' : 'text-white'}`}>
          {found ? 'YES' : 'NO'}
        </div>

        {/* VIRALITY FEATURE: Share on X Button */}
        <div className="flex gap-4 mb-12">
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share on X
          </a>

          {/* VIRALITY FEATURE: Subdomain link for easy sharing */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${person.slug}.inepsteinfiles.com`);
              alert('Link copied!');
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Copy Link
          </button>
        </div>

        {/* Evidence Section */}
        {found && (
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Summary</h3>
              <p className="text-gray-300">
                {person.display_name} appears <span className="text-white font-semibold">{person.total_matches} times</span> across{' '}
                <span className="text-white font-semibold">{person.documents.length} document{person.documents.length > 1 ? 's' : ''}</span>.
              </p>
            </div>

            {/* VIRALITY FEATURE: Human-readable document titles + Official source links */}
            {person.documents.map((doc, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      {getDocumentTitle(doc.filename, doc.source_attribution)}
                    </h4>
                    <p className="text-sm text-gray-400">{doc.classification}</p>
                  </div>
                  <span className="bg-red-900/30 text-red-400 px-3 py-1 rounded text-sm font-medium">
                    {doc.match_count} match{doc.match_count > 1 ? 'es' : ''}
                  </span>
                </div>

                {/* VIRALITY FEATURE: Official source attribution and link */}
                <div className="mb-4 p-3 bg-gray-800 rounded">
                  <p className="text-xs text-gray-400 mb-1">Official Source</p>
                  <a
                    href={doc.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline break-all"
                  >
                    {doc.source_attribution}
                  </a>
                </div>

                {/* Show first 3 matches */}
                <div className="space-y-3">
                  {doc.matches.slice(0, 3).map((match, matchIdx) => (
                    <div key={matchIdx} className="border-l-2 border-gray-700 pl-4">
                      <p className="text-xs text-gray-500 mb-1">Page {match.page}</p>
                      <p className="text-sm text-gray-300 italic">&ldquo;{match.snippet}&rdquo;</p>
                    </div>
                  ))}
                  {doc.match_count > 3 && (
                    <p className="text-sm text-gray-500">
                      ... and {doc.match_count - 3} more occurrences
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500">
                    Verification: {doc.verification_status} • SHA-256: {doc.sha256?.substring(0, 16)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Not Found Message */}
        {!found && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <p className="text-lg text-gray-300 mb-4">
              {person.display_name} does not appear in the documents we've currently indexed.
            </p>
            <p className="text-sm text-gray-500">
              We're continuously adding new documents as they're released by Congress, DOJ, and FBI.
              Check back soon for updates.
            </p>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-600">
            This search engine indexes publicly released documents from official U.S. government sources.
            Appearance in these documents does not imply wrongdoing. Documents are marked UNVERIFIED pending
            SHA-256 hash verification against official government sources.
          </p>
        </div>
      </div>
    </main>
  );
}
