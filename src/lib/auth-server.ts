// Server-side authentication utilities
// This file should only be used in Server Components or API routes

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Set token in cookies
export const setTokenCookie = (response: NextResponse, token: string): void => {
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  
  response.cookies.set({
    name: 'auth-status',
    value: 'authenticated',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
};

// Get token from cookies (server-side)
export const getTokenFromCookies = (): string | undefined => {
  const cookieStore = cookies();
  return cookieStore.get('token')?.value;
};

// Clear auth cookies
export const clearAuthCookies = (response: NextResponse): void => {
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set({
    name: 'auth-status',
    value: '',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
};
