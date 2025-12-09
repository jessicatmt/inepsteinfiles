import fs from 'fs/promises';
import path from 'path';
import { PeopleIndex, Person } from '@/types';
import { resolveAlias, getAllSlugsForPerson, consolidatePersonEntries, filterDuplicatePeople } from './aliasResolver';

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
 * Finds a person by their slug with smart matching and alias resolution
 * @param slug The URL slug to search for
 * @returns Promise<Person | null> The person data or null if not found
 *
 * Matching priority:
 * 1. Resolve aliases to canonical slug
 * 2. Find all entries for this person (canonical + variations)
 * 3. Consolidate into single entry with aggregated data
 * 4. Fallback to original matching if no alias found
 */
export async function getPersonData(slug: string): Promise<Person | null> {
  try {
    const data = await loadPeopleData();
    const normalizedSlug = slug.toLowerCase();
    
    // First, resolve any aliases to canonical slug
    const canonicalSlug = resolveAlias(normalizedSlug);
    
    // Get all related slugs for this person
    const allSlugs = getAllSlugsForPerson(canonicalSlug);
    
    // Find all entries that match any of these slugs
    const matchingPeople: Person[] = [];
    allSlugs.forEach(searchSlug => {
      const match = data.people.find(p => p.slug === searchSlug);
      if (match) {
        matchingPeople.push(match);
      }
    });
    
    // If we found matches via alias resolution, consolidate them
    if (matchingPeople.length > 0) {
      return consolidatePersonEntries(matchingPeople);
    }
    
    // Fallback to original matching logic for names not in alias config
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
 * Finds all people that match a search term, with deduplication via aliases
 * @param slug The search term
 * @returns Promise<Person[]> Array of matching people (deduplicated)
 */
export async function findAllMatches(slug: string): Promise<Person[]> {
  try {
    const data = await loadPeopleData();
    const normalizedSlug = slug.toLowerCase();
    const matches: Person[] = [];

    // Find all matches (exact, ends with, contains)
    data.people.forEach((person) => {
      // Exact match
      if (person.slug === normalizedSlug) {
        matches.push(person);
        return;
      }
      
      // Slug ends with search term
      if (person.slug.endsWith('-' + normalizedSlug) || person.slug.endsWith(normalizedSlug)) {
        matches.push(person);
        return;
      }
      
      // Search term is a word in the slug
      const slugParts = person.slug.split('-');
      if (slugParts.includes(normalizedSlug)) {
        matches.push(person);
      }
    });

    // Filter out duplicates based on aliases
    // This ensures we don't show "Bill Clinton", "William J. Clinton", etc. as separate results
    return filterDuplicatePeople(matches);
  } catch (error) {
    console.error('Error finding matches:', error);
    return [];
  }
}

/**
 * Clears the data cache (useful for testing)
 */
export function clearCache(): void {
  cachedData = null;
  lastLoadTime = 0;
}

/**
 * Gets the last updated date from the people index metadata
 * @returns Promise<string> Formatted date string (e.g., "december 9, 2024")
 */
export async function getLastUpdatedDate(): Promise<string> {
  const data = await loadPeopleData();
  const dateStr = data._metadata?.last_manual_update || '2024-11-25';

  // Parse the date string (format: YYYY-MM-DD)
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
