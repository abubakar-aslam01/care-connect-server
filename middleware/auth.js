import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Protect routes: verify JWT and attach user
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const error = new Error('Not authorized, token missing');
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      return next(error);
    }
    next();
  } catch (err) {
    err.statusCode = 401;
    err.message = 'Not authorized, token failed';
    next(err);
  }
};

// Role-based authorization
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    const error = new Error('Forbidden: insufficient role');
    error.statusCode = 403;
    return next(error);
  }
  next();
};
