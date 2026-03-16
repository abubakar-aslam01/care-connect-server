import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const deletePatientAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      const error = new Error('Password is required');
      error.statusCode = 400;
      throw error;
    }

    const patient = await User.findById(req.user._id).select('+password');
    if (!patient || patient.role !== 'patient') {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    const match = await patient.comparePassword(password);
    if (!match) {
      const error = new Error('Incorrect password');
      error.statusCode = 400;
      throw error;
    }

    patient.isDeleted = true;
    await patient.save();

    return success(res, 'Account marked as deleted. Future logins are blocked.');
  } catch (err) {
    next(err);
  }
};
