import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import EggCollection from '@/models/EggCollection';
import Farm from '@/models/Farm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// DELETE handler - Delete a specific egg collection record
export async function DELETE(
  req: NextRequest,
  { params }: { params: { farmId: string, id: string } }
) {
  try {
    const { farmId, id } = params;
    
    // Verify auth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    // Get the farm by slug
    const farm = await Farm.findOne({ slug: farmId });
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }
    
    // Check if user is authorized to delete data for this farm
    const userHasAccess = farm.owner.toString() === session.user.id;
    if (!userHasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
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
