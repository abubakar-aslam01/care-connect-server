import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const requireAdmin = async (req, res, next) => {
  try {
    req.requestedIp = req.ip || req.headers['x-forwarded-for'];
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
      const err = new Error('Not authorized, token missing');
      err.statusCode = 401;
      throw err;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.role !== 'admin' || user.isDeleted) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    req.user = user;
    next();
  } catch (err) {
    err.statusCode = err.statusCode || 401;
    next(err);
  }
};
