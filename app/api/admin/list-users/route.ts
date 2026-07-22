import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    await dbConnect();

    const users = await User.find().select('_id name email').limit(5);
    
    return NextResponse.json({
      users: users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
      }))
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
