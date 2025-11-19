'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

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
      <div className="w-full max-w-4xl mx-auto">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-3xl md:text-5xl font-bold uppercase tracking-tight">
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
      </div>
    </main>
  );
}
