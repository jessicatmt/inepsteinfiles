'use client';

import Link from 'next/link';
import SearchForm from './components/SearchForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-3xl md:text-5xl font-bold uppercase tracking-tight mb-16">
          <span>IS</span>
          <div className="relative">
            <SearchForm />
          </div>
          <span className="whitespace-nowrap">IN THE EPSTEIN FILES?</span>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-xs text-gray-600">
          <Link href="https://journaliststudio.google.com/pinpoint/search?collection=7185d6ee2381569d&spt=2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
            Browse full database (9000+ documents)
          </Link>
          {' • '}
          <Link href="/about" className="text-gray-600 hover:underline">about</Link>
          {' • '}
          <a href="https://twitter.com/jessicasuarez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
            @jessicasuarez
          </a>
          <div className="mt-2">Last updated 2025-12-05</div>
        </div>
      </div>
    </main>
  );
}
