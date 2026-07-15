import mongoose, { Schema, model, models } from 'mongoose';

const ContactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

export default models.Contact || model('Contact', ContactSchema);
