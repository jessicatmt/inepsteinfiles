'use client';

import { useState, useEffect } from 'react';

// YES rotation texts
const YES_TEXTS = [
  "oh.",
  "anyway here's the link",
  "thoughts?",
  "the results are in…",
  "we good?",
  "ICYMI",
  "COOKED.",
  "Hey new files just dropped",
  "Got 'em"
];

// NO rotation texts
const NO_TEXTS = [
  "cleared ✔",
  "the results are in…",
  "we good?",
  "ICYMI",
  "What about your guy?"
];

interface ShareButtonProps {
  displayName: string;
  found: boolean;
  vanityUrl: string;
}

function getRandomText(found: boolean): string {
  const textPool = found ? YES_TEXTS : NO_TEXTS;
  return textPool[Math.floor(Math.random() * textPool.length)];
}

export default function ShareButton({ displayName, found, vanityUrl }: ShareButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [randomText] = useState(() => getRandomText(found));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Don't render link until client-side to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors opacity-50 cursor-wait"
        disabled
      >
        Post on
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </button>
    );
  }
  
  // Format the share text
  const shareText = `${displayName} ${found ? 'IS' : 'IS NOT'} in the Epstein files.\n\n${randomText}\n\n${vanityUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <a
      href={twitterShareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
    >
      Post on
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </a>
  );
}