import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';

export const getOverviewStats = async (req, res, next) => {
  try {
    const [usersTotal, doctorsTotal, patientsTotal, appointmentsTotal, monthlyAgg] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'patient' }),
      Appointment.countDocuments(),
      Appointment.aggregate([
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Format monthly stats as YYYY-MM with count
    const monthlyAppointments = monthlyAgg.map((item) => {
      const month = String(item._id.month).padStart(2, '0');
      return {
        month: `${item._id.year}-${month}`,
        count: item.count
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Overview statistics fetched',
      data: {
        totals: {
          users: usersTotal,
          doctors: doctorsTotal,
          patients: patientsTotal,
          appointments: appointmentsTotal
        },
        monthlyAppointments
      }
    });
  } catch (err) {
    next(err);
  }
};
