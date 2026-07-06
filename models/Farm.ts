import mongoose, { Schema, model, models } from 'mongoose';

const FarmSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  images: [{ type: String }], // Cloudinary URLs
  amenities: [{ type: String }],
  guests: { type: Number, default: 2 },
  bedrooms: { type: Number, default: 1 },
  baths: { type: Number, default: 1 },
  rating: { type: Number, default: 4.8 },
  category: { type: String, default: 'Farmhouse' },
}, { timestamps: true });

export default models.Farm || model('Farm', FarmSchema);