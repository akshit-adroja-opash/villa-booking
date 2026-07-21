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
    const trending = searchParams.get('trending');

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

    if (trending === 'true') {
      const farms = await Farm.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'farmId',
            as: 'bookings'
          }
        },
        {
          $addFields: {
            bookingsCount: { $size: '$bookings' }
          }
        },
        { $sort: { bookingsCount: -1 } },
        { $project: { bookings: 0 } }
      ]);
      return NextResponse.json(farms, { status: 200 });
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
    
    const isHouseRulesEmpty = !body.houseRules || body.houseRules.length === 0;
    const isCancellationPolicyEmpty = !body.cancellationPolicy || body.cancellationPolicy.trim() === '';
    
    if (isHouseRulesEmpty || isCancellationPolicyEmpty) {
      const existingFarm = await Farm.findOne({ 
        $and: [
          { houseRules: { $exists: true, $not: { $size: 0 } } },
          { cancellationPolicy: { $exists: true, $ne: '' } }
        ]
      });
      
      if (existingFarm) {
        if (isHouseRulesEmpty) body.houseRules = existingFarm.houseRules;
        if (isCancellationPolicyEmpty) body.cancellationPolicy = existingFarm.cancellationPolicy;
      }
    }

    const newFarm = await Farm.create(body);
    
    const syncPayload: any = {};
    if (body.houseRules !== undefined) syncPayload.houseRules = body.houseRules;
    if (body.cancellationPolicy !== undefined) syncPayload.cancellationPolicy = body.cancellationPolicy;
    
    if (Object.keys(syncPayload).length > 0) {
      await Farm.updateMany(
        { _id: { $ne: newFarm._id } },
        { $set: syncPayload }
      );
    }
    
    return NextResponse.json(newFarm, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create farm' }, { status: 400 });
  }
}