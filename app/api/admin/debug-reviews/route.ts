import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Get reviews from DB - check first one for farm 6a4f2a7f0be9e10fb388c039
    const reviews = await Review.find({ farmId: '6a4f2a7f0be9e10fb388c039' })
      .select('+userId')
      .limit(3);
    
    return NextResponse.json({
      count: reviews.length,
      reviews: reviews.map(r => ({
        _id: r._id.toString(),
        name: r.name,
        userId: r.userId?.toString() || null,
        updatedAt: r.updatedAt,
      }))
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
