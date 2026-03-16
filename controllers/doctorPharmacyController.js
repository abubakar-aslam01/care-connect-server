import mongoose from 'mongoose';
import { Medicine } from '../models/Medicine.js';
import { PharmacyTransaction } from '../models/PharmacyTransaction.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const listMedicines = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const [items, total] = await Promise.all([
      Medicine.find(query).skip(skip).limit(Number(limit)).sort({ name: 1 }),
      Medicine.countDocuments(query)
    ]);
    return success(res, 'Medicines fetched', {
      medicines: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createPrescription = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { medicines = [], patientId, patientName, notes, appointmentId } = req.body;
    if (!Array.isArray(medicines) || medicines.length === 0) {
      const error = new Error('Medicines array is required');
      error.statusCode = 400;
      throw error;
    }

    session.startTransaction();

    // Fetch all medicines involved
    const ids = medicines.map((m) => m.medicineId);
    const dbMeds = await Medicine.find({ _id: { $in: ids } }).session(session);
    const medMap = new Map(dbMeds.map((m) => [String(m._id), m]));

    let total = 0;
    const items = [];

    for (const item of medicines) {
      const { medicineId, quantity } = item;
      const med = medMap.get(String(medicineId));
      if (!med) {
        const error = new Error('Medicine not found');
        error.statusCode = 404;
        throw error;
      }
      if (!quantity || quantity <= 0) {
        const error = new Error('Quantity must be greater than zero');
        error.statusCode = 400;
        throw error;
      }
      if (med.stock < quantity) {
        const error = new Error(`Insufficient stock for ${med.name}`);
        error.statusCode = 400;
        throw error;
      }
      med.stock -= quantity;
      await med.save({ session });
      const price = med.price || 0;
      items.push({ medicine: med._id, quantity, price });
      total += price * quantity;
    }

    const transaction = await PharmacyTransaction.create(
      [
        {
          doctorId: req.user._id,
          patientId: patientId || undefined,
          patientName,
          notes,
          appointmentId: appointmentId || undefined,
          items,
          total
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return success(res, 'Prescription created', { transaction: transaction[0] }, 201);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
