import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    stock: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'unit', trim: true },
    price: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export const Medicine = mongoose.model('Medicine', medicineSchema);
