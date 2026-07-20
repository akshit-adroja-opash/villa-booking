import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  name: string;
  role: string;
  text: string;
  img: string;
  rating: number;
  farmId?: mongoose.Types.ObjectId;
}

const ReviewSchema: Schema = new Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'Guest' },
  text: { type: String, required: true },
  img: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
  rating: { type: Number, default: 5 },
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm' },
}, {
  timestamps: true,
});

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
