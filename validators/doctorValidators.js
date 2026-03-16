import { body, param, query } from 'express-validator';

const availabilityValidators = [
  body('availability.days').optional().isArray({ min: 1 }).withMessage('availability.days must be a non-empty array'),
  body('availability.days.*').optional().isIn(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).withMessage('Invalid day'),
  body('availability.startTime').optional().isString().withMessage('availability.startTime must be a string'),
  body('availability.endTime').optional().isString().withMessage('availability.endTime must be a string')
];

export const createDoctorValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('specialization').optional().trim(),
  body('department').optional().isMongoId().withMessage('department must be a valid id'),
  body('experience').optional().isNumeric({ min: 0 }).withMessage('experience must be a positive number'),
  body('qualification').optional().trim(),
  body('consultationFee').optional().isNumeric({ min: 0 }).withMessage('consultationFee must be positive'),
  ...availabilityValidators,
  body('bio').optional().trim(),
  body('role').optional().equals('doctor').withMessage('Role must be doctor')
];

export const updateDoctorValidator = [
  param('id').isMongoId().withMessage('Invalid doctor id'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('specialization').optional().trim().notEmpty(),
  body('department').optional().isMongoId().withMessage('department must be a valid id'),
  body('experience').optional().isNumeric({ min: 0 }).withMessage('experience must be a positive number'),
  body('qualification').optional().trim(),
  body('consultationFee').optional().isNumeric({ min: 0 }).withMessage('consultationFee must be positive'),
  ...availabilityValidators,
  body('bio').optional().trim()
];

export const doctorQueryValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('department').optional().isMongoId().withMessage('department must be a valid id'),
  query('search').optional().isString().trim()
];
