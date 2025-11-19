import Link from 'next/link';
import { Metadata } from 'next';
import { Person, PeopleIndex } from '@/types';
import SearchForm from '../components/SearchForm';

async function getPersonData(slug: string): Promise<Person | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/people_index.json`, {
    cache: 'no-store',
  });
  const data: PeopleIndex = await response.json();
  return data.people.find((p) => p.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const person = await getPersonData(name);

  if (!person) {
    return {
      title: 'Name Not Found - InEpsteinFiles.com',
      description: 'This name was not found in our search index.',
    };
  }

  const found = person.found_in_documents;
  const vanityUrl = `${person.slug}.inepsteinfiles.com`;
  const canonicalUrl = `https://inepsteinfiles.com/${person.slug}?utm_source=x_share`;

  const title = `${person.display_name} ${found ? 'IS' : 'IS NOT'} in the Epstein Files`;
  const description = `${person.total_matches} result${person.total_matches !== 1 ? 's' : ''} found. Sources: ${vanityUrl}`;

  const altText = found
    ? `Red alert: ${person.display_name} appears ${person.total_matches} times in Epstein official records. No wrongdoing implied. Sources linked. Public docs only.`
    : `Clear: ${person.display_name} has 0 matches in Epstein files so far. Still processing. Neutral search results.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'InEpsteinFiles.com',
      images: [
        {
          url: `/api/og/${person.slug}`,
          width: 1200,
          height: 628,
          alt: altText,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og/${person.slug}`],
    },
  };
}

export default async function NamePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const person = await getPersonData(name);

  if (!person) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl md:text-9xl font-black mb-8">404</div>
          <p className="text-xl mb-8">Name not found in our index</p>
          <Link href="/" className="text-black underline hover:text-gray-600">
            ← Back to search
          </Link>
        </div>
      </main>
    );
  }

  const found = person.found_in_documents;
  const vanityUrl = `${person.slug}.inepsteinfiles.com`;
  const shareText = `${person.display_name} ${found ? 'IS' : 'IS NOT'} in the Epstein files. Thoughts? Sources: ${vanityUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <main className="min-h-screen bg-white text-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Answer Section */}
        <div className="text-center mb-16">
          {/* YES/NO Answer */}
          <div
            className={`text-8xl md:text-[14rem] font-black leading-none tracking-tighter mb-8 ${
              found ? 'text-red-600' : 'text-black'
            }`}
          >
            {found ? 'YES' : 'NO'}
          </div>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-12">
            {person.display_name} {found ? 'IS' : 'IS NOT'} IN THE EPSTEIN FILES
          </p>

          {/* Match Count */}
          <p className="text-2xl mb-6">
            {person.total_matches} result{person.total_matches !== 1 ? 's' : ''}{' '}
            <Link href="/" className="underline hover:text-gray-600">
              so far
            </Link>
          </p>

          {/* Post on X Button */}
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors mb-8"
          >
            Post on
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          {/* Legal Disclaimer */}
          <p className="text-xs text-gray-600 mt-8">
            <Link href="/" className="text-gray-600 hover:underline">
              No wrongdoing is alleged or implied. We are literally just a search.
            </Link>
          </p>
        </div>

        {/* Documents Section (YES only) */}
        {found && person.documents.length > 0 && (
          <div className="border-t border-gray-300 pt-12 mt-12">
            <p className="text-sm text-gray-600 mb-8 text-center">
              Sources processed → click to open original file.
            </p>

            <div className="space-y-8">
              {person.documents.map((doc, idx) => (
                <div key={idx} className="border-b border-gray-300 pb-8 last:border-b-0">
                  <a
                    href={doc.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:underline"
                  >
                    <div className="font-bold uppercase text-base mb-1">
                      {doc.filename.replace(/\.pdf$/i, '').replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {doc.matches.length > 0 && `page ${doc.matches[0].page} • `}
                      {new Date(doc.matches[0]?.snippet || '').toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {doc.matches[0] && (
                      <div className="text-sm mt-2">
                        &ldquo;...{doc.matches[0].snippet}...&rdquo;
                      </div>
                    )}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Again Section */}
        <div className="border-t border-gray-300 pt-12 mt-12 text-center">
          <p className="text-sm uppercase tracking-wide text-gray-600 mb-6">
            SEARCH ANOTHER NAME
          </p>
          <SearchForm />
        </div>

        {/* Footer */}
        <div className="text-center pt-8 mt-8 text-xs text-gray-600">
          <Link href="/" className="text-gray-600 hover:underline">about</Link>
          {!found && (
            <>
              {' • '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Thank you for your feedback! This result has been flagged as TREMENDOUS fake news. The best people are looking into it. Believe me!');
                }}
                className="text-gray-600 hover:underline"
                title="Flag this result as a complete and total Democrat HOAX! Sad!"
              >
                FAKE NEWS
              </a>
            </>
          )}
          {' • '}
          last updated: november 19, 2024
          {' • '}
          <a href="https://twitter.com/jessicasuarez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
            @jessicasuarez
          </a>
        </div>
      </div>
    </main>
  );
}
