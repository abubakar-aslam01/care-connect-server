import { PharmacyTransaction } from '../models/PharmacyTransaction.js';
import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getPatientPrescriptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      PharmacyTransaction.find({ patientId: req.user._id })
        .populate('doctorId', 'name email role')
        .populate('items.medicine', 'name price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PharmacyTransaction.countDocuments({ patientId: req.user._id })
    ]);

    return success(res, 'Prescriptions fetched', {
      prescriptions: items.map((p) => ({
        id: p._id,
        doctor: p.doctorId,
        medicines: p.items,
        diagnosis: p.notes,
        date: p.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};
