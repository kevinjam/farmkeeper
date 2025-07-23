import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';
import Farm from '@/models/Farm';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt starting');
    // Connect to database
    await connectToDatabase();
    console.log('Connected to database');
    
    // Parse request body
    const { email, password } = await request.json();
    console.log('Received login attempt for email:', email);
    
    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide email and password' },
        { status: 400 }
      );
    }
    
    // Find user by email
    console.log('Finding user by email:', email);
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    console.log('User found:', user._id.toString());
    
    // Compare passwords
    console.log('Comparing password...');
    const isPasswordMatch = await user.comparePassword(password);
    
    // Check if password matches
    if (!isPasswordMatch) {
      console.log('Password does not match');
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    console.log('Password verified successfully');
    console.log('User farmId:', user.farmId);
    
    // Get associated farm
    console.log('Looking up farm with ID:', user.farmId);
    const farm = await Farm.findById(user.farmId);
    
    if (!farm) {
      console.log('Farm not found for ID:', user.farmId);
      return NextResponse.json(
        { message: 'Farm not found' },
        { status: 404 }
      );
    }
    
    console.log('Farm found:', farm.name, 'with slug:', farm.slug);
    
    // Generate token with farm slug
    const token = await generateToken(user, farm.slug);
    
    // Create response
    console.log('Creating successful login response with farm slug:', farm.slug);
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      farmId: farm.slug, // This is the farm slug needed for the redirect
      farmName: farm.name,
    });
    
    // Set token in cookies
    setTokenCookie(response, token);
    
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
