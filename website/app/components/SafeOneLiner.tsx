'use client';

import Link from 'next/link';

interface SafeOneLinerProps {
  text: string;
  className?: string;
}

/**
 * Safely render one-liner text that may contain simple HTML links.
 * Parses <a href="...">text</a> tags and renders them as Next.js Links.
 * All other HTML is stripped and rendered as plain text.
 */
export default function SafeOneLiner({ text, className }: SafeOneLinerProps) {
  // If no HTML, return plain text
  if (!/<[^>]+>/.test(text)) {
    return <span className={className}>{text}</span>;
  }

  // Parse links and text segments
  const segments: Array<{ type: 'text' | 'link'; content: string; href?: string }> = [];

  // Match <a href="...">...</a> tags using matchAll
  const linkRegex = /<a\s+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
  const matches = Array.from(text.matchAll(linkRegex));

  let lastIndex = 0;

  for (const match of matches) {
    const matchIndex = match.index ?? 0;

    // Add text before the link
    if (matchIndex > lastIndex) {
      const textBefore = text.slice(lastIndex, matchIndex);
      // Strip any other HTML tags from text segments
      const cleanText = textBefore.replace(/<[^>]+>/g, '');
      if (cleanText) {
        segments.push({ type: 'text', content: cleanText });
      }
    }

    // Add the link (validate href)
    const href = match[1];
    const linkText = match[2];

    // Only allow http, https, and relative URLs
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/')) {
      segments.push({ type: 'link', content: linkText, href });
    } else {
      // Invalid href - render as plain text
      segments.push({ type: 'text', content: linkText });
    }

    lastIndex = matchIndex + match[0].length;
  }

  // Add remaining text after last link
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    // Strip any other HTML tags
    const cleanText = remaining.replace(/<[^>]+>/g, '');
    if (cleanText) {
      segments.push({ type: 'text', content: cleanText });
    }
  }

  // If parsing failed, return stripped plain text
  if (segments.length === 0) {
    const plainText = text.replace(/<[^>]+>/g, '');
    return <span className={className}>{plainText}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, i) => {
        if (segment.type === 'link' && segment.href) {
          const isExternal = segment.href.startsWith('http');
          return (
            <Link
              key={i}
              href={segment.href}
              className="underline hover:text-gray-500"
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {segment.content}
            </Link>
          );
        }
        return <span key={i}>{segment.content}</span>;
      })}
    </span>
  );
}
