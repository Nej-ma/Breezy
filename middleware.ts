// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

// Routes qui ne nécessitent pas d'authentification
const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/confirm-email',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/activate',
];

// Routes qui nécessitent d'être déconnecté (redirections si connecté)
const authRoutes = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/confirm-email',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignorer les fichiers statiques et les API routes non-auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') && !pathname.startsWith('/api/auth') ||
    pathname.includes('.') // fichiers statiques
  ) {
    return NextResponse.next();
  }

  // Vérifier la session
  const session = await getSessionFromRequest(request);
  const isAuthenticated = !!session?.isLoggedIn;

  // Si l'utilisateur est connecté et essaie d'accéder aux pages d'auth
  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une page protégée
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Rediriger la racine vers /home si connecté, sinon vers /sign-in
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/home', request.url));
    } else {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};