import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const revalidate = 300; // Cache for 5 minutes

// Rate limit config for trending endpoint (read-only, more generous)
const TRENDING_RATE_LIMIT = { windowMs: 60 * 1000, maxRequests: 60 };

export async function GET(request: NextRequest) {
  // Rate limiting to prevent enumeration/scraping
  const ip = getClientIp(request);
  const rateLimitResult = await checkRateLimit({
    ...TRENDING_RATE_LIMIT,
    identifier: `trending:${ip}`,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', trending: [] },
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
    const supabase = getSupabaseClient();

    // Query the trending_searches view
    const { data, error } = await supabase
      .from('trending_searches')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Failed to fetch trending searches:', error);
      return NextResponse.json({ trending: [] });
    }

    // Format the data
    const trending = (data || []).map(item => ({
      slug: item.slug,
      display_name: item.display_name,
      search_count: item.search_count,
    }));

    return NextResponse.json({ trending });
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json({ trending: [] });
  }
}
