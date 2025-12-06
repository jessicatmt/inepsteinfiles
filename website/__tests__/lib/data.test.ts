import { describe, it, expect, beforeEach } from '@jest/globals';
import { getPersonData, loadPeopleData, clearCache } from '@/lib/data';

// Integration tests using actual data file
describe('Data Loading Functions', () => {
  beforeEach(() => {
    // Clear cache before each test to ensure fresh data
    clearCache();
  });

  describe('loadPeopleData', () => {
    it('should successfully load and parse people data', async () => {
      const result = await loadPeopleData();

      expect(result).toBeDefined();
      expect(result._metadata).toBeDefined();
      expect(result.people).toBeDefined();
      expect(Array.isArray(result.people)).toBe(true);
      expect(result.people.length).toBeGreaterThan(0);
    });

    it('should cache data and return same reference on subsequent calls', async () => {
      const result1 = await loadPeopleData();
      const result2 = await loadPeopleData();

      // Should be the same cached object
      expect(result1).toBe(result2);
    });

    it('should have valid metadata structure', async () => {
      const result = await loadPeopleData();

      expect(result._metadata.version).toBeDefined();
      expect(result._metadata.total_names).toBeGreaterThan(0);
    });
  });

  describe('getPersonData', () => {
    it('should return person when slug matches exactly', async () => {
      const person = await getPersonData('bill-clinton');

      expect(person).not.toBeNull();
      expect(person?.slug).toBe('bill-clinton');
      expect(person?.display_name).toBeDefined();
    });

    it('should return null when slug does not match any person', async () => {
      const person = await getPersonData('definitely-not-a-real-person-xyz');

      expect(person).toBeNull();
    });

    it('should find person with partial slug match', async () => {
      // "clinton" should match "bill-clinton" via the matching algorithm
      const person = await getPersonData('clinton');

      expect(person).not.toBeNull();
      expect(person?.slug).toContain('clinton');
    });

    it('should use cached data for multiple lookups', async () => {
      // First lookup loads data
      await getPersonData('bill-clinton');

      // Second lookup should use cache (no way to directly verify, but should not throw)
      const person = await getPersonData('ghislaine-maxwell');

      expect(person).not.toBeNull();
      expect(person?.slug).toBe('ghislaine-maxwell');
    });
  });

  describe('clearCache', () => {
    it('should allow fresh data load after clearing', async () => {
      // Load data
      const result1 = await loadPeopleData();

      // Clear cache
      clearCache();

      // Load again - should still work (fresh load)
      const result2 = await loadPeopleData();

      // Both should have valid data
      expect(result1.people.length).toBeGreaterThan(0);
      expect(result2.people.length).toBeGreaterThan(0);
    });
  });
});
