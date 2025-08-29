import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

// GET /api/farms/[farmId]/feedstock/[id] - Get single feedstock
export async function GET(
  request: NextRequest,
  { params }: { params: { farmId: string; id: string } }
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

    const { farmId, id } = params;

    const response = await fetch(`${BASE_URL}/api/farms/${farmId}/feedstock/${id}`, {
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

// PUT /api/farms/[farmId]/feedstock/[id] - Update feedstock
export async function PUT(
  request: NextRequest,
  { params }: { params: { farmId: string; id: string } }
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

    const { farmId, id } = params;
    const body = await request.json();

    const response = await fetch(`${BASE_URL}/api/farms/${farmId}/feedstock/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update feedstock' }));
      return NextResponse.json(
        { error: errorData.message || 'Failed to update feedstock' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Update feedstock API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/farms/[farmId]/feedstock/[id] - Delete feedstock
export async function DELETE(
  request: NextRequest,
  { params }: { params: { farmId: string; id: string } }
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

    const { farmId, id } = params;

    const response = await fetch(`${BASE_URL}/api/farms/${farmId}/feedstock/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete feedstock' }));
      return NextResponse.json(
        { error: errorData.message || 'Failed to delete feedstock' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Delete feedstock API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
