import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Farm from '@/models/Farm';
import { generateToken, setTokenCookie } from '@/lib/auth';
import mongoose from 'mongoose';

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting registration process');
    // Connect to database
    await connectToDatabase();
    console.log('Connected to database');
    
    // Parse request body
    const { farmName, name, email, password, plan = 'basic' } = await request.json();
    
    // Validate inputs
    if (!farmName || !name || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      );
    }
    
    try {
      console.log('Creating user and farm objects...');
      
      // Create new user without farmId for now
      const user = new User({
        name,
        email,
        password,
        role: 'owner'
        // farmId will be added after creating the farm
      });
      
      // Save the user first without farmId
      console.log('Saving user...');
      await user.save();
      console.log('User saved with ID:', user._id);
      
      // Generate a safe slug from farm name
      const slug = farmName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
      
      console.log('Generated slug:', slug);
      
      // Create farm with owner already set
      const farm = new Farm({
        name: farmName,
        slug: slug,
        owner: user._id, // Set owner to the new user's ID
        subscription: {
          plan,
          status: 'trialing'
        }
      });
      
      // Then save the farm
      console.log('Saving farm...');
      await farm.save();
      console.log('Farm saved with ID:', farm._id);
      
      // Update user with farmId and save again
      console.log('Updating user with farmId...');
      await User.findByIdAndUpdate(user._id, { farmId: farm._id });
      console.log('User updated with farmId');
      
      // Re-fetch the user to ensure we have the latest data
      const updatedUser = await User.findById(user._id);
      
      // Generate token
      const token = generateToken(user);
      
      // Create response
      const response = NextResponse.json({
        message: 'Registration successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        farmId: farm.slug,
      });
      
      // Set token in cookies
      setTokenCookie(response, token);
      
      return response;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.code === 11000 ? 400 : 500 }
    );
  }
}
