// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Lightweight locale handling without relying on next-intl middleware redirects
const SUPPORTED_LOCALES = ['en', 'lg', 'sw'] as const;

// Force Node.js runtime for middleware
export const runtime = 'nodejs';
// Ensure this middleware executes on the server only
export const preferredRegion = 'auto';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

async function verifyTokenWithBackend(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('[verifyTokenWithBackend] Error:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const origin = request.nextUrl.origin;

  // Skip for API routes and static files
  if (path.startsWith('/api/') || path.startsWith('/_next/') || path.includes('.')) {
    return NextResponse.next();
  }

  // Locale handling: support optional leading locale segment (/en, /lg, /sw)
  const segments = path.split('/'); // ['', 'en', 'auth', 'login']
  const first = segments[1];
  const hasLocalePrefix = (SUPPORTED_LOCALES as readonly string[]).includes(first);

  if (hasLocalePrefix) {
    // Persist locale and rewrite to filesystem path without locale so existing routes work
    const locale = first;
    const strippedPath = '/' + segments.slice(2).join('/');
    const url = new URL(strippedPath || '/', request.url);
    const response = NextResponse.rewrite(url);
    response.cookies.set('NEXT_LOCALE', locale, { path: '/' });
    return response;
  }

  // Check if this is a farm route: /[farmId]/dashboard/... or /[farmId]/billing
  const isFarmRoute = segments.length >= 2 && 
    (segments[2] === 'dashboard' || segments[2] === 'billing' || segments.length === 2);
  
  if (isFarmRoute) {
    // This is a farm route, handle authentication
    const isProtectedPath = path.includes('/dashboard') || path.includes('/billing');
    const token = request.cookies.get('token')?.value;

    console.log('[Middleware] Farm route:', path);
    console.log('[Middleware] Is protected:', isProtectedPath);
    console.log('[Middleware] Token present:', !!token);

    if (isProtectedPath && !token) {
      console.log('[Middleware] Protected farm path, no token. Redirecting to login');
      return NextResponse.redirect(new URL('/en/auth/login', request.url));
    }

    if (token) {
      try {
        const decodedToken = await verifyTokenWithBackend(token);
        console.log('[Middleware] Decoded token:', decodedToken);

        if (isProtectedPath && !decodedToken) {
          console.log('[Middleware] Protected farm path, invalid token. Redirecting to login');
          return NextResponse.redirect(new URL('/en/auth/login', request.url));
        }
      } catch (error) {
        console.error('[Middleware] Token verification error:', error);
        if (isProtectedPath) {
          console.log('[Middleware] Token verification failed, redirecting to login');
          return NextResponse.redirect(new URL('/en/auth/login', request.url));
        }
      }
    }

    return NextResponse.next();
  }

  // If no locale prefix and not a farm route, redirect to default locale
  if (segments.length > 1) {
    // This is likely a route that should have a locale prefix
    const newUrl = new URL(`/en${path}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  // If no locale prefix, redirect to default locale (/en + current path)
  const redirectUrl = new URL(`/en${path === '/' ? '' : path}`, request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    // avoid intercepting api, next internals, and common static files
    '/((?!api|_next|favicon.ico|robots.txt|manifest.json|icons|public).*)',
  ],
};