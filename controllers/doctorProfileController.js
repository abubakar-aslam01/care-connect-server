import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.user._id).select('-password').populate('department', 'name');
    return success(res, 'Doctor profile fetched', { doctor });
  } catch (err) {
    next(err);
  }
};

export const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.user._id).select('+password');
    if (!doctor || doctor.role !== 'doctor') {
      const error = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }

    const fields = ['name', 'specialization', 'qualification', 'experience', 'consultationFee', 'bio', 'profileImage'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) doctor[field] = req.body[field];
    });

    if (req.body.department !== undefined) doctor.department = req.body.department || null;
    if (req.body.availability) {
      doctor.availability = {
        ...doctor.availability,
        ...req.body.availability
      };
    }

    await doctor.save();
    const clean = await User.findById(doctor._id).select('-password').populate('department', 'name');
    return success(res, 'Doctor profile updated', { doctor: clean });
  } catch (err) {
    next(err);
  }
};
