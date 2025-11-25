import Link from 'next/link';
import { Metadata } from 'next';
import Image from 'next/image';
import SearchForm from '../components/SearchForm';
import FakeNewsButton from '../components/FakeNewsButton';
import { getPersonData } from '@/lib/data';

// Allow dynamic params to handle names not in the index
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const person = await getPersonData(name);

  // Convert slug to display name
  const displayName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (!person) {
    const title = `${displayName} IS NOT in the Epstein Files`;
    const description = `0 results found. Sources: ${name}.inepsteinfiles.com`;
    const canonicalUrl = `https://inepsteinfiles.com/${name}?utm_source=x_share`;
    const vanityUrl = `https://${name}.inepsteinfiles.com?utm_source=x_share`;
    const altText = `Clear: ${displayName} has 0 matches in Epstein files so far. Still processing. Neutral search results.`;

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
            url: `/api/og/${name}`,
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
        images: [`/api/og/${name}`],
      },
    };
  }

  // Person is "found" if they have documents OR Pinpoint file count > 0
  const found = person.found_in_documents || (person.pinpoint_file_count && person.pinpoint_file_count > 0);
  const vanityUrl = `https://${person.slug}.inepsteinfiles.com?utm_source=x_share`;
  const canonicalUrl = `https://inepsteinfiles.com/${person.slug}?utm_source=x_share`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inepsteinfiles.com';
  const ogImageUrl = `${siteUrl}/api/og/${person.slug}`;

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
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const person = await getPersonData(name);

  // Track search asynchronously (don't await to avoid blocking page render)
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/track-search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }).catch(() => {
    // Silently fail tracking - don't block page render
  });

  // Convert slug to display name (e.g., "donald-duck" -> "Donald Duck")
  const displayName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (!person) {
    // Show NO page for names not in the index
    const vanityUrl = `https://${name}.inepsteinfiles.com`;
    const shareText = `${displayName} IS NOT in the Epstein files. Thoughts?\n\n${vanityUrl}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    // For names not in our index, we can only use text search
    const pinpointSearchUrl = `https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&spt=2&p=1&q=${encodeURIComponent(displayName)}`;

    return (
      <main className="min-h-screen bg-white text-black p-4">
        <div className="max-w-4xl mx-auto">
          {/* Answer Section */}
          <div className="text-center mb-16">
            {/* NO Answer */}
            <div className="text-8xl md:text-[14rem] font-black leading-none tracking-tighter mb-8 text-green-600">
              NO
            </div>

            {/* Subtitle */}
            <p className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-12">
              {displayName} IS NOT IN THE EPSTEIN FILES
            </p>

            {/* Match Count */}
            <p className="text-2xl mb-6">
              0 results in official records
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

  // Person is "found" if they have documents OR Pinpoint file count > 0
  const found = person.found_in_documents || (person.pinpoint_file_count && person.pinpoint_file_count > 0);
  const canonicalUrl = `https://inepsteinfiles.com/${person.slug}`;
  const vanityUrl = `https://${person.slug}.inepsteinfiles.com`;
  const shareText = `${person.display_name} ${found ? 'IS' : 'IS NOT'} in the Epstein files. Thoughts?\n\n${vanityUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  // Pinpoint collection URL for deep linking
  // Use entity ID if available (more accurate), otherwise fall back to text search
  const pinpointSearchUrl = person.pinpoint_entity_id
    ? `https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&spt=2&p=1&entities=${encodeURIComponent(person.pinpoint_entity_id)}`
    : `https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&spt=2&q=${encodeURIComponent(person.display_name)}`;

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

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-12">
            {person.display_name} {found ? 'IS' : 'IS NOT'} IN THE EPSTEIN FILES
          </p>

          {/* Custom One-Liner */}
          {person.custom_content?.one_liner && (
            <p className="text-xl md:text-2xl italic text-gray-700 mb-8">
              {person.custom_content.one_liner}
            </p>
          )}

          {/* Match Count */}
          <p className="text-2xl mb-6">
            {found ? (
              <a
                href={pinpointSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600"
              >
                in {person.pinpoint_file_count} files
              </a>
            ) : (
              '0 results in official records'
            )}
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
          {!found && (
            <>
              {' • '}
              <FakeNewsButton />
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
