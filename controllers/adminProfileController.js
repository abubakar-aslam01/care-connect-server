import { User } from '../models/User.js';

const success = (res, message, data = {}, status = 200) => res.status(status).json({ success: true, message, data });

export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user._id).select('-password -isDeleted');
    return success(res, 'Admin profile fetched', { admin });
  } catch (err) {
    next(err);
  }
};

export const updateAdminProfile = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.role;

    const admin = await User.findById(req.user._id).select('+password');
    if (!admin || admin.role !== 'admin') {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(admin, updates);
    await admin.save();

    const clean = await User.findById(admin._id).select('-password -isDeleted');
    return success(res, 'Admin profile updated', { admin: clean });
  } catch (err) {
    next(err);
  }
};
