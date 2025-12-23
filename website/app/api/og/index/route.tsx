import { ImageResponse } from 'next/og';

// Use Edge runtime for faster cold starts
export const runtime = 'edge';

// Load font at module level (bundled with the edge function)
const publicSansBlack = fetch(
  new URL('../fonts/PublicSans-Black.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

export async function GET() {
  const publicSansBlackData = await publicSansBlack;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          padding: '80px',
        }}
      >
        {/* Question */}
        <div
          style={{
            display: 'flex',
            fontFamily: 'Public Sans',
            fontSize: 72,
            fontWeight: 900,
            textAlign: 'center',
            color: '#000000',
            lineHeight: 1.2,
            marginBottom: 60,
            letterSpacing: '-0.02em',
          }}
        >
          IS [NAME] IN THE EPSTEIN FILES?
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'Public Sans',
            fontSize: 32,
            fontWeight: 900,
            color: '#666666',
            textAlign: 'center',
            marginBottom: 40,
            lineHeight: 1.4,
          }}
        >
          <span>No paywall. No login. No allegations.</span>
          <span>Just the official public documents.</span>
        </div>

        {/* URL */}
        <div
          style={{
            display: 'flex',
            fontFamily: 'Public Sans',
            fontSize: 24,
            fontWeight: 900,
            color: '#999999',
            textAlign: 'center',
          }}
        >
          inepsteinfiles.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 628,
      fonts: [
        {
          name: 'Public Sans',
          data: publicSansBlackData,
          style: 'normal' as const,
          weight: 900 as const,
        },
      ],
    }
  );
}
