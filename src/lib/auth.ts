import * as jose from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { IUser } from '@/models/User';
import mongoose from 'mongoose';

// JWT Secret - use environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'Bbblo3soZyvyAYD+mEMGO2lIz/H35tmssHcE8eMWfeQ=';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

const secretKey = new TextEncoder().encode(JWT_SECRET);

// Generate JWT token
export const generateToken = async (user: IUser, farmSlug: string): Promise<string> => {
  try {
    // Ensure user and required fields exist
    if (!user || !user._id) {
      throw new Error('Invalid user data for token generation');
    }

    // Ensure farmId is present before creating the token
    if (!user.farmId) {
      throw new Error('User does not have a farmId, cannot generate token.');
    }

    const token = await new jose.SignJWT({
      id: user._id.toString(), // Ensure string conversion
      email: user.email,
      role: user.role,
      farmId: user.farmId.toString(), // Ensure string conversion
      farmSlug: farmSlug
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRE)
    .sign(secretKey);

    console.log('[generateToken] Token generated successfully');
    return token;
  } catch (error) {
    console.error('[generateToken] Failed to generate token:', error);
    throw error; // Re-throw to handle in the calling function
  }
};

// Verify JWT token
export const verifyToken = async (token: string): Promise<any> => {
  try {
    if (!token) {
      console.error('[verifyToken] No token provided');
      return null;
    }

    const { payload } = await jose.jwtVerify(token, secretKey, {
      algorithms: ['HS256']
    });

    if (!payload || !payload.id) {
      console.error('[verifyToken] Invalid token payload');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[verifyToken] Token verification failed:', error);
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
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.log('[getCurrentUser] No token found in cookies');
      return null;
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      console.log('[getCurrentUser] Token verification failed');
      return null;
    }
    
    if (!decoded.id) {
      console.log('[getCurrentUser] Token payload missing user ID');
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      farmId: decoded.farmId
    };
  } catch (error) {
    console.error('[getCurrentUser] Error:', error);
    return null;
  }
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
