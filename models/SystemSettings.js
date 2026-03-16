import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema(
  {
    hospitalName: { type: String, trim: true },
    hospitalLogo: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    address: { type: String, trim: true },
    timezone: { type: String, trim: true },
    currency: { type: String, trim: true },
    appointmentDuration: { type: Number, min: 1, default: 30 },
    defaultConsultationFee: { type: Number, min: 0, default: 0 },
    maintenanceMode: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
