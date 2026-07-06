import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  await connectDB();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    if (!email) {
      return NextResponse.json({ error: 'Invalid user email in session' }, { status: 400 });
    }

    const user = await User.findOne({ email }, '-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await connectDB();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionEmail = session.user.email;
    if (!sessionEmail) {
      return NextResponse.json({ error: 'Invalid user email in session' }, { status: 400 });
    }

    const { name, email, phone, location, image } = await req.json();

    const user = await User.findOne({ email: sessionEmail });
    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // If updating email, make sure it is not taken by another user
    if (email && email.toLowerCase() !== sessionEmail.toLowerCase()) {
      const emailExists = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      if (emailExists) {
        return NextResponse.json({ error: 'Email already in use by another user' }, { status: 400 });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (image !== undefined) user.image = image;

    await user.save();

    // Exclude password in response
    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      image: user.image,
      favorites: user.favorites,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
