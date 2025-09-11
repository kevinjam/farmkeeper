import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { farmId } = params;
    const { searchParams } = new URL(request.url);
    const radius = searchParams.get('radius') || '50';

    // Forward request to backend
    const response = await fetch(`${BASE_URL}/api/weather/${farmId}/nearby?radius=${radius}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Weather service unavailable' }));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch nearby farms weather data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Nearby farms weather API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
