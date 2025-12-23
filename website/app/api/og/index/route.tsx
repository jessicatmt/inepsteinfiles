import { ImageResponse } from 'next/og';

export async function GET() {
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
            fontSize: 32,
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
            fontSize: 24,
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
    }
  );
}
