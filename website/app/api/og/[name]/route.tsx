/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
// Note: OG image routes use @vercel/og ImageResponse which requires <img> tags, not Next.js Image
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import peopleData from '@/public/people_index.json';

// Use Edge runtime for faster cold starts
export const runtime = 'edge';

// Simple in-memory rate limiter for Edge runtime
// Note: This resets on cold starts, but provides basic DoS protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

// Sanitize and validate the name parameter
function sanitizeName(name: string): string {
  // Truncate to reasonable length and only allow alphanumeric + hyphens
  return name
    .slice(0, 100)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper to split text into lines that fit within maxChars
// This creates the "highlighter" effect where each line has its own background
function splitIntoLines(text: string, maxChars: number = 38): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxChars) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

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
  // Rate limiting check
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  if (isRateLimited(ip)) {
    return new Response('Too many requests. Please try again later.', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'Content-Type': 'text/plain',
      },
    });
  }

  try {
    const { name: rawName } = await params;

    // Sanitize the name parameter to prevent content spoofing
    const name = sanitizeName(rawName);

    // If name is empty after sanitization, return a generic error
    if (!name) {
      return new Response('Invalid name parameter', { status: 400 });
    }

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

            {/* Content overlay - moved up to avoid page title overlay */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: '30px 50px',
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              {/* Giant YES - 238px Public Sans BLACK, centered horizontally, with black stroke */}
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  fontFamily: 'Public Sans',
                  fontSize: 238,
                  fontWeight: 900,
                  lineHeight: 0.9,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  marginBottom: 20,
                  textShadow: '-4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000, 0 -4px 0 #000, 0 4px 0 #000, -4px 0 0 #000, 4px 0 0 #000',
                }}
              >
                YES
              </div>

              {/* Name line - highlighted text effect that hugs the text */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginBottom: 24,
                  gap: 4,
                }}
              >
                {splitIntoLines(`${personName} IS in the Epstein Files`).map((line, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'Public Sans',
                      fontSize: 50,
                      fontWeight: 900,
                      color: '#ffffff',
                      backgroundColor: 'rgba(0, 0, 0, 0.92)',
                      padding: '6px 14px',
                      lineHeight: 1.1,
                    }}
                  >
                    {line}
                  </span>
                ))}
              </div>

              {/* Monospace details - 31px Geist Mono Bold, arrows in bright red */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontFamily: 'Geist Mono',
                  fontSize: 31,
                  fontWeight: 700,
                }}
              >
                <div style={{ display: 'flex' }}>
                  <span style={{ color: '#FF3333' }}>{`> `}</span>
                  <span style={{ color: '#ffffff' }}>{`${fileCount} RESULTS IN OFFICIAL DOCUMENTS (SO FAR)`}</span>
                </div>
                <div style={{ display: 'flex' }}>
                  <span style={{ color: '#FF3333' }}>{`> `}</span>
                  <span style={{ color: '#ffffff' }}>{vanityUrl}</span>
                </div>
                <div style={{ display: 'flex' }}>
                  <span style={{ color: '#FF3333' }}>{`> `}</span>
                  <span style={{ color: '#ffffff' }}>{`NO WRONGDOING IS ALLEGED OR IMPLIED`}</span>
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

            {/* Content overlay - moved up to avoid page title overlay */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: '30px 50px',
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              {/* Giant NO - 238px Public Sans BLACK, centered horizontally, with black stroke */}
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  fontFamily: 'Public Sans',
                  fontSize: 238,
                  fontWeight: 900,
                  lineHeight: 0.9,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  marginBottom: 20,
                  textShadow: '-4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000, 0 -4px 0 #000, 0 4px 0 #000, -4px 0 0 #000, 4px 0 0 #000',
                }}
              >
                NO
              </div>

              {/* Name line - highlighted text effect that hugs the text */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginBottom: 24,
                  gap: 4,
                }}
              >
                {splitIntoLines(`${personName} is NOT in the Epstein Files`).map((line, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'Public Sans',
                      fontSize: 50,
                      fontWeight: 900,
                      color: '#000000',
                      backgroundColor: '#ffffff',
                      padding: '6px 14px',
                      lineHeight: 1.1,
                    }}
                  >
                    {line}
                  </span>
                ))}
              </div>

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

              {/* Legal disclaimer - right aligned, 18px Geist Mono, light gray */}
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  bottom: 30,
                  right: 50,
                  fontSize: 18,
                  color: '#AAAAAA',
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
