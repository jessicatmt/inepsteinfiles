import Link from 'next/link';
import { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import SearchForm from '../components/SearchForm';
import FakeNewsButton from '../components/FakeNewsButton';
import CheckItOutPopup from '../components/CheckItOutPopup';
import ShareButton from '../components/ShareButton';
import { getPersonData, findAllMatches } from '@/lib/data';
import { Person } from '@/types';
import { rankDocuments, getClassificationIcon } from '@/lib/documentRanking';

// Version param for cache busting - bump this when data changes significantly
const OG_VERSION = '20251126a';

// Allow dynamic params to handle names not in the index
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  
  let person = null;
  try {
    person = await getPersonData(name);
  } catch (error) {
    console.error('Error loading person data in generateMetadata:', error);
    // Continue with person = null to show generic metadata
  }

  // Convert slug to display name
  const displayName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (!person) {
    // Simpler title to avoid repetition with OG image text
    const title = `${displayName} | Epstein Files Search`;
    const description = `0 results found. Sources: ${name}.inepsteinfiles.com`;
    const vanityUrl = `https://${name}.inepsteinfiles.com?utm_source=x_share`;
    const altText = `Clear: ${displayName} has 0 matches in Epstein files so far. Still processing. Neutral search results.`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inepsteinfiles.com';
    const ogImageUrl = `${siteUrl}/api/og/${name}?v=${OG_VERSION}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: vanityUrl,
        siteName: 'InEpsteinFiles.com',
        images: [
          {
            url: ogImageUrl,
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
        images: [ogImageUrl],
      },
    };
  }

  // Person is "found" if they have documents OR Pinpoint file count > 0
  // Use Boolean() to ensure we get true/false, not 0 (which React renders as "0")
  const found = Boolean(person.found_in_documents) || (person.pinpoint_file_count != null && person.pinpoint_file_count > 0);
  const vanityUrl = `https://${person.slug}.inepsteinfiles.com?utm_source=x_share`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inepsteinfiles.com';
  const ogImageUrl = `${siteUrl}/api/og/${person.slug}?v=${OG_VERSION}`;

  // Use pinpoint_file_count as primary, fall back to total_matches
  const fileCount = person.pinpoint_file_count || person.total_matches || 0;
  // Simpler title to avoid repetition with OG image text
  const title = `${person.display_name} | Epstein Files Search`;
  const description = `${fileCount} result${fileCount !== 1 ? 's' : ''} found. Sources: ${vanityUrl}`;

  const altText = found
    ? `Alert: ${person.display_name} appears in ${fileCount} Epstein files. No wrongdoing alleged or implied. Official public records only.`
    : `Clear: ${person.display_name} has 0 matches in Epstein files so far. Still processing. Neutral search results.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: vanityUrl,
      siteName: 'InEpsteinFiles.com',
      images: [
        {
          url: ogImageUrl,
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
      images: [ogImageUrl],
    },
  };
}

export default async function NamePage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { name } = await params;
  const { q: originalQuery } = await searchParams;

  let person = null;
  let allMatches: Person[] = [];

  try {
    person = await getPersonData(name);
  } catch (error) {
    console.error('Error loading person data in NamePage:', error);
    // Continue with person = null to show "NO" page
  }

  // Find all potential matches for "Or searching for..." section
  // Use original query param if present (from redirect), otherwise use current slug
  const searchTermForMatches = originalQuery || name;
  try {
    allMatches = await findAllMatches(searchTermForMatches);
  } catch (error) {
    console.error('Error finding matches:', error);
    // Continue with empty matches
  }

  const otherMatches = person
    ? allMatches.filter(p => p.slug !== person.slug)
    : allMatches;

  // Redirect to canonical slug if we found a match via alias
  // e.g., /obama → /barack-obama
  // Pass original search term as query param to preserve disambiguation
  if (person && person.slug !== name.toLowerCase()) {
    redirect(`/${person.slug}?q=${encodeURIComponent(name)}`);
  }

  // Convert slug to display name (e.g., "donald-duck" -> "Donald Duck")
  const displayName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (!person) {
    // Show NO page for names not in the index
    const vanityUrl = `https://${name}.inepsteinfiles.com`;

    return (
      <main className="min-h-screen bg-white text-black p-4">
        <div className="max-w-4xl mx-auto">
          {/* Answer Section */}
          <div className="text-center mb-16">
            {/* NO Answer */}
            <div className="text-8xl md:text-[14rem] font-black leading-none tracking-tighter mb-8 text-green-600">
              NO
            </div>

            {/* Subtitle - using generic name since we don't know which person they meant */}
            <p className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-12">
              {displayName} IS NOT IN THE EPSTEIN FILES
            </p>

            {/* Match Count */}
            <p className="text-2xl mb-6">
              No search results in official files — so far.
            </p>

            {/* Post on X Button */}
            <ShareButton displayName={displayName} found={false} vanityUrl={vanityUrl} />
            
            {/* Show other potential matches */}
            {otherMatches.length > 0 && (
              <div className="bg-gray-100 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <p className="text-sm font-semibold mb-3">Search instead for:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {otherMatches.slice(0, 5).map(match => {
                    const matchFound = Boolean(match.found_in_documents) || (match.pinpoint_file_count != null && match.pinpoint_file_count > 0);
                    return (
                      <Link
                        key={match.slug}
                        href={`/${match.slug}`}
                        className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded border border-gray-300 hover:border-black transition-colors"
                      >
                        <span className="text-sm">{match.display_name}</span>
                        <span className={`text-xs font-bold ${matchFound ? 'text-red-600' : 'text-green-600'}`}>
                          {matchFound ? 'YES' : 'NO'}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legal Disclaimer */}
            <p className="text-xs text-gray-600 mt-8">
              <Link href="/about#legal" className="text-gray-600 hover:underline">
                No wrongdoing is alleged or implied. We are literally just a search.
              </Link>
            </p>
          </div>

          {/* Search Again Section */}
          <div className="border-t border-gray-300 pt-12 mt-12 text-center">
            <p className="text-sm uppercase tracking-wide text-gray-600 mb-6">
              SEARCH ANOTHER NAME
            </p>
            <SearchForm />
          </div>

          {/* Footer */}
          <div className="text-center pt-8 mt-8 text-xs text-gray-600">
            <Link href="/about" className="text-gray-600 hover:underline">about</Link>
            {' • '}
            <FakeNewsButton />
            {' • '}
            last updated: december 9, 2024
            {' • '}
            <a href="https://twitter.com/jessicasuarez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
              @jessicasuarez
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Person is "found" if they have documents OR Pinpoint file count > 0
  // Use Boolean() to ensure we get true/false, not 0 (which React renders as "0")
  const found = Boolean(person.found_in_documents) || (person.pinpoint_file_count != null && person.pinpoint_file_count > 0);
  const vanityUrl = `https://${person.slug}.inepsteinfiles.com`;

  return (
    <main className="min-h-screen bg-white text-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Answer Section */}
        <div className="text-center mb-16">
          {/* YES/NO Answer */}
          <div
            className={`text-8xl md:text-[14rem] font-black leading-none tracking-tighter mb-8 ${
              found ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {found ? 'YES' : 'NO'}
          </div>

          {/* Subtitle - now showing the actual person's full name */}
          <p className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-12">
            {person.display_name} {found ? 'IS' : 'IS NOT'} IN THE EPSTEIN FILES
          </p>

          {/* Custom One-Liner */}
          {person.custom_content?.one_liner && (
            <p className="text-xl md:text-2xl italic text-gray-700 mb-8">
              {person.custom_content.one_liner}
              {person.custom_content?.one_liner_popup ? (
                <>
                  {' '}
                  <CheckItOutPopup popupText={person.custom_content.one_liner_popup} />
                </>
              ) : person.custom_content?.one_liner_link ? (
                <>
                  {' '}
                  <Link href={person.custom_content.one_liner_link} className="underline hover:text-gray-500">
                    Check it out.
                  </Link>
                </>
              ) : null}
            </p>
          )}

          {/* Match Count */}
          <p className="text-2xl mb-6">
            {found ? (
              <>
                {person.total_matches && person.total_matches > 0
                  ? `Appears in ${person.total_matches} official Epstein document${person.total_matches !== 1 ? 's' : ''} so far.`
                  : "Bookmark this page, we're still processing their file matches."}
              </>
            ) : (
              'No search results in official files — so far.'
            )}
          </p>


          {/* Post on X Button */}
          <ShareButton displayName={person.display_name} found={found} vanityUrl={vanityUrl} />
          
          {/* Show other potential matches if user searched with partial name */}
          {otherMatches.length > 0 && (
            <div className="bg-gray-100 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-sm font-semibold mb-3">Search instead for:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {otherMatches.slice(0, 5).map(match => {
                  const matchFound = Boolean(match.found_in_documents) || (match.pinpoint_file_count != null && match.pinpoint_file_count > 0);
                  return (
                    <Link
                      key={match.slug}
                      href={`/${match.slug}`}
                      className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded border border-gray-300 hover:border-black transition-colors"
                    >
                      <span className="text-sm">{match.display_name}</span>
                      <span className={`text-xs font-bold ${matchFound ? 'text-red-600' : 'text-green-600'}`}>
                        {matchFound ? 'YES' : 'NO'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legal Disclaimer */}
          <p className="text-xs text-gray-600 mt-8">
            <Link href="/about#legal" className="text-gray-600 hover:underline">
              No wrongdoing is alleged or implied. We are literally just a search.
            </Link>
          </p>
        </div>

        {/* Custom Image */}
        {person.custom_content?.image_url && (
          <div className="my-12 text-center">
            <Image
              src={person.custom_content.image_url}
              alt={`Custom content for ${person.display_name}`}
              width={800}
              height={600}
              className="max-w-full md:max-w-2xl mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* YouTube Embed */}
        {person.custom_content?.youtube_embed_id && (
          <div className="my-12 max-w-3xl mx-auto">
            <div className="aspect-w-16 aspect-h-9 relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${person.custom_content.youtube_embed_id}${
                  person.custom_content.youtube_timestamp
                    ? `?start=${person.custom_content.youtube_timestamp}`
                    : ''
                }`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              ></iframe>
            </div>
          </div>
        )}

        {/* Evidence Section - Show document excerpts */}
        {found && person.documents && person.documents.length > 0 && (
          <div className="my-12 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800 mb-6 text-center">
              Evidence from Documents
            </h2>
            <div className="space-y-4">
              {rankDocuments(person.documents).slice(0, 7).map((doc, index) => {
                const snippet = doc.matches?.[0]?.snippet || '';
                if (!snippet) return null;
                
                // Highlight tier 1 documents with special styling
                const isTier1 = doc.rankTier === 1;

                return (
                  <a
                    key={index}
                    href={doc.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block p-4 rounded-lg border transition-colors ${
                      isTier1 
                        ? 'bg-red-50 border-red-200 hover:border-red-400 hover:bg-red-100' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isTier1 ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="mr-1">{getClassificationIcon(doc.classification || '')}</span>
                          {doc.classification || 'Document'} • {doc.filename}
                          {isTier1 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Direct Connection
                            </span>
                          )}
                        </p>
                        <p className="text-gray-800 line-clamp-3">
                          &ldquo;{snippet.length > 300 ? snippet.slice(0, 300) + '...' : snippet}&rdquo;
                        </p>
                        <p className="text-xs text-blue-600 mt-2 hover:underline">
                          View full document →
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
            {/* Link to search for more - use Pinpoint if available, otherwise epstein-docs people page */}
            <div className="text-center mt-6">
              <a
                href={person.pinpoint_entity_id
                  ? `https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&entities=${encodeURIComponent(person.pinpoint_entity_id)}`
                  : `https://epstein-docs.github.io/people/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
              >
                Search for more documents →
              </a>
            </div>
          </div>
        )}

        {/* Pinpoint Fallback - When we have Pinpoint data but no epstein-docs excerpts */}
        {found && (!person.documents || person.documents.length === 0) && person.pinpoint_entity_id && (
          <div className="my-12 max-w-3xl mx-auto text-center">
            <p className="text-gray-600 mb-4">
              Document excerpts are still being processed.
            </p>
            <a
              href={`https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&entities=${encodeURIComponent(person.pinpoint_entity_id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              View documents in Google Pinpoint →
            </a>
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
          <Link href="/about" className="text-gray-600 hover:underline">about</Link>
          {' • '}
          <FakeNewsButton />
          {' • '}
          last updated: december 9, 2024
          {' • '}
          <a href="https://twitter.com/jessicasuarez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
            @jessicasuarez
          </a>
        </div>
      </div>
    </main>
  );
}
