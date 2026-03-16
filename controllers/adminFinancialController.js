import { Appointment } from '../models/Appointment.js';
import { PharmacyTransaction } from '../models/PharmacyTransaction.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getFinancialOverview = async (req, res, next) => {
  try {
    // Consultation revenue: sum doctor consultationFee for approved appointments
    const consultationAgg = await Appointment.aggregate([
      { $match: { status: 'approved' } },
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
          total: { $sum: { $ifNull: ['$doctor.consultationFee', 0] } }
        }
      }
    ]);
    const totalConsultationRevenue = consultationAgg[0]?.total || 0;

    // Pharmacy revenue
    const pharmacyAgg = await PharmacyTransaction.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const pharmacyRevenue = pharmacyAgg[0]?.total || 0;

    // Monthly revenue (consultation + pharmacy)
    const monthlyConsultations = await Appointment.aggregate([
      { $match: { status: 'approved' } },
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
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: { $ifNull: ['$doctor.consultationFee', 0] } }
        }
      }
    ]);

    const monthlyPharmacy = await PharmacyTransaction.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$total' }
        }
      }
    ]);

    const monthlyMap = new Map();
    monthlyConsultations.forEach((m) => {
      const key = `${m._id.year}-${String(m._id.month).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + m.total);
    });
    monthlyPharmacy.forEach((m) => {
      const key = `${m._id.year}-${String(m._id.month).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + m.total);
    });
    const monthlyRevenueStats = Array.from(monthlyMap.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => (a.month > b.month ? 1 : -1));

    // Department revenue breakdown (consultation revenue per doctor department)
    const deptAgg = await Appointment.aggregate([
      { $match: { status: 'approved' } },
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
          _id: '$doctor.department',
          total: { $sum: { $ifNull: ['$doctor.consultationFee', 0] } }
        }
      }
    ]);

    // Fetch department names
    const deptIds = deptAgg.map((d) => d._id).filter(Boolean);
    const deptMap = new Map();
    if (deptIds.length) {
      const depts = await Department.find({ _id: { $in: deptIds } }).select('name');
      depts.forEach((d) => deptMap.set(String(d._id), d.name));
    }
    const departmentRevenueBreakdown = deptAgg.map((d) => ({
      departmentId: d._id,
      departmentName: deptMap.get(String(d._id)) || 'Unassigned',
      total: d.total
    }));

    return success(res, 'Financial overview fetched', {
      totalConsultationRevenue,
      pharmacyRevenue,
      monthlyRevenueStats,
      departmentRevenueBreakdown
    });
  } catch (err) {
    next(err);
  }
};
