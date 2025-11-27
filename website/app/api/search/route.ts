import { NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import { loadPeopleData } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] });
    }

    const data = await loadPeopleData();
    
    // Configure Fuse.js for fuzzy search
    const fuse = new Fuse(data.people, {
      keys: [
        { name: 'display_name', weight: 2 },
        { name: 'slug', weight: 1 },
        { name: 'entity_name', weight: 1.5 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 1,
      shouldSort: true
    });
    
    // Search and limit to top 8 results
    const results = fuse.search(query).slice(0, 8);
    
    // Format results for the frontend
    const formattedResults = results.map(result => ({
      slug: result.item.slug,
      display_name: result.item.display_name,
      found_in_documents: result.item.found_in_documents || false,
      pinpoint_file_count: result.item.pinpoint_file_count || 0,
      score: result.score
    }));
    
    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}