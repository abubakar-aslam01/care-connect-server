import { Appointment } from '../models/Appointment.js';
import { PharmacyTransaction } from '../models/PharmacyTransaction.js';
import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getPatientBilling = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    // Consultation fees: sum doctor consultationFee for approved appointments
    const appointments = await Appointment.aggregate([
      { $match: { patientId, status: 'approved' } },
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ['$doctor.consultationFee', 0] } },
          history: {
            $push: {
              type: 'consultation',
              doctor: '$doctor.name',
              amount: { $ifNull: ['$doctor.consultationFee', 0] },
              date: '$createdAt',
              appointmentId: '$_id'
            }
          }
        }
      }
    ]);

    const consultationTotal = appointments[0]?.total || 0;
    const consultationHistory = appointments[0]?.history || [];

    // Pharmacy purchases: sum totals for patient
    const pharmacyTx = await PharmacyTransaction.aggregate([
      { $match: { patientId } },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          history: {
            $push: {
              type: 'pharmacy',
              amount: '$total',
              date: '$createdAt',
              transactionId: '$_id'
            }
          }
        }
      }
    ]);

    const pharmacyTotal = pharmacyTx[0]?.total || 0;
    const pharmacyHistory = pharmacyTx[0]?.history || [];

    const transactionHistory = [...consultationHistory, ...pharmacyHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return success(res, 'Billing summary fetched', {
      totalConsultationFees: consultationTotal,
      pharmacyPurchases: pharmacyTotal,
      totalSpent: consultationTotal + pharmacyTotal,
      transactionHistory
    });
  } catch (err) {
    next(err);
  }
};
