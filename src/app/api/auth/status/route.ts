import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Farm from '@/models/Farm';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('Auth status check requested');
    
    // Get the current user from token
    const user = await getCurrentUser(request);
    
    if (!user) {
      console.log('No authenticated user found');
      return NextResponse.json({ 
        isAuthenticated: false,
        isSignedUp: false,
        message: 'Not authenticated' 
      });
    }
    
    console.log('User authenticated:', user.id);
    
    // Connect to DB and get full user details
    await connectToDatabase();
    const fullUser = await User.findById(user.id).select('-password');
    
    if (!fullUser) {
      console.log('User not found in database');
      return NextResponse.json({ 
        isAuthenticated: true,
        isSignedUp: false,
        message: 'User not found in database' 
      });
    }
    
    // Check if user has associated farm
    console.log('Looking for farm with ID:', fullUser.farmId);
    const farm = await Farm.findById(fullUser.farmId);
    
    if (!farm) {
      console.log('No farm found for user');
    } else {
      console.log('Found farm:', farm.name, 'with slug:', farm.slug, 'and ID:', farm._id);
    }
    
    const isSignedUp = !!farm;
    console.log('User signup status:', isSignedUp ? 'Complete' : 'Incomplete');
    
    return NextResponse.json({
      isAuthenticated: true,
      isSignedUp: isSignedUp,
      user: {
        id: fullUser._id,
        name: fullUser.name,
        email: fullUser.email,
        role: fullUser.role
      },
      farm: isSignedUp ? {
        id: farm._id,
        name: farm.name,
        slug: farm.slug
      } : null
    });
  } catch (error: any) {
    console.error('Auth status check error:', error);
    return NextResponse.json(
      { message: 'Error checking authentication status', error: error.message },
      { status: 500 }
    );
  }
}
