import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import peopleData from '@/public/people_index.json';

// Use Edge runtime for faster cold starts
export const runtime = 'edge';

// Cache OG images for 1 day, but allow stale-while-revalidate
export const revalidate = 86400;

// Load fonts at module level (bundled with the edge function)
const publicSansBlack = fetch(
  new URL('../fonts/PublicSans-Black.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

const geistMonoBold = fetch(
  new URL('../fonts/GeistMono-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    // Load fonts in parallel
    const [publicSansBlackData, geistMonoBoldData] = await Promise.all([
      publicSansBlack,
      geistMonoBold,
    ]);

    const person = peopleData.people.find((p: { slug: string }) => p.slug === name);

    // Convert slug to display name for unknown people
    const displayName = name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Determine if found and get counts
    const found = person
      ? (person.found_in_documents || (person.pinpoint_file_count && person.pinpoint_file_count > 0))
      : false;
    const fileCount = person?.pinpoint_file_count || person?.total_matches || 0;
    const personName = person?.display_name || displayName;
    const vanityUrl = `${name}.inepsteinfiles.com`;

    const fonts = [
      {
        name: 'Public Sans',
        data: publicSansBlackData,
        style: 'normal' as const,
        weight: 900 as const,
      },
      {
        name: 'Geist Mono',
        data: geistMonoBoldData,
        style: 'normal' as const,
        weight: 700 as const,
      },
    ];

    // Get base URL for background images
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inepsteinfiles.com';

    if (found) {
      // YES CARD - Red scribbled background
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              position: 'relative',
            }}
          >
            {/* Background image */}
            <img
              src={`${siteUrl}/x-cards/yes blank scribble.png`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Content overlay - centered vertically */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '40px 50px',
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              {/* Giant YES - 238px Public Sans BLACK, centered horizontally */}
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  fontFamily: 'Public Sans',
                  fontSize: 238,
                  fontWeight: 900,
                  lineHeight: 0.9,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  marginBottom: 20,
                }}
              >
                YES
              </div>

              {/* Name line - highlighted text effect */}
              <span
                style={{
                  fontFamily: 'Public Sans',
                  fontSize: 50,
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.4,
                  backgroundColor: '#000000',
                  padding: '4px 12px',
                  marginBottom: 24,
                }}
              >
                {personName} IS in the Epstein Files
              </span>

              {/* Monospace details - 31px Geist Mono Bold */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontFamily: 'Geist Mono',
                  fontSize: 31,
                  color: '#ffffff',
                  fontWeight: 700,
                }}
              >
                <div style={{ display: 'flex' }}>
                  {`> ${fileCount} RESULTS IN OFFICIAL DOCUMENTS (SO FAR)`}
                </div>
                <div style={{ display: 'flex' }}>
                  {`> ${vanityUrl}`}
                </div>
                <div style={{ display: 'flex' }}>
                  {`> NO WRONGDOING IS ALLEGED OR IMPLIED`}
                </div>
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 628,
          fonts,
          headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          },
        }
      );
    } else {
      // NO CARD - Black/white scribbled background
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              position: 'relative',
            }}
          >
            {/* Background image */}
            <img
              src={`${siteUrl}/x-cards/NO blank scribble.png`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Content overlay - centered vertically */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '40px 50px',
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              {/* Giant NO - 238px Public Sans BLACK, centered horizontally */}
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  fontFamily: 'Public Sans',
                  fontSize: 238,
                  fontWeight: 900,
                  lineHeight: 0.9,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  marginBottom: 20,
                }}
              >
                NO
              </div>

              {/* Name line - highlighted text effect */}
              <span
                style={{
                  fontFamily: 'Public Sans',
                  fontSize: 50,
                  fontWeight: 900,
                  color: '#000000',
                  lineHeight: 1.4,
                  backgroundColor: '#ffffff',
                  padding: '4px 12px',
                  marginBottom: 24,
                }}
              >
                {personName} is NOT in the Epstein Files
              </span>

              {/* Monospace details - 31px Geist Mono Bold */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontFamily: 'Geist Mono',
                  fontSize: 31,
                  color: '#ffffff',
                  fontWeight: 700,
                }}
              >
                <div style={{ display: 'flex' }}>
                  {`> 0 RESULTS IN OFFICIAL DOCUMENTS (SO FAR)`}
                </div>
                <div style={{ display: 'flex' }}>
                  {`> ${vanityUrl}`}
                </div>
              </div>

              {/* Legal disclaimer - right aligned, 18px Geist Mono */}
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  bottom: 30,
                  right: 50,
                  fontSize: 18,
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: 'Geist Mono',
                  fontWeight: 700,
                }}
              >
                *No wrongdoing is alleged or implied
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 628,
          fonts,
          headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
