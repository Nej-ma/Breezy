import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from './src/lib/session';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/confirm-email'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes (more specific)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') && !pathname.endsWith('/')
  ) {
    return NextResponse.next();
  }
 
  // Check if the path is public (improved matching)
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
 
  // Get session
  const session = await getSessionFromRequest(request);
  const isAuthenticated = !!session?.isLoggedIn;
 
  // Handle authentication logic
  if (!isAuthenticated && !isPublicPath) {
    // Redirect to sign-in with return URL
    const url = new URL('/sign-in', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
 
  if (isAuthenticated && isPublicPath && pathname !== '/') {
    // Redirect to home if trying to access auth routes while logged in
    return NextResponse.redirect(new URL('/home', request.url));
  }
 
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - api routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
