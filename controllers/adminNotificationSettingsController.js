import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const updateAdminNotificationSettings = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin || admin.role !== 'admin') {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }

    const fields = ['receiveSystemAlerts', 'receiveLowStockAlerts', 'receiveSecurityAlerts', 'receiveRevenueReports'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) admin[f] = !!req.body[f];
    });

    await admin.save();
    const clean = await User.findById(admin._id).select('-password -isDeleted');
    return success(res, 'Notification settings updated', { admin: clean });
  } catch (err) {
    next(err);
  }
};
