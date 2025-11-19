'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchForm() {
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
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="type a name + enter"
        className="text-center text-base h-12 border-2 border-black px-4 max-w-md w-full bg-white focus:outline-none focus:border-black"
        autoComplete="off"
      />
    </form>
  );
}
