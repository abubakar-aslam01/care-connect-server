import { body } from 'express-validator';

const availabilityValidators = [
  body('availability.days').optional().isArray({ min: 1 }).withMessage('availability.days must be a non-empty array'),
  body('availability.days.*').optional().isIn(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).withMessage('Invalid day'),
  body('availability.startTime').optional().isString().withMessage('availability.startTime must be a string'),
  body('availability.endTime').optional().isString().withMessage('availability.endTime must be a string')
];

export const updateDoctorProfileValidator = [
  body('name').optional().trim().notEmpty(),
  body('specialization').optional().trim().notEmpty(),
  body('qualification').optional().trim(),
  body('experience').optional().isNumeric({ min: 0 }).withMessage('experience must be positive'),
  body('consultationFee').optional().isNumeric({ min: 0 }).withMessage('consultationFee must be positive'),
  ...availabilityValidators,
  body('bio').optional().trim(),
  body('profileImage').optional().isString().trim(),
  body('department').optional().isMongoId().withMessage('department must be a valid id')
];
