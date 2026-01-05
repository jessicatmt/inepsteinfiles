import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';

// Sanitize the name parameter
function sanitizeName(name: string): string {
  return name
    .slice(0, 100)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: NextRequest) {
  // Get client IP using secure method
  const ip = getClientIp(request);

  // Check rate limit using persistent Supabase storage
  const rateLimitResult = await checkRateLimit({
    ...RATE_LIMITS.report,
    identifier: `report:${ip}`,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many reports. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const name = sanitizeName(body.name || '');
    const timestamp = body.timestamp || new Date().toISOString();

    if (!name) {
      return NextResponse.json(
        { error: 'Invalid name parameter' },
        { status: 400 }
      );
    }

    // Log the report - visible in Vercel logs
    console.log(`[FAKE NEWS REPORT] name="${name}" ip="${ip}" timestamp="${timestamp}"`);

    // Store in Supabase (fire and forget - don't block response)
    try {
      const supabase = getSupabaseClient();
      await supabase.from('reports').insert({ slug: name });
    } catch (dbError) {
      // Log but don't fail the request
      console.error('Failed to store report in database:', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully',
      name,
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
