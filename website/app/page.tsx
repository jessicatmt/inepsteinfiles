'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TrendingSearch {
  name: string;
  count: number;
  lastSearched: number;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState<TrendingSearch[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch trending searches on load
    fetch('/api/track-search')
      .then((res) => res.json())
      .then((data) => {
        if (data.trending) {
          setTrending(data.trending);
        }
      })
      .catch(() => {
        // Silently fail
      });
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const name = searchQuery.trim();
    if (name) {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      router.push(`/${slug}`);
    }
  };

  const formatName = (slug: string) => {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-3xl md:text-5xl font-bold uppercase tracking-tight mb-16">
            <span>IS</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="type a name"
              className="text-center text-2xl md:text-4xl h-14 md:h-16 border-2 border-black px-4 font-bold uppercase max-w-md w-full bg-white focus:outline-none focus:border-black"
              required
              autoComplete="off"
            />
            <span className="whitespace-nowrap">IN THE EPSTEIN FILES?</span>
          </div>
        </form>

        {/* Trending Searches Widget */}
        {trending.length > 0 && (
          <div className="max-w-2xl mx-auto mt-16 border-t border-gray-300 pt-8">
            <h2 className="text-center text-sm uppercase tracking-wide text-gray-600 mb-6">
              Most Searched (24 hours)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {trending.slice(0, 6).map((search) => (
                <Link
                  key={search.name}
                  href={`/${search.name}`}
                  className="text-center py-3 px-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
                >
                  <div className="font-semibold text-sm">{formatName(search.name)}</div>
                  <div className="text-xs text-gray-600 mt-1">{search.count} searches</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-xs text-gray-600">
          <Link href="https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&spt=2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
            Browse full database (5000+ documents)
          </Link>
          {' • '}
          <Link href="/" className="text-gray-600 hover:underline">about</Link>
          {' • '}
          <a href="https://twitter.com/jessicasuarez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
            @jessicasuarez
          </a>
        </div>
      </div>
    </main>
  );
}
