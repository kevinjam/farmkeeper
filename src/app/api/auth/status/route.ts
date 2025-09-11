import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { isSignedUp: false, message: 'No token found' },
        { status: 401 }
      );
    }

    // Forward the request to the backend status endpoint
    const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { isSignedUp: false, message: data.message || 'Authentication failed' },
        { status: response.status }
      );
    }

    // Return success with user status
    return NextResponse.json({
      isSignedUp: true,
      user: data.user,
      farm: data.farm,
      message: 'User authenticated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { isSignedUp: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
