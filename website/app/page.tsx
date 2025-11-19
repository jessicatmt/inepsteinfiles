'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PeopleIndex, Person } from '@/types';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [peopleData, setPeopleData] = useState<PeopleIndex | null>(null);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load people data on mount
  useEffect(() => {
    fetch('/people_index.json')
      .then(res => res.json())
      .then(data => setPeopleData(data))
      .catch(err => console.error('Failed to load people data:', err));
  }, []);

  // Filter people based on search query
  useEffect(() => {
    if (!peopleData || !searchQuery.trim()) {
      setFilteredPeople([]);
      setShowDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matches = peopleData.people
      .filter(person => person.display_name.toLowerCase().includes(query))
      .slice(0, 8); // Limit to 8 results

    setFilteredPeople(matches);
    setShowDropdown(matches.length > 0);
  }, [searchQuery, peopleData]);

  const stats = peopleData?._metadata || {
    total_names: 0,
    total_documents: 0,
  };

  const foundCount = peopleData?.people.filter(p => p.found_in_documents).length || 0;
  const totalMatches = peopleData?.people.reduce((sum, p) => sum + p.total_matches, 0) || 0;

  const quickLinks = [
    { name: 'Bill Clinton', slug: 'bill-clinton' },
    { name: 'Donald Trump', slug: 'donald-trump' },
    { name: 'Prince Andrew', slug: 'prince-andrew' },
    { name: 'Ghislaine Maxwell', slug: 'ghislaine-maxwell' },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          InEpsteinFiles.com
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
          Search publicly released Epstein documents from official U.S. government sources
        </p>
      </header>

      {/* Search Section */}
      <div className="max-w-2xl mx-auto mb-16">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (filteredPeople.length > 0) setShowDropdown(true);
            }}
            placeholder="Search for a name..."
            className="w-full px-6 py-4 text-lg bg-gray-900 border border-gray-700 rounded-lg focus:border-white focus:outline-none text-white placeholder-gray-500"
          />

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {filteredPeople.map((person) => (
                <Link
                  key={person.slug}
                  href={`/${person.slug}`}
                  className="block px-6 py-3 hover:bg-gray-800 border-b border-gray-800 last:border-b-0 transition-colors"
                  onClick={() => {
                    setShowDropdown(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{person.display_name}</span>
                    <span className={`text-sm ${person.found_in_documents ? 'text-red-500' : 'text-gray-500'}`}>
                      {person.found_in_documents ? `${person.total_matches} matches` : 'Not found'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-3">Popular searches:</p>
          <div className="flex flex-wrap gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.slug}
                href={`/${link.slug}`}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {peopleData && (
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              {foundCount}
            </div>
            <div className="text-sm text-gray-400">Names Found</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              {stats.total_names}
            </div>
            <div className="text-sm text-gray-400">Total Searched</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              {totalMatches.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Matches</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              {stats.total_documents}
            </div>
            <div className="text-sm text-gray-400">Documents</div>
          </div>
        </div>
      )}

      {/* About Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">About This Search Engine</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              InEpsteinFiles.com indexes publicly released documents from official U.S. government sources,
              including Congressional committees, the Department of Justice, and the FBI.
            </p>
            <p>
              Our mission is to make these documents searchable and accessible. We provide direct links to
              official sources for verification and transparency.
            </p>
            <p className="text-sm text-gray-500">
              <strong>Important:</strong> Appearance in these documents does not imply wrongdoing.
              Documents are marked UNVERIFIED pending SHA-256 hash verification against official government sources.
            </p>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer Footer */}
      <footer className="max-w-4xl mx-auto pt-8 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">
          This search engine indexes publicly released documents from official U.S. government sources.
          Appearance in these documents does not imply wrongdoing. Documents are marked UNVERIFIED pending
          SHA-256 hash verification against official government sources.
        </p>
        <p className="text-xs text-gray-600 text-center mt-4">
          © 2024 InEpsteinFiles.com • All documents sourced from public government releases
        </p>
      </footer>
    </main>
  );
}
