import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const updateDoctorSettings = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.user._id);
    if (!doctor || doctor.role !== 'doctor') {
      const error = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }

    const fields = ['email', 'phone'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) doctor[f] = req.body[f];
    });

    if (req.body.notificationEmail !== undefined) doctor.notificationEmail = !!req.body.notificationEmail;
    if (req.body.darkMode !== undefined) doctor.darkMode = !!req.body.darkMode;

    await doctor.save();
    const clean = await User.findById(doctor._id).select('-password');
    return success(res, 'Settings updated', { doctor: clean });
  } catch (err) {
    next(err);
  }
};

export const updateDoctorPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      const error = new Error('Old and new password are required');
      error.statusCode = 400;
      throw error;
    }

    const doctor = await User.findById(req.user._id).select('+password');
    if (!doctor || doctor.role !== 'doctor') {
      const error = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }

    const match = await doctor.comparePassword(oldPassword);
    if (!match) {
      const error = new Error('Old password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    doctor.password = newPassword;
    await doctor.save();

    return success(res, 'Password updated');
  } catch (err) {
    next(err);
  }
};
