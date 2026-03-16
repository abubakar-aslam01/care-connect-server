import path from 'path';
import { User } from '../models/User.js';

// Admin: list users with pagination/search
export const listUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { role, search } = req.query;

    const filter = { isDeleted: { $ne: true } };
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password')
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      success: true,
      message: 'Users fetched',
      data: {
        users,
        pagination: { page, limit, total, totalPages }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No file uploaded');
      error.statusCode = 400;
      throw error;
    }

    // Build accessible URL (assuming static /uploads served)
    const relativePath = path.posix.join('/uploads/profile', req.file.filename);
    const fileUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

    req.user.profileImage = fileUrl;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile image uploaded',
      data: {
        profileImage: fileUrl
      }
    });
  } catch (err) {
    next(err);
  }
};
