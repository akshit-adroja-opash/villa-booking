import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Farm from '@/models/Farm';

const SEED_FARMS = [
  {
    title: 'Sunrise Valley Farm',
    location: 'Solan, Himachal Pradesh',
    pricePerNight: 3500,
    images: ['https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80'],
    description: 'A quiet valley getaway surrounded by lush greenery, complete with private pool, cozy patio, and traditional home-style cooking.',
    category: 'farmhouse',
    rating: 4.8,
    guests: 12,
    bedrooms: 4,
    baths: 4,
    amenities: ['WiFi', 'Swimming Pool', 'Garden', 'Kitchen', 'Parking']
  },
  {
    title: 'Hilltop Haven',
    location: 'Manali, Himachal Pradesh',
    pricePerNight: 5500,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'],
    description: 'Luxury snow-capped peaks cottage featuring an indoor fireplace, heated pool, spacious wood-paneled bedrooms, and local trekking guides.',
    category: 'cabin',
    rating: 4.9,
    guests: 16,
    bedrooms: 6,
    baths: 5,
    amenities: ['WiFi', 'Hot Tub', 'Fireplace', 'Mountain View', 'Kitchen']
  },
  {
    title: 'Coastal Retreat',
    location: 'Goa, Goa',
    pricePerNight: 6000,
    images: ['https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=800&q=80'],
    description: 'A luxury seaside retreat overlooking the caldera, offering a private infinity pool, panoramic ocean sunsets, and white-glove service.',
    category: 'pool',
    rating: 4.5,
    guests: 14,
    bedrooms: 5,
    baths: 4,
    amenities: ['WiFi', 'Beach Access', 'Swimming Pool', 'Ocean View', 'AC']
  },
  {
    title: 'Tea Garden Estate',
    location: 'Munnar, Kerala',
    pricePerNight: 3800,
    images: ['https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80'],
    description: 'Riverside escape offering peace and spirituality. Features a dedicated yoga deck, outdoor dining, and direct river access.',
    category: 'garden',
    rating: 4.8,
    guests: 10,
    bedrooms: 4,
    baths: 4,
    amenities: ['WiFi', 'Tea Tasting', 'Plantation Walk', 'Chef', 'Bonfire']
  },
  {
    title: 'Green Meadow Retreat',
    location: 'Rishikesh, Uttarakhand',
    pricePerNight: 2800,
    images: ['https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=800&q=80'],
    description: 'Historic honey-colored stone cottage with original oak beams, cozy stone fireplace, and a beautiful country garden.',
    category: 'riverfront',
    rating: 4.6,
    guests: 8,
    bedrooms: 3,
    baths: 2,
    amenities: ['WiFi', 'Yoga Deck', 'River View', 'Garden', 'Bonfire']
  },
  {
    title: 'Orchard Bliss',
    location: 'Panchgani, Maharashtra',
    pricePerNight: 4200,
    images: ['https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80'],
    description: 'A cozy hillside estate set within strawberry fields and orchards, featuring panoramic valley views and nature walks.',
    category: 'farmhouse',
    rating: 4.7,
    guests: 10,
    bedrooms: 4,
    baths: 3,
    amenities: ['WiFi', 'Garden', 'Fruit Picking', 'Mountain View', 'Kitchen']
  },
  {
    title: 'Desert Oasis Villa',
    location: 'Jaisalmer, Rajasthan',
    pricePerNight: 4800,
    images: ['https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80'],
    description: 'Traditional golden sand brick villa with modern comforts, private plunge pool, and starlit sky deck.',
    category: 'cabin',
    rating: 4.9,
    guests: 6,
    bedrooms: 3,
    baths: 3,
    amenities: ['WiFi', 'Plunge Pool', 'Sky Deck', 'AC', 'Desert Safari']
  },
  {
    title: 'Whispering Palms Farm',
    location: 'Alleppey, Kerala',
    pricePerNight: 3600,
    images: ['https://images.unsplash.com/photo-1593693411427-655f46c6ec22?auto=format&fit=crop&w=800&q=80'],
    description: 'Heritage backwater farm bordered by coconut trees and waterways. Experience local boating and fresh catch dinners.',
    category: 'riverfront',
    rating: 4.7,
    guests: 12,
    bedrooms: 4,
    baths: 4,
    amenities: ['WiFi', 'Backwater View', 'Boating', 'Kitchen', 'Chef']
  }
];

export async function GET(req: Request) {
  await connectDB();
  try {
    // Seed if empty
    const count = await Farm.countDocuments();
    if (count === 0) {
      await Farm.insertMany(SEED_FARMS);
    } else {
      // Check if Sunrise Valley Farm is missing
      const exists = await Farm.findOne({ title: 'Sunrise Valley Farm' });
      if (!exists) {
        await Farm.insertMany(SEED_FARMS);
      }
    }

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