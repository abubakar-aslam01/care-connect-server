import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';
import { PharmacyTransaction } from '../models/PharmacyTransaction.js';
import { SystemSettings } from '../models/SystemSettings.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getAdminSummary = async (req, res, next) => {
  try {
    const [userAgg, appointmentCount, pharmacyAgg, settings] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: '$role',
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$accountStatus', 'active'] }, 1, 0] } },
            suspended: { $sum: { $cond: [{ $eq: ['$accountStatus', 'suspended'] }, 1, 0] } }
          }
        }
      ]),
      Appointment.countDocuments(),
      PharmacyTransaction.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      SystemSettings.findOne()
    ]);

    const totals = userAgg.reduce(
      (acc, cur) => {
        acc.totalUsers += cur.total;
        if (cur._id === 'doctor') acc.totalDoctors = cur.total;
        if (cur._id === 'patient') acc.totalPatients = cur.total;
        acc.activeUsers += cur.active;
        acc.suspendedUsers += cur.suspended;
        return acc;
      },
      { totalUsers: 0, totalDoctors: 0, totalPatients: 0, activeUsers: 0, suspendedUsers: 0 }
    );

    const totalRevenue = pharmacyAgg[0]?.total || 0;
    const systemHealthStatus = settings?.maintenanceMode ? 'maintenance' : 'healthy';

    return success(res, 'Admin summary fetched', {
      totalUsers: totals.totalUsers,
      totalDoctors: totals.totalDoctors,
      totalPatients: totals.totalPatients,
      activeUsers: totals.activeUsers,
      suspendedUsers: totals.suspendedUsers,
      totalAppointments: appointmentCount,
      totalRevenue,
      systemHealthStatus
    });
  } catch (err) {
    next(err);
  }
};
