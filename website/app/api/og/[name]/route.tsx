import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getPersonData } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const person = await getPersonData(name);

    if (!person) {
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
            }}
          >
            <div style={{ display: 'flex', fontSize: 120, fontWeight: 900 }}>404</div>
            <div style={{ display: 'flex', fontSize: 40, marginTop: 20 }}>Not Found</div>
          </div>
        ),
        {
          width: 1200,
          height: 628,
        }
      );
    }

    const found = person.found_in_documents;
    const answer = found ? 'YES' : 'NO';
    const answerColor = found ? '#dc2626' : '#000000';
    const subtitle = `${person.display_name.toUpperCase()} ${found ? 'IS' : 'IS NOT'} IN THE EPSTEIN FILES`;
    const matchCount = `${person.total_matches} mention${person.total_matches !== 1 ? 's' : ''} in official records`;
    const disclaimer = 'No wrongdoing is alleged or implied.';
    const vanityUrl = `${person.slug}.inepsteinfiles.com`;

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
          {/* YES/NO Answer */}
          <div
            style={{
              display: 'flex',
              fontSize: 200,
              fontWeight: 900,
              lineHeight: 1,
              color: answerColor,
              marginBottom: 40,
            }}
          >
            {answer}
          </div>

          {/* Subtitle */}
          <div
            style={{
              display: 'flex',
              fontSize: 42,
              fontWeight: 700,
              textAlign: 'center',
              color: '#000000',
              marginBottom: 60,
              letterSpacing: '0.05em',
            }}
          >
            {subtitle}
          </div>

          {/* Match Count */}
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: '#666666',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {matchCount}
          </div>

          {/* Disclaimer */}
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: '#999999',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {disclaimer}
          </div>

          {/* Proof link */}
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              color: '#999999',
              textAlign: 'center',
            }}
          >
            {`Proof: ${vanityUrl}`}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 628,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
