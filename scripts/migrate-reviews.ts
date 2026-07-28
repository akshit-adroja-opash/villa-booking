import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();

    // Get all reviews without userId or where userId is null/undefined
    const reviewsWithoutUserId = await Review.find({ 
      $or: [
        { userId: null },
        { userId: undefined },
        { userId: { $exists: false } }
      ]
    });

    let updateCount = 0;
    const details = [];

    // For each review, try to find the user by name
    for (const review of reviewsWithoutUserId) {
      const user = await User.findOne({ 
        name: { $regex: new RegExp(`^${review.name}$`, 'i') } 
      });

      if (user) {
        // Use updateOne to ensure it saves
        const result = await Review.updateOne(
          { _id: review._id },
          { $set: { userId: user._id } }
        );
        
        updateCount++;
        details.push({
          reviewId: review._id,
          reviewName: review.name,
          userId: user._id,
          modifiedCount: result.modifiedCount
        });
      } else {
        details.push({
          reviewName: review.name,
          status: 'No user found'
        });
      }
    }

    return NextResponse.json({
      message: 'Migration completed',
      total: reviewsWithoutUserId.length,
      updated: updateCount,
      details,
    }, { status: 200 });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    );
  }
}
