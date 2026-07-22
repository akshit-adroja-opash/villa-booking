import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await dbConnect();

    const reviewId = '6a6080866c925209ca31ec1e';
    const userId = '6a4df2ef8f16247913b988cd';

    // Try to update directly using mongoose connection
    const collection = mongoose.connection.collection('reviews');
    
    const result = await collection.updateOne(
      { _id: new mongoose.Types.ObjectId(reviewId) },
      { 
        $set: { 
          userId: new mongoose.Types.ObjectId(userId)
        } 
      }
    );

    return NextResponse.json({
      updateResult: result,
      message: 'Update attempted'
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
