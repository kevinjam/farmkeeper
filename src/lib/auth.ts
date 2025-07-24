import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Types
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthResponse = {
  message: string;
  user: User;
  farmId: string;
  farmName?: string;
};

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

// Get token from cookies
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

// API client functions
export const authApi = {
  register: async (data: {
    farmName: string;
    name: string;
    email: string;
    password: string;
    plan?: string;
  }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  logout: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }
  },

  getStatus: async (): Promise<{
    isAuthenticated: boolean;
    isSignedUp: boolean;
    user?: User;
    farm?: { id: string; name: string; slug: string };
  }> => {
    const token = getTokenFromCookies();
    if (!token) return { isAuthenticated: false, isSignedUp: false };

    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { isAuthenticated: false, isSignedUp: false };
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to get auth status');
    }

    return response.json();
  },
};
