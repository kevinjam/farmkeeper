import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import EggSale from '@/models/EggSale';
import Farm from '@/models/Farm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// GET handler - Retrieve all egg sales for a farm
export async function GET(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    const { farmId } = params;
    
    // Verify auth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    // Get the farm by slug to get its ObjectId
    const farm = await Farm.findOne({ slug: farmId });
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }
    
    // Check if user is authorized to access this farm
    const userHasAccess = farm.owner.toString() === session.user.id;
    if (!userHasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get sales for this farm, sorted by date (newest first)
    const sales = await EggSale.find({ farmId: farm._id })
      .sort({ date: -1 })
      .lean();
    
    // Return the sales records
    return NextResponse.json(sales);
    
  } catch (error) {
    console.error('Error retrieving egg sales:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve egg sales' },
      { status: 500 }
    );
  }
}

// POST handler - Create a new egg sale record
export async function POST(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    const { farmId } = params;
    
    // Verify auth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const { date, quantity, price, customer, paymentMethod, notes } = await req.json();
    
    // Validate required fields
    if (!date || !quantity || !price || !customer || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Get the farm by slug
    const farm = await Farm.findOne({ slug: farmId });
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }
    
    // Check if user is authorized to add data for this farm
    const userHasAccess = farm.owner.toString() === session.user.id;
    if (!userHasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Create new sale record
    const sale = new EggSale({
      farmId: farm._id,
      date: new Date(date),
      quantity,
      price,
      customer,
      paymentMethod,
      notes
    });
    
    // Save the record
    await sale.save();
    
    // Return success response
    return NextResponse.json(sale, { status: 201 });
    
  } catch (error) {
    console.error('Error creating egg sale:', error);
    
    // Handle validation error
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create egg sale record' },
      { status: 500 }
    );
  }
}
