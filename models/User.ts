import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Farm' }],
  phone: { type: String },
  location: { type: String },
  image: { type: String },
}, { timestamps: true });

if (models.User && (!models.User.schema.paths.favorites || !models.User.schema.paths.phone)) {
  delete (models as any).User;
}

export default models.User || model('User', UserSchema);