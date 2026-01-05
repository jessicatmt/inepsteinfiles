import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Rate limiting to prevent trending data manipulation
  const ip = getClientIp(request);
  const rateLimitResult = await checkRateLimit({
    ...RATE_LIMITS.trackSearch,
    identifier: `track-search:${ip}`,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
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
    const { slug, display_name } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid slug parameter' },
        { status: 400 }
      );
    }

    // Track the search in Supabase
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('searches')
      .insert([
        {
          slug: slug.toLowerCase(),
          display_name: display_name || slug,
        }
      ]);

    if (error) {
      console.error('Failed to track search:', error);
      // Don't fail the request if tracking fails - graceful degradation
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track search error:', error);
    // Graceful degradation - don't fail the request
    return NextResponse.json({ success: true });
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
