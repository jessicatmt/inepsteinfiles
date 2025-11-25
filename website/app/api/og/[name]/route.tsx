import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import peopleData from '@/public/people_index.json';

// Cache OG images for 1 day
export const revalidate = 86400;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    // Use static import instead of file system read for edge compatibility
    const person = peopleData.people.find((p: { slug: string }) => p.slug === name);

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

    // Person is "found" if they have documents OR Pinpoint file count > 0
    const found = person.found_in_documents || (person.pinpoint_file_count && person.pinpoint_file_count > 0);
    const answer = found ? 'YES' : 'NO';
    // YES = red, NO = green
    const answerColor = found ? '#dc2626' : '#16a34a';

    // Use Pinpoint file count or document matches for display
    const fileCount = person.pinpoint_file_count || person.total_matches || 0;
    const meta = `${fileCount} result${fileCount !== 1 ? 's' : ''} in official records`;
    const vanityUrl = `${person.slug}.inepsteinfiles.com`;
    const legalDisclaimer = 'No wrongdoing alleged or implied. See: inepsteinfiles.com/about';
    const oneLiner = person.custom_content?.one_liner || null;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: 'white',
            paddingTop: 30,
            paddingLeft: 60,
            paddingRight: 60,
          }}
        >
          {/* YES/NO Answer - bigger, bolder, higher */}
          <div
            style={{
              display: 'flex',
              fontSize: 280,
              fontWeight: 900,
              lineHeight: 1,
              color: answerColor,
              marginBottom: 10,
            }}
          >
            {answer}
          </div>

          {/* Name line - name larger/emphasized */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#000000',
              marginBottom: 8,
              letterSpacing: '0.02em',
            }}
          >
            <div style={{ display: 'flex', fontSize: 52, fontWeight: 700 }}>{person.display_name.toUpperCase()}</div>
            <div style={{ display: 'flex', fontSize: 40, fontWeight: 400, marginLeft: 14, color: '#333333' }}>{found ? 'IS' : 'IS NOT'} IN THE EPSTEIN FILES</div>
          </div>

          {/* Custom one-liner if exists - above results count */}
          {oneLiner && (
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                color: '#444444',
                textAlign: 'center',
                fontStyle: 'italic',
                marginBottom: 12,
                maxWidth: '80%',
              }}
            >
              {oneLiner}
            </div>
          )}

          {/* Meta - results count, no period */}
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              color: '#666666',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {meta}
          </div>

          {/* Vanity URL */}
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              color: '#999999',
              textAlign: 'center',
            }}
          >
            {vanityUrl}
          </div>

          {/* Legal disclaimer - bottom section */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 40,
              fontSize: 16,
              color: '#aaaaaa',
              textAlign: 'center',
            }}
          >
            {legalDisclaimer}
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
