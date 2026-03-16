import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const updatePatientNotificationSettings = async (req, res, next) => {
  try {
    const { emailNotificationsEnabled, smsNotificationsEnabled, appointmentReminderEnabled } = req.body;

    const patient = await User.findById(req.user._id);
    if (!patient || patient.role !== 'patient') {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    if (emailNotificationsEnabled !== undefined) patient.emailNotificationsEnabled = !!emailNotificationsEnabled;
    if (smsNotificationsEnabled !== undefined) patient.smsNotificationsEnabled = !!smsNotificationsEnabled;
    if (appointmentReminderEnabled !== undefined) patient.appointmentReminderEnabled = !!appointmentReminderEnabled;

    await patient.save();
    const clean = await User.findById(patient._id).select('-password');
    return success(res, 'Notification settings updated', { patient: clean });
  } catch (err) {
    next(err);
  }
};
