import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import EggSale from '@/models/EggSale';
import Farm from '@/models/Farm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// DELETE handler - Delete a specific egg sale record
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
    
    // Find and delete the sale record
    const sale = await EggSale.findOneAndDelete({
      _id: id,
      farmId: farm._id
    });
    
    if (!sale) {
      return NextResponse.json({ error: 'Sale record not found' }, { status: 404 });
    }
    
    // Return success response
    return NextResponse.json({ message: 'Sale record deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting egg sale:', error);
    return NextResponse.json(
      { error: 'Failed to delete sale record' },
      { status: 500 }
    );
  }
}
