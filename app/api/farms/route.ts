import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Farm from '@/models/Farm';

export async function GET(req: Request) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const pricePerNight = searchParams.get('pricePerNight');
    const guests = searchParams.get('guests');
    const amenities = searchParams.get('amenities');

    const filter: any = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ];
    }

    if (pricePerNight) {
      filter.pricePerNight = { $lte: Number(pricePerNight) };
    }

    if (guests) {
      filter.guests = { $gte: Number(guests) };
    }

    if (amenities) {
      const amenitiesList = amenities.split(',').map(a => a.trim()).filter(Boolean);
      if (amenitiesList.length > 0) {
        filter.amenities = { $all: amenitiesList };
      }
    }

    const farms = await Farm.find(filter);
    return NextResponse.json(farms, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch/seed farms:', error);
    return NextResponse.json({ error: 'Failed to fetch farms' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectDB();
  try {
    const body = await req.json();
    const newFarm = await Farm.create(body);
    return NextResponse.json(newFarm, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create farm' }, { status: 400 });
  }
}