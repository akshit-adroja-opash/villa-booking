import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  await connectDB();
  try {
    const users = await User.find({}, '-password');
    return NextResponse.json(users || [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await connectDB();
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    
    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  await connectDB();
  try {
    const { id, name, email, role } = await req.json();
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    
    // Convert customer to user for DB schema compatibility
    const dbRole = role === 'customer' ? 'user' : role;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { name, email, role: dbRole } },
      { new: true, select: '-password' }
    );
    
    if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
