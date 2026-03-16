import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const updatePatientPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      const error = new Error('Old and new password are required');
      error.statusCode = 400;
      throw error;
    }

    const patient = await User.findById(req.user._id).select('+password');
    if (!patient || patient.role !== 'patient') {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    const match = await patient.comparePassword(oldPassword);
    if (!match) {
      const error = new Error('Old password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    patient.password = newPassword;
    await patient.save();

    return success(res, 'Password updated');
  } catch (err) {
    next(err);
  }
};
