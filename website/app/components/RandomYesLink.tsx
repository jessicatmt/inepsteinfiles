'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface YesPerson {
  slug: string;
  display_name: string;
}

interface RandomYesLinkProps {
  yesPeople: YesPerson[];
}

export default function RandomYesLink({ yesPeople }: RandomYesLinkProps) {
  const [mounted, setMounted] = useState(false);
  const [randomPerson, setRandomPerson] = useState<YesPerson | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (yesPeople.length > 0) {
      const random = yesPeople[Math.floor(Math.random() * yesPeople.length)];
      setRandomPerson(random);
    }
  }, [yesPeople]);

  // Don't render until client-side to avoid hydration mismatch
  if (!mounted || !randomPerson) {
    return null;
  }

  // Create redacted version of name (same length, all blocks)
  const redactedName = '█'.repeat(randomPerson.display_name.length);

  return (
    <p className="text-lg mt-4">
      but{' '}
      <Link
        href={`/${randomPerson.slug}`}
        className="text-red-600 hover:text-red-800 hover:underline font-bold"
        title={`See who IS in the Epstein files`}
      >
        {redactedName}
      </Link>
      {' '}is
    </p>
  );
}
