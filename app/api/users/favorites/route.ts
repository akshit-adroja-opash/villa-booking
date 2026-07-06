import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Farm from '@/models/Farm'; // Ensure Farm model is registered
import mongoose from 'mongoose';

// Prevent tree-shaking of the Farm model registration
const _farmModel = Farm;

export async function GET(req: Request) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ error: 'Valid User ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.favorites || [], { status: 200 });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectDB();
  try {
    const { userId, farmId } = await req.json();

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ error: 'Valid User ID is required' }, { status: 400 });
    }

    if (!farmId || !mongoose.isValidObjectId(farmId)) {
      return NextResponse.json({ error: 'Valid Farm ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    const index = user.favorites.findIndex((id: any) => id.toString() === farmId);
    if (index > -1) {
      // Remove from favorites
      user.favorites.splice(index, 1);
    } else {
      // Add to favorites
      user.favorites.push(farmId);
    }

    await user.save();

    return NextResponse.json({ success: true, favorites: user.favorites.map((id: any) => id.toString()) }, { status: 200 });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
