import aliasConfig from './aliases.json';
import { Person } from '@/types';

interface AliasMapping {
  canonical_slug: string;
  canonical_name: string;
  aliases: string[];
}

type AliasConfig = Record<string, AliasMapping>;

const aliases = aliasConfig as AliasConfig;

/**
 * Build reverse lookup map for faster alias resolution
 */
const aliasToCanonical = new Map<string, string>();
Object.entries(aliases).forEach(([canonicalSlug, mapping]) => {
  mapping.aliases.forEach(alias => {
    aliasToCanonical.set(alias, canonicalSlug);
  });
});

/**
 * Resolves an alias to its canonical slug
 * @param slug The slug to resolve
 * @returns The canonical slug, or the original if no alias found
 */
export function resolveAlias(slug: string): string {
  const normalizedSlug = slug.toLowerCase();
  
  // Check if this is an alias
  const canonical = aliasToCanonical.get(normalizedSlug);
  if (canonical) {
    return canonical;
  }
  
  // Check if this is already a canonical slug
  if (aliases[normalizedSlug]) {
    return normalizedSlug;
  }
  
  // Return original if no mapping found
  return normalizedSlug;
}

/**
 * Gets all slugs (canonical + aliases) for a person
 * @param canonicalSlug The canonical slug
 * @returns Array of all related slugs
 */
export function getAllSlugsForPerson(canonicalSlug: string): string[] {
  const mapping = aliases[canonicalSlug];
  if (!mapping) {
    return [canonicalSlug];
  }
  
  return [canonicalSlug, ...mapping.aliases];
}

/**
 * Checks if two slugs refer to the same person
 * @param slug1 First slug
 * @param slug2 Second slug
 * @returns True if they refer to the same person
 */
export function isSamePerson(slug1: string, slug2: string): boolean {
  return resolveAlias(slug1) === resolveAlias(slug2);
}

/**
 * Consolidates multiple person entries into one
 * @param people Array of person objects that are the same entity
 * @returns Single consolidated person object
 */
export function consolidatePersonEntries(people: Person[]): Person | null {
  if (people.length === 0) return null;
  if (people.length === 1) return people[0];
  
  // Use the first person as base (should be the canonical one)
  const consolidated = { ...people[0] };
  
  // Aggregate data from all entries
  let totalMatches = 0;
  let totalFileCount = 0;
  const allDocuments: typeof consolidated.documents = [];
  const seenDocuments = new Set<string>();
  
  people.forEach(person => {
    // Sum up matches and file counts
    if (person.total_matches) {
      totalMatches += person.total_matches;
    }
    if (person.pinpoint_file_count) {
      totalFileCount += person.pinpoint_file_count;
    }
    
    // Merge documents, avoiding duplicates
    if (person.documents) {
      person.documents.forEach(doc => {
        const docKey = `${doc.filename}-${doc.source_url}`;
        if (!seenDocuments.has(docKey)) {
          seenDocuments.add(docKey);
          allDocuments.push(doc);
        }
      });
    }
  });
  
  // Update consolidated object
  if (totalMatches > 0) {
    consolidated.total_matches = totalMatches;
  }
  if (totalFileCount > 0) {
    consolidated.pinpoint_file_count = totalFileCount;
  }
  if (allDocuments.length > 0) {
    consolidated.documents = allDocuments;
  }
  consolidated.found_in_documents = totalMatches > 0 || totalFileCount > 0;
  
  return consolidated;
}

/**
 * Filters out duplicate people based on aliases
 * @param people Array of people to filter
 * @param excludeCanonical Optional canonical slug to exclude from results
 * @returns Filtered array with no duplicates
 */
export function filterDuplicatePeople(people: Person[], excludeCanonical?: string): Person[] {
  const seen = new Set<string>();
  const filtered: Person[] = [];
  
  people.forEach(person => {
    const canonical = resolveAlias(person.slug);
    
    // Skip if we want to exclude this canonical person
    if (excludeCanonical && canonical === excludeCanonical) {
      return;
    }
    
    // Skip if we've already seen this canonical person
    if (seen.has(canonical)) {
      return;
    }
    
    seen.add(canonical);
    filtered.push(person);
  });
  
  return filtered;
}