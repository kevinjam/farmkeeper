export const runtime = 'nodejs';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Handle POST request for user logout
 * 
 * @returns JSON response with success message and clears auth cookies
 */
export async function POST() {
  console.log('Processing logout request');
  
  try {
    // Get the cookie store
    const cookieStore = cookies();
    
    // Clear all authentication related cookies
    cookieStore.delete('token');
    cookieStore.delete('auth-status');
    
    console.log('Authentication cookies cleared successfully');
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Return error response
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
