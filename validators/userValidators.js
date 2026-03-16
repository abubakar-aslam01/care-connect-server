import { query } from 'express-validator';

export const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('role').optional().isIn(['admin', 'doctor', 'patient']).withMessage('Invalid role filter'),
  query('search').optional().isString().trim().escape()
];
