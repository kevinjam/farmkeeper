import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Farm from '@/models/Farm';
import mongoose from 'mongoose';

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
      }, { status: 401 });
    }
    
    console.log('User authenticated:', user.id);
    
    try {
      // Connect to DB and get full user details
      await connectToDatabase();
      const fullUser = await User.findById(new mongoose.Types.ObjectId(user.id)).select('-password');
      
      if (!fullUser) {
        console.log('User not found in database');
        return NextResponse.json({ 
          isAuthenticated: false,
          isSignedUp: false,
          message: 'User not found in database' 
        }, { status: 401 });
      }
      
      // Check if user has associated farm
      console.log('Looking for farm with ID:', fullUser.farmId);
      const farm = await Farm.findById(fullUser.farmId);
      
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
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { message: 'Database operation failed', error: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Auth status check error:', error);
    return NextResponse.json(
      { message: 'Error checking authentication status', error: error.message },
      { status: 500 }
    );
  }
}
