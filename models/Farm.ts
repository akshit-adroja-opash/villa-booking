import { Schema, model, models } from 'mongoose';

const FarmSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  mapLink: { type: String },
  pricePerNight: { type: Number, required: true },
  images: [{ type: String }], // Cloudinary URLs
  amenities: [{ type: String }],
  guests: { type: Number, default: 2 },
  bedrooms: { type: Number, default: 1 },
  acRooms: { type: Number, default: 0 },
  nonAcRooms: { type: Number, default: 0 },
  baths: { type: Number, default: 1 },
  acres: { type: Number },
  rating: { type: Number, default: 4.8 },
  category: { type: String, default: 'Farmhouse' },
  isActive: { type: Boolean, default: true },
  houseRules: [{ type: String }],
  cancellationPolicy: { type: String },
}, { timestamps: true });

const Farm = models.Farm || model('Farm', FarmSchema);
export default Farm;