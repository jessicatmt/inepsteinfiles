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
    if (error instanceof Error) {
      // Provide more context for different error types
      if (error.message.includes('ENOENT')) {
        throw new Error('People index file not found. Please ensure people_index.json exists in the public directory.');
      } else if (error instanceof SyntaxError) {
        throw new Error('People index file contains invalid JSON. Please check the file format.');
      }
      throw new Error(`Failed to load people data: ${error.message}`);
    }
    throw new Error('Failed to load people data: Unknown error');
  }
}

/**
 * Finds a person by their slug
 * @param slug The URL slug to search for
 * @returns Promise<Person | null> The person data or null if not found
 */
export async function getPersonData(slug: string): Promise<Person | null> {
  try {
    const data = await loadPeopleData();
    return data.people.find((p) => p.slug === slug) || null;
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
