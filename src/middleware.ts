// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Force Node.js runtime for middleware
export const runtime = 'nodejs';
// Ensure this middleware executes on the server only
export const preferredRegion = 'auto';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedPath = path.includes('/dashboard') || path.startsWith('/api/private');
  const isPublicPath = path === '/auth/login' || path === '/auth/register' || path === '/auth/forgot-password';
  const token = request.cookies.get('token')?.value;

  console.log('[Middleware] Path:', path);
  console.log('[Middleware] Token present:', !!token);

  if (isProtectedPath && !token) {
    console.log('[Middleware] Protected path, no token. Redirecting to /auth/login');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token) {
    const decodedToken = await verifyToken(token);
    console.log('[Middleware] Decoded token:', decodedToken);

    if (isProtectedPath && !decodedToken) {
      console.log('[Middleware] Protected path, invalid token. Redirecting to /auth/login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (isPublicPath && decodedToken) {
      const farmSlug = (decodedToken as any).farmSlug;
      if (farmSlug) {
        console.log('[Middleware] Public path, valid token. Redirecting to dashboard:', `/${farmSlug}/dashboard`);
        return NextResponse.redirect(new URL(`/${farmSlug}/dashboard`, request.url));
    }
  }
  }

  console.log('[Middleware] No redirect, proceeding.');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/(?!private)|_next/static|_next/image|favicon.ico).*)',
  ],
};