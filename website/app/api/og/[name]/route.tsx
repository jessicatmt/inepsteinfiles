import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function getPersonData(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/people_index.json`);
  const data = await response.json();
  return data.people.find((p: any) => p.slug === slug) || null;
}

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
              backgroundColor: '#000',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: 60, fontWeight: 'bold' }}>
              Name Not Found
            </div>
            <div style={{ fontSize: 32, marginTop: 20, color: '#999' }}>
              InEpsteinFiles.com
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    const found = person.found_in_documents;
    const answerText = found ? 'IS' : 'IS NOT';
    const answerColor = found ? '#dc2626' : '#fff';

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
            backgroundColor: '#000',
            color: '#fff',
            padding: '80px',
          }}
        >
          {/* Site branding */}
          <div
            style={{
              fontSize: 28,
              color: '#666',
              marginBottom: 40,
              fontWeight: 'normal',
            }}
          >
            InEpsteinFiles.com
          </div>

          {/* Main question */}
          <div
            style={{
              fontSize: 48,
              textAlign: 'center',
              marginBottom: 40,
              fontWeight: 'normal',
              lineHeight: 1.2,
            }}
          >
            Is <span style={{ fontWeight: 'bold' }}>{person.display_name}</span>
            <br />
            in the Epstein files?
          </div>

          {/* Answer */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 'black',
              color: answerColor,
              marginBottom: 40,
            }}
          >
            {answerText}
          </div>

          {/* Stats for found names */}
          {found && (
            <div
              style={{
                fontSize: 24,
                color: '#999',
                textAlign: 'center',
              }}
            >
              {person.total_matches} matches across {person.documents.length}{' '}
              document{person.documents.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
