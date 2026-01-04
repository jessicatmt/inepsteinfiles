'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TrendingSearch {
  slug: string;
  display_name: string;
  search_count: number;
}

export default function MostSearched() {
  const [trending, setTrending] = useState<TrendingSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trending')
      .then(res => res.json())
      .then(data => {
        setTrending(data.trending || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to load trending searches:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="text-center text-gray-400 text-sm">
        Loading trending searches...
      </div>
    );
  }

  if (trending.length === 0) {
    return null; // Don't show anything if no data
  }

  return (
    <div className="mt-12 text-center">
      <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-4 font-bold">
        Trending Searches
      </h2>
      <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
        {trending.slice(0, 8).map((item) => (
          <Link
            key={item.slug}
            href={`/${item.slug}`}
            className="px-3 py-1.5 text-sm border border-gray-300 hover:border-black hover:bg-gray-50 transition-colors rounded"
          >
            {item.display_name}
          </Link>
        ))}
      </div>
    </div>
  );
}
