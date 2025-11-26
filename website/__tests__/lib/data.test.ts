import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getPersonData, loadPeopleData, clearCache } from '@/lib/data';
import fs from 'fs/promises';

// Mock the filesystem
jest.mock('fs/promises', () => ({
  readFile: jest.fn()
}));
const mockFs = jest.mocked(fs);

describe('Data Loading Functions', () => {
  beforeEach(() => {
    // Clear cache and mocks before each test
    clearCache();
    jest.clearAllMocks();
  });

  describe('loadPeopleData', () => {
    const mockData = {
      _metadata: {
        version: '1.0',
        generated: '2024-11-19',
        description: 'Test data',
        total_names: 2,
        total_documents: 1
      },
      people: [
        {
          display_name: 'Test Person',
          slug: 'test-person',
          priority: 'P0',
          category: 'Test',
          found_in_documents: true,
          total_matches: 1,
          documents: []
        },
        {
          display_name: 'Another Person',
          slug: 'another-person',
          priority: 'P1',
          category: 'Test',
          found_in_documents: false,
          total_matches: 0,
          documents: []
        }
      ]
    };

    it('should successfully load and parse people data', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const result = await loadPeopleData();

      expect(result).toEqual(mockData);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('people_index.json'),
        'utf8'
      );
    });

    it('should cache data and not read file on subsequent calls', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockData));

      // First call
      await loadPeopleData();
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await loadPeopleData();
      expect(mockFs.readFile).toHaveBeenCalledTimes(1); // Still 1
    });

    it('should throw error when file is not found', async () => {
      const error = new Error('ENOENT: no such file or directory');
      mockFs.readFile.mockRejectedValue(error);

      await expect(loadPeopleData()).rejects.toThrow(
        'Data source unavailable'
      );
    });

    it('should throw error when JSON is invalid', async () => {
      mockFs.readFile.mockResolvedValue('{ invalid json }');

      await expect(loadPeopleData()).rejects.toThrow(
        'Failed to load data'
      );
    });

    it('should throw error when data structure is invalid', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({ wrong: 'structure' }));

      await expect(loadPeopleData()).rejects.toThrow(
        'Invalid data structure: missing people array'
      );
    });
  });

  describe('getPersonData', () => {
    const mockData = {
      _metadata: {
        version: '1.0',
        generated: '2024-11-19',
        description: 'Test data',
        total_names: 2,
        total_documents: 1
      },
      people: [
        {
          display_name: 'Test Person',
          slug: 'test-person',
          priority: 'P0',
          category: 'Test',
          found_in_documents: true,
          total_matches: 1,
          documents: []
        },
        {
          display_name: 'Another Person',
          slug: 'another-person',
          priority: 'P1',
          category: 'Test',
          found_in_documents: false,
          total_matches: 0,
          documents: []
        }
      ]
    };

    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockData));
    });

    it('should return person when slug matches', async () => {
      const person = await getPersonData('test-person');

      expect(person).not.toBeNull();
      expect(person?.display_name).toBe('Test Person');
      expect(person?.slug).toBe('test-person');
    });

    it('should return null when slug does not match', async () => {
      const person = await getPersonData('non-existent-person');

      expect(person).toBeNull();
    });

    it('should handle errors from loadPeopleData', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File read error'));

      await expect(getPersonData('test-person')).rejects.toThrow();
    });

    it('should use cached data for multiple lookups', async () => {
      // First lookup
      await getPersonData('test-person');
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);

      // Second lookup should use cache
      await getPersonData('another-person');
      expect(mockFs.readFile).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  describe('clearCache', () => {
    it('should clear cache and force reload on next call', async () => {
      const mockData = {
        _metadata: {
          version: '1.0',
          generated: '2024-11-19',
          description: 'Test data',
          total_names: 1,
          total_documents: 1
        },
        people: []
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockData));

      // First load
      await loadPeopleData();
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);

      // Clear cache
      clearCache();

      // Second load should read file again
      await loadPeopleData();
      expect(mockFs.readFile).toHaveBeenCalledTimes(2);
    });
  });
});
