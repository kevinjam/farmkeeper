// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Force Node.js runtime for middleware
export const runtime = 'nodejs';
// Ensure this middleware executes on the server only
export const preferredRegion = 'auto';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedPath = path.includes('/dashboard') || path.startsWith('/api/private');
  const isPublicPath = path === '/auth/login' || path === '/auth/register' || path === '/auth/forgot-password';
  const token = request.cookies.get('token')?.value;

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token) {
    const decodedToken = verifyToken(token);

    if (isProtectedPath && !decodedToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (isPublicPath && decodedToken) {
      return NextResponse.redirect(new URL(`/${decodedToken.farmId}/dashboard`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/(?!private)|_next/static|_next/image|favicon.ico).*)',
  ],
};