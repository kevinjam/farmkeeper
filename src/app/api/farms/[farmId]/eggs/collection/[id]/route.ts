import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import EggCollection from '@/models/EggCollection';
import Farm from '@/models/Farm';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

// DELETE handler - Delete a specific egg collection record
export async function DELETE(
  req: NextRequest,
  { params }: { params: { farmId: string, id: string } }
) {
  try {
    const { farmId, id } = params;
    
    // Verify authentication
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    // Get the farm by slug
    const farm = await Farm.findOne({ slug: farmId });
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }
    
    // For now, we'll skip user authorization check since we have the token
    // In a production app, you'd decode the JWT token to get user info
    
    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid record ID' }, { status: 400 });
    }
    
    // Find and delete the collection record
    const collection = await EggCollection.findOneAndDelete({
      _id: id,
      farmId: farm._id
    });
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection record not found' }, { status: 404 });
    }
    
    // Return success response
    return NextResponse.json({ message: 'Collection record deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting egg collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection record' },
      { status: 500 }
    );
  }
}
