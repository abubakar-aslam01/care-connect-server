import { Appointment } from '../models/Appointment.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getPatientAppointmentsSummary = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const now = new Date();

    const [counts, upcoming] = await Promise.all([
      Appointment.aggregate([
        { $match: { patientId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Appointment.countDocuments({ patientId, date: { $gt: now } })
    ]);

    const map = counts.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {});

    const totalAppointments = Object.values(map).reduce((a, b) => a + b, 0);
    const upcomingAppointments = upcoming;
    const completedAppointments = map.approved || 0; // treat approved as completed
    const cancelledAppointments = map.rejected || 0; // treat rejected as cancelled

    return success(res, 'Patient appointment summary fetched', {
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments
    });
  } catch (err) {
    next(err);
  }
};
