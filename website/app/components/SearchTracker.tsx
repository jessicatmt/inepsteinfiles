'use client';

import { useEffect } from 'react';

interface SearchTrackerProps {
  slug: string;
  displayName: string;
}

export default function SearchTracker({ slug, displayName }: SearchTrackerProps) {
  useEffect(() => {
    // Track the search asynchronously (fire and forget)
    fetch('/api/track-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slug, display_name: displayName }),
    }).catch((error) => {
      // Silently fail - don't impact user experience
      console.debug('Failed to track search:', error);
    });
  }, [slug, displayName]);

  return null; // This component doesn't render anything
}
