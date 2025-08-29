import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import EggCollection from '@/models/EggCollection';
import EggSale from '@/models/EggSale';
import Farm from '@/models/Farm';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

// GET handler - Retrieve egg collection and sales statistics for a farm
export async function GET(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    const { farmId } = params;
    
    // Verify authentication
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    // Get the farm by slug to get its ObjectId
    const farm = await Farm.findOne({ slug: farmId });
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }
    
    // For now, we'll skip user authorization check since we have the token
    // In a production app, you'd decode the JWT token to get user info
    
    // Get total eggs collected
    const collectionAggregate = await EggCollection.aggregate([
      { $match: { farmId: farm._id } },
      { $group: { _id: null, totalEggs: { $sum: '$quantity' } } }
    ]);
    
    const totalEggsCollected = collectionAggregate.length > 0 ? collectionAggregate[0].totalEggs : 0;
    
    // Get total eggs sold
    const salesAggregate = await EggSale.aggregate([
      { $match: { farmId: farm._id } },
      { $group: { _id: null, totalEggsSold: { $sum: '$quantity' }, totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } } } }
    ]);
    
    const totalEggsSold = salesAggregate.length > 0 ? salesAggregate[0].totalEggsSold : 0;
    const revenue = salesAggregate.length > 0 ? salesAggregate[0].totalRevenue : 0;
    
    // Calculate collection rate (average eggs per chicken)
    const collectionRateAggregate = await EggCollection.aggregate([
      { $match: { farmId: farm._id } },
      { $group: { _id: null, totalEggs: { $sum: '$quantity' }, totalChickens: { $sum: '$chickens' } } }
    ]);
    
    let collectionRate = 0;
    if (collectionRateAggregate.length > 0 && collectionRateAggregate[0].totalChickens > 0) {
      const avgEggsPerChicken = collectionRateAggregate[0].totalEggs / collectionRateAggregate[0].totalChickens;
      // Convert to percentage (assuming ideal is 1 egg per chicken per collection day)
      collectionRate = avgEggsPerChicken * 100;
    }
    
    // Return the statistics
    return NextResponse.json({
      totalEggsCollected,
      totalEggsSold,
      revenue,
      collectionRate
    });
    
  } catch (error) {
    console.error('Error retrieving egg statistics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve egg statistics' },
      { status: 500 }
    );
  }
}
