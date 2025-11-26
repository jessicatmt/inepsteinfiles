import fs from 'fs/promises';
import path from 'path';
import { PeopleIndex, Person } from '@/types';

// Cache the data to avoid reading the 1.7MB file on every request
let cachedData: PeopleIndex | null = null;
let lastLoadTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Loads the people index data from the filesystem with caching
 * @returns Promise<PeopleIndex> The loaded people index data
 * @throws Error if the file cannot be read or parsed
 */
export async function loadPeopleData(): Promise<PeopleIndex> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedData && (now - lastLoadTime) < CACHE_DURATION) {
    return cachedData;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'people_index.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: PeopleIndex = JSON.parse(fileContents);

    // Validate data structure
    if (!data.people || !Array.isArray(data.people)) {
      throw new Error('Invalid data structure: missing people array');
    }

    // Update cache
    cachedData = data;
    lastLoadTime = now;

    return data;
  } catch (error) {
    // Log detailed error server-side for debugging
    console.error('Error loading people data:', error);

    // Return generic error messages to clients to avoid information disclosure
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new Error('Data source unavailable. Please try again later.');
      } else if (error instanceof SyntaxError) {
        throw new Error('Data format error. Please try again later.');
      }
    }
    // Generic error for all other cases - don't expose internal details
    throw new Error('Failed to load data. Please try again later.');
  }
}

/**
 * Finds a person by their slug with smart matching
 * @param slug The URL slug to search for
 * @returns Promise<Person | null> The person data or null if not found
 *
 * Matching priority:
 * 1. Exact slug match
 * 2. Slug ends with the search term (e.g., "obama" matches "barack-obama")
 * 3. Slug contains the search term as a word boundary
 */
export async function getPersonData(slug: string): Promise<Person | null> {
  try {
    const data = await loadPeopleData();
    const normalizedSlug = slug.toLowerCase();

    // 1. Exact match
    const exactMatch = data.people.find((p) => p.slug === normalizedSlug);
    if (exactMatch) return exactMatch;

    // 2. Slug ends with search term (e.g., "obama" → "barack-obama")
    const endMatch = data.people.find((p) =>
      p.slug.endsWith('-' + normalizedSlug) || p.slug.endsWith(normalizedSlug)
    );
    if (endMatch) return endMatch;

    // 3. Search term is a word in the slug (e.g., "clinton" → "bill-clinton")
    const wordMatch = data.people.find((p) => {
      const slugParts = p.slug.split('-');
      return slugParts.includes(normalizedSlug);
    });
    if (wordMatch) return wordMatch;

    return null;
  } catch (error) {
    console.error('Error loading person data:', error);
    // Re-throw to let calling code handle it
    throw error;
  }
}

/**
 * Clears the data cache (useful for testing)
 */
export function clearCache(): void {
  cachedData = null;
  lastLoadTime = 0;
}
