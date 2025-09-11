import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const period = searchParams.get('period') || 'monthly';
    const sortBy = searchParams.get('sortBy') || 'performance';

    // Forward request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/analytics/farms/${params.farmId}?year=${year}&period=${period}&sortBy=${sortBy}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend analytics error:', errorData);
      return NextResponse.json(
        { message: 'Failed to fetch analytics data' },
        { status: response.status }
      );
    }

    const result = await response.json();
    // Extract data from the nested structure
    return NextResponse.json(result.data || result);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
