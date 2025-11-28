import { NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import { loadPeopleData } from '@/lib/data';
import { filterDuplicatePeople } from '@/lib/aliasResolver';

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
    
    // Search and get more results initially to account for duplicates
    const results = fuse.search(query).slice(0, 20);
    
    // Extract the person objects and filter duplicates
    const people = results.map(r => r.item);
    const dedupedPeople = filterDuplicatePeople(people);
    
    // Format results for the frontend, limiting to 8 after deduplication
    const formattedResults = dedupedPeople.slice(0, 8).map(person => ({
      slug: person.slug,
      display_name: person.display_name,
      found_in_documents: person.found_in_documents || false,
      pinpoint_file_count: person.pinpoint_file_count || 0
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