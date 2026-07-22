import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Farm from '@/models/Farm';
import mongoose from 'mongoose';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    
    const farm = await Farm.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'farmId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          rating: {
            $cond: [
              { $eq: [{ $size: '$reviews' }, 0] },
              5, // Default to 5 if no reviews
              { $avg: '$reviews.rating' }
            ]
          },
          reviewsCount: { $size: '$reviews' }
        }
      },
      { $project: { reviews: 0 } }
    ]);

    if (!farm || farm.length === 0) {
      return NextResponse.json({ error: 'Farmhouse not found' }, { status: 404 });
    }
    
    return NextResponse.json(farm[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid ID or processing error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updatedFarm = await Farm.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedFarm) {
      return NextResponse.json({ error: 'Farmhouse not found' }, { status: 404 });
    }

    // Sync policies across all farms
    const syncPayload: any = {};
    if (body.houseRules !== undefined) syncPayload.houseRules = body.houseRules;
    if (body.cancellationPolicy !== undefined) syncPayload.cancellationPolicy = body.cancellationPolicy;
    
    if (Object.keys(syncPayload).length > 0) {
      await Farm.updateMany(
        { _id: { $ne: id } },
        { $set: syncPayload }
      );
    }
    
    
    return NextResponse.json(updatedFarm, { status: 200 });
  } catch (error) {
    console.error('Error updating farm:', error);
    return NextResponse.json({ error: 'Invalid ID or processing error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    const deletedFarm = await Farm.findByIdAndDelete(id);
    
    if (!deletedFarm) {
      return NextResponse.json({ error: 'Farmhouse not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Farmhouse deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting farm:', error);
    return NextResponse.json({ error: 'Invalid ID or processing error' }, { status: 500 });
  }
}
