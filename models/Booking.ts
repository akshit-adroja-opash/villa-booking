import mongoose, { Schema, model, models } from 'mongoose';

const BookingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  razorpayOrderId: { type: String },
}, { timestamps: true });

export default models.Booking || model('Booking', BookingSchema);