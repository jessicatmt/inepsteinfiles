/**
 * Security validation utilities for user-provided content
 */

/**
 * Validate a YouTube video ID.
 * Valid YouTube IDs are exactly 11 characters and contain only:
 * - Alphanumeric characters (a-z, A-Z, 0-9)
 * - Hyphens (-)
 * - Underscores (_)
 *
 * @param id - The YouTube video ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidYouTubeId(id: string | null | undefined): boolean {
  if (!id) return false;
  // YouTube video IDs are exactly 11 characters
  // They can contain: a-z, A-Z, 0-9, -, _
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

/**
 * Sanitize a YouTube timestamp (start time in seconds).
 * Must be a positive integer.
 *
 * @param timestamp - The timestamp to validate
 * @returns The timestamp if valid, undefined otherwise
 */
export function sanitizeYouTubeTimestamp(timestamp: number | null | undefined): number | undefined {
  if (timestamp === null || timestamp === undefined) return undefined;
  // Must be a positive integer, reasonable max of 24 hours (86400 seconds)
  if (Number.isInteger(timestamp) && timestamp >= 0 && timestamp <= 86400) {
    return timestamp;
  }
  return undefined;
}

/**
 * Build a safe YouTube embed URL.
 * Returns null if the video ID is invalid.
 *
 * @param videoId - The YouTube video ID
 * @param timestamp - Optional start time in seconds
 * @returns Safe embed URL or null if invalid
 */
export function buildYouTubeEmbedUrl(
  videoId: string | null | undefined,
  timestamp?: number | null
): string | null {
  if (!isValidYouTubeId(videoId)) {
    return null;
  }

  const sanitizedTimestamp = sanitizeYouTubeTimestamp(timestamp);
  const baseUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

  if (sanitizedTimestamp !== undefined) {
    return `${baseUrl}?start=${sanitizedTimestamp}`;
  }

  return baseUrl;
}
