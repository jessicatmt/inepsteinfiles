import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  
  // Check if this is a subdomain request (e.g., donald-trump.inepsteinfiles.com)
  if (hostname.includes('inepsteinfiles.com') && !hostname.startsWith('www.') && hostname !== 'inepsteinfiles.com') {
    // Extract the subdomain (everything before .inepsteinfiles.com)
    const subdomain = hostname.replace('.inepsteinfiles.com', '')
    
    // Validate subdomain format (should be a slug)
    if (subdomain && /^[a-z0-9-]+$/.test(subdomain)) {
      // Redirect to canonical URL
      const redirectUrl = new URL(`/${subdomain}`, 'https://inepsteinfiles.com')
      
      // Preserve any query parameters
      redirectUrl.search = url.search
      
      console.log(`Redirecting subdomain ${hostname} to ${redirectUrl.toString()}`)
      
      return NextResponse.redirect(redirectUrl, 301) // Permanent redirect for SEO
    }
  }
  
  // Continue with normal request handling
  return NextResponse.next()
}

export const config = {
  // Match all requests except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}