import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import Booking from '@/models/Booking';
import Farm from '@/models/Farm';
import User from '@/models/User';
// Removed sendBookingEmail from here
import { sendWhatsAppNotification } from '@/lib/whatsapp';


export async function POST(req: Request) {
  await connectDB();
  try {
    const { userId, farmId, startDate, endDate, totalPrice } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and End date are required.' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return NextResponse.json({ error: 'Invalid start date or end date.' }, { status: 400 });
    }

    // Check if the farm is already booked for these dates (excluding Failed payments)
    const overlappingBookings = await Booking.find({
      farmId,
      paymentStatus: { $ne: 'Failed' },
      startDate: { $lt: end },
      endDate: { $gt: start }
    });

    const activeOverlappingBooking = overlappingBookings.find(b => {
      const isConfirmed = !!b.adminConfirmed;
      const isWithinOneHour = (Date.now() - new Date(b.createdAt).getTime()) <= 60 * 60 * 1000;
      return isConfirmed || isWithinOneHour;
    });

    if (activeOverlappingBooking) {
      return NextResponse.json({ error: 'This farmhouse is already booked for the selected dates.' }, { status: 400 });
    }

    const booking = await Booking.create({
      userId,
      farmId,
      startDate,
      endDate,
      totalPrice,
      paymentStatus: 'Paid'
    });

    const farm = await Farm.findById(farmId);
    const user = await User.findById(userId);

    // Email will be sent upon admin confirmation

    const confirmationText = `Hello ${user.name}, your stay at ${farm.title} from ${startDate} to ${endDate} is confirmed! Total: ₹${totalPrice}`;
    await sendWhatsAppNotification(process.env.ADMIN_PHONE_NUMBER!, `New Admin Alert: ${user.name} booked ${farm.title}.`);

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('Error during booking POST:', error);
    return NextResponse.json({ error: 'Booking failed processing' }, { status: 400 });
  }
}

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const farmId = searchParams.get('farmId');

  try {
    const filter: any = {};
    if (userId) {
      if (mongoose.isValidObjectId(userId)) {
        filter.userId = userId;
      } else {
        return NextResponse.json([], { status: 200 });
      }
    }
    if (farmId) {
      if (mongoose.isValidObjectId(farmId)) {
        filter.farmId = farmId;
      } else {
        return NextResponse.json([], { status: 200 });
      }
    }
    const bookings = await Booking.find(filter).populate('farmId').populate('userId');
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error('Error during booking GET:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
