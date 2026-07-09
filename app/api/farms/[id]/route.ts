import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Farm from '@/models/Farm';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    const farm = await Farm.findById(id);
    if (!farm) {
      return NextResponse.json({ error: 'Farmhouse not found' }, { status: 404 });
    }
    return NextResponse.json(farm, { status: 200 });
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
