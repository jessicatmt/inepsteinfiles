import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
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
