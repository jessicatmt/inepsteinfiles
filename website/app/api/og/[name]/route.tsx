import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getPersonData } from '@/lib/data';

// Use edge runtime for faster OG image generation
export const runtime = 'edge';

// Cache OG images for 1 hour at the edge, revalidate in background
export const revalidate = 3600;

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

    // Person is "found" if they have documents OR a Pinpoint entity ID  
    const found = person.found_in_documents || !!person.pinpoint_entity_id;
    const answer = found ? 'YES' : 'NO';
    const answerColor = found ? '#dc2626' : '#000000';
    const subtitle = `${person.display_name.toUpperCase()} ${found ? 'IS' : 'IS NOT'} IN THE EPSTEIN FILES`;
    
    // Use Pinpoint file count or document matches for display
    const fileCount = person.pinpoint_file_count || person.total_matches || 0;
    const meta = `${fileCount} result${fileCount !== 1 ? 's' : ''} in official records. No wrongdoing implied.`;
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

          {/* Meta */}
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: '#666666',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {meta}
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
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
