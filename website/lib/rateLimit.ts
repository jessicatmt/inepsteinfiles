import { getSupabaseClient } from './supabase';

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  identifier: string;    // Unique identifier (IP + endpoint)
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Get the real client IP from request headers.
 * On Vercel, we trust x-real-ip which is set by Vercel's edge network.
 * x-forwarded-for can be spoofed by clients.
 */
export function getClientIp(request: Request): string {
  // Vercel sets x-real-ip from the actual connection
  // This is more trustworthy than x-forwarded-for which can be spoofed
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to x-forwarded-for, but only trust the LAST IP
  // (closest to Vercel's edge, less likely to be spoofed)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    // Last IP is the one that connected to Vercel
    return ips[ips.length - 1] || 'unknown';
  }

  return 'unknown';
}

/**
 * Check and update rate limit using Supabase for persistence.
 * Falls back to allowing requests if Supabase is unavailable.
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { windowMs, maxRequests, identifier } = config;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  try {
    const supabase = getSupabaseClient();

    // Clean up old entries and get current count in one operation
    // First, delete expired entries for this identifier
    await supabase
      .from('rate_limits')
      .delete()
      .eq('identifier', identifier)
      .lt('created_at', windowStart.toISOString());

    // Count requests in current window
    const { count, error: countError } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .gte('created_at', windowStart.toISOString());

    if (countError) {
      console.error('Rate limit count error:', countError);
      // Fail open - allow the request but log the error
      return { success: true, remaining: maxRequests, resetAt: new Date(now.getTime() + windowMs) };
    }

    const currentCount = count || 0;

    if (currentCount >= maxRequests) {
      // Rate limited
      return {
        success: false,
        remaining: 0,
        resetAt: new Date(now.getTime() + windowMs),
      };
    }

    // Record this request
    const { error: insertError } = await supabase
      .from('rate_limits')
      .insert({ identifier, created_at: now.toISOString() });

    if (insertError) {
      console.error('Rate limit insert error:', insertError);
      // Fail open
    }

    return {
      success: true,
      remaining: maxRequests - currentCount - 1,
      resetAt: new Date(now.getTime() + windowMs),
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow the request if rate limiting fails
    return { success: true, remaining: maxRequests, resetAt: new Date(now.getTime() + windowMs) };
  }
}

/**
 * Rate limit configuration presets
 */
export const RATE_LIMITS = {
  // Report endpoint: 5 per minute per IP
  report: { windowMs: 60 * 1000, maxRequests: 5 },
  // Search endpoint: 30 per minute per IP
  search: { windowMs: 60 * 1000, maxRequests: 30 },
  // Track search: 60 per minute per IP
  trackSearch: { windowMs: 60 * 1000, maxRequests: 60 },
} as const;
