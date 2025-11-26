'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function FakeNewsButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const pathname = usePathname();

  // Extract the name slug from the pathname (e.g., "/bill-clinton" -> "bill-clinton")
  const nameSlug = pathname?.replace('/', '') || 'unknown';

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (hasSubmitted) {
      alert('You already flagged this result. Thank you!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nameSlug,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setHasSubmitted(true);
        alert('Thank you for your feedback! This result has been flagged as FAKE NEWS!!! and promoted for review.');
      } else {
        alert('Something went wrong. Please try again later.');
      }
    } catch {
      // Still show success message even if API fails (graceful degradation)
      setHasSubmitted(true);
      alert('Thank you for your feedback! This result has been flagged as FAKE NEWS!!! and promoted for review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <a
      href="#fakenews"
      onClick={handleClick}
      className={`text-gray-600 hover:underline ${isSubmitting ? 'opacity-50 cursor-wait' : ''} ${hasSubmitted ? 'line-through' : ''}`}
      title="Flag this result for review"
    >
      {hasSubmitted ? 'FLAGGED' : isSubmitting ? 'FLAGGING...' : 'FAKE NEWS'}
    </a>
  );
}
