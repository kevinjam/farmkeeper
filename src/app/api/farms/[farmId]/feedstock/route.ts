import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

// GET /api/farms/[farmId]/feedstock - Get all feedstock
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
    const stockType = searchParams.get('stockType');

    // Build query string
    const queryParams = new URLSearchParams();
    if (stockType) {
      queryParams.append('stockType', stockType);
    }

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/api/farms/${farmId}/feedstock${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch feedstock' }));
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch feedstock' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Feedstock API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/farms/[farmId]/feedstock - Create new feedstock
export async function POST(
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
    const body = await request.json();

    const response = await fetch(`${BASE_URL}/api/farms/${farmId}/feedstock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create feedstock' }));
      return NextResponse.json(
        { error: errorData.message || 'Failed to create feedstock' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Create feedstock API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
