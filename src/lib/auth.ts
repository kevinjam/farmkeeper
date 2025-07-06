import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { IUser } from '@/models/User';

// JWT Secret - use environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || '7x9mZqP3kL8vN2rT5wY6uJ0hF4gB1cA';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate JWT token
export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role,
      farmId: user.farmId
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Set JWT token in cookies
export const setTokenCookie = (response: NextResponse, token: string): void => {
  // Log that we're setting the cookie
  console.log('Setting token cookie');
  
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Changed from 'strict' to 'lax' for easier navigation
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  
  // Add a non-HttpOnly cookie for client-side verification
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

// Get current user from token
export const getCurrentUser = async (request: NextRequest) => {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }
  
  // Here you would typically fetch the user from the database
  // using the decoded.id, but for simplicity we'll return the decoded data
  return {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    farmId: decoded.farmId
  };
};

// Authentication middleware
export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Add user to request object
    return handler(request, user);
  };
}
