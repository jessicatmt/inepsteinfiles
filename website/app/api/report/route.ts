import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 reports per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

// Sanitize the name parameter
function sanitizeName(name: string): string {
  return name
    .slice(0, 100)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many reports. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const name = sanitizeName(body.name || '');
    const timestamp = body.timestamp || new Date().toISOString();

    if (!name) {
      return NextResponse.json(
        { error: 'Invalid name parameter' },
        { status: 400 }
      );
    }

    // Log the report - visible in Vercel logs
    // TODO: In the future, store this in a database (e.g., Vercel KV, Supabase, etc.)
    console.log(`[FAKE NEWS REPORT] name="${name}" ip="${ip}" timestamp="${timestamp}"`);

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully',
      name,
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
