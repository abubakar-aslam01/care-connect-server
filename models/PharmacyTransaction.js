import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    patientName: { type: String, trim: true },
    notes: { type: String, trim: true },
    items: [
      {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, default: 0, min: 0 }
      }
    ],
    total: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export const PharmacyTransaction = mongoose.model('PharmacyTransaction', transactionSchema);
