// src/app/api/auth/verify.js
'use server';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json(
      { error: 'Authorization token is required' },
      { status: 401 }
    );
  }

  try {
    // Make sure we have a JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET || '7x9mZqP3kL8vN2rT5wY6uJ0hF4gB1cA';
    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ user: decoded });
  } catch (err) {
    console.error('Token verification error:', err.message);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
