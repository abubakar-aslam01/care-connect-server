import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getPatientProfile = async (req, res, next) => {
  try {
    const patient = await User.findById(req.user._id).select('-password -isDeleted');
    return success(res, 'Patient profile fetched', { patient });
  } catch (err) {
    next(err);
  }
};

export const updatePatientProfile = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.role; // prevent role changes

    const patient = await User.findById(req.user._id).select('+password');
    if (!patient || patient.role !== 'patient') {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(patient, updates);
    await patient.save();

    const clean = await User.findById(patient._id).select('-password -isDeleted');
    return success(res, 'Patient profile updated', { patient: clean });
  } catch (err) {
    next(err);
  }
};
