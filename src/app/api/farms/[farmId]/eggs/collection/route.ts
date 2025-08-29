import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001';

// GET handler - Retrieve all egg collections for a farm
export async function GET(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    const { farmId } = params;
    
    // Get token from cookies
    const token = req.cookies.get('token')?.value;
    if (!token) {
      console.error('GET: No authentication token found in cookies');
      return NextResponse.json({ error: 'Authentication required - please log in' }, { status: 401 });
    }
    
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/api/farms/${farmId}/eggs/collections`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to retrieve egg collections';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Backend error response:', errorData);
      } catch {
        // If response is not JSON (e.g., HTML error page), use default message
        errorMessage = `Backend error: ${response.status} ${response.statusText}`;
      }
      
      console.error(`Backend request failed: ${response.status} ${response.statusText}`, {
        url: `${API_BASE_URL}/api/farms/${farmId}/eggs/collections`,
        token: token ? 'present' : 'missing'
      });
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error retrieving egg collections:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve egg collections' },
      { status: 500 }
    );
  }
}

// POST handler - Create a new egg collection record
export async function POST(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    const { farmId } = params;
    
    // Get token from cookies
    const token = req.cookies.get('token')?.value;
    if (!token) {
      console.error('POST: No authentication token found in cookies');
      return NextResponse.json({ error: 'Authentication required - please log in' }, { status: 401 });
    }
    
    // Get request body
    const body = await req.json();
    
    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/api/farms/${farmId}/eggs/collections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to create egg collection record' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
    
  } catch (error) {
    console.error('Error creating egg collection:', error);
    return NextResponse.json(
      { error: 'Failed to create egg collection record' },
      { status: 500 }
    );
  }
}
