'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const name = searchQuery.trim();
    if (name) {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      router.push(`/${slug}`);
    }
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

        {/* Footer */}
        <div className="text-center mt-16 text-xs text-gray-600">
          <Link href="https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&spt=2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
            Browse full database (5000+ documents)
          </Link>
          {' • '}
          <Link href="/about" className="text-gray-600 hover:underline">about</Link>
          {' • '}
          <a href="https://twitter.com/jessicasuarez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
            @jessicasuarez
          </a>
        </div>
      </div>
    </main>
  );
}
