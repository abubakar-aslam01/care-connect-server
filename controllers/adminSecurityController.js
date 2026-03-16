import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const updateAdminPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      const error = new Error('Old and new password are required');
      error.statusCode = 400;
      throw error;
    }

    const admin = await User.findById(req.user._id).select('+password');
    if (!admin || admin.role !== 'admin') {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }

    const match = await admin.comparePassword(oldPassword);
    if (!match) {
      const error = new Error('Old password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    admin.password = newPassword;
    await admin.save();

    return success(res, 'Password updated');
  } catch (err) {
    next(err);
  }
};

export const toggleTwoFactor = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    if (enabled === undefined) {
      const error = new Error('enabled flag is required');
      error.statusCode = 400;
      throw error;
    }

    const admin = await User.findById(req.user._id);
    if (!admin || admin.role !== 'admin') {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }

    admin.twoFactorEnabled = !!enabled;
    await admin.save();

    return success(res, 'Two-factor setting updated', { twoFactorEnabled: admin.twoFactorEnabled });
  } catch (err) {
    next(err);
  }
};
