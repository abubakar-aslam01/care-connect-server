import { Appointment } from '../models/Appointment.js';
import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getDoctorReports = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const doctor = await User.findById(doctorId).select('consultationFee');
    const fee = doctor?.consultationFee || 0;

    const [totals, monthlyAgg] = await Promise.all([
      Appointment.aggregate([
        { $match: { doctorId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
          }
        }
      ]),
      Appointment.aggregate([
        { $match: { doctorId } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const summary = totals[0] || { total: 0, approved: 0, rejected: 0 };
    const totalEarnings = (summary.approved || 0) * fee;

    const monthlyStats = monthlyAgg.map((item) => {
      const month = String(item._id.month).padStart(2, '0');
      return { month: `${item._id.year}-${month}`, count: item.count };
    });

    return success(res, 'Doctor reports fetched', {
      totalAppointments: summary.total || 0,
      approvedCount: summary.approved || 0,
      rejectedCount: summary.rejected || 0,
      totalEarnings,
      monthlyStats
    });
  } catch (err) {
    next(err);
  }
};
