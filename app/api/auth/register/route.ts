import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await connectDB();
  try {
    const { name, email, password } = await req.json();
    const userExists = await User.findOne({ email });
    if (userExists) return NextResponse.json({ error: 'User already exists' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user';
    const newUser = await User.create({ name, email, password: hashedPassword, role });

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Registration processing error' }, { status: 500 });
  }
}
