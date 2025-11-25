import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Simple in-memory cache to avoid excessive file I/O
let searchCache: { [key: string]: { count: number; lastSearched: number } } = {};
let lastSaveTime = 0;
const SAVE_INTERVAL = 30000; // Save to disk every 30 seconds
const DATA_FILE = path.join(process.cwd(), 'data', 'searches.json');

interface SearchData {
  searches: {
    [name: string]: {
      count: number;
      lastSearched: number;
    };
  };
}

// Load searches from disk on startup
async function loadSearches(): Promise<void> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed: SearchData = JSON.parse(data);
    searchCache = parsed.searches || {};
  } catch {
    // File doesn't exist yet or is invalid, start with empty cache
    searchCache = {};
  }
}

// Save searches to disk
async function saveSearches(): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE);
    await fs.mkdir(dataDir, { recursive: true });

    const data: SearchData = {
      searches: searchCache,
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    lastSaveTime = Date.now();
  } catch {
    console.error('Failed to save search data');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    // Load data if cache is empty
    if (Object.keys(searchCache).length === 0) {
      await loadSearches();
    }

    // Update search count
    if (!searchCache[name]) {
      searchCache[name] = { count: 0, lastSearched: 0 };
    }
    searchCache[name].count += 1;
    searchCache[name].lastSearched = Date.now();

    // Save to disk if enough time has passed
    if (Date.now() - lastSaveTime > SAVE_INTERVAL) {
      await saveSearches();
    }

    return NextResponse.json({ success: true, count: searchCache[name].count });
  } catch {
    console.error('Track search error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to retrieve trending searches
export async function GET() {
  try {
    // Load data if cache is empty
    if (Object.keys(searchCache).length === 0) {
      await loadSearches();
    }

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    // Get searches from last 24 hours
    const recentSearches = Object.entries(searchCache)
      .filter(([, data]) => data.lastSearched > oneDayAgo)
      .map(([name, data]) => ({
        name,
        count: data.count,
        lastSearched: data.lastSearched,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    return NextResponse.json({ trending: recentSearches });
  } catch {
    console.error('Get trending error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
