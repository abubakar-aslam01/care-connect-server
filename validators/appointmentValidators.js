import { body, param, query } from 'express-validator';

export const createAppointmentValidator = [
  body('doctorId').isMongoId().withMessage('doctorId must be a valid user id'),
  body('date').isISO8601().withMessage('date must be ISO8601 date'),
  body('time').trim().notEmpty().withMessage('time is required'),
  body('notes').optional().trim().escape()
];

export const updateStatusValidator = [
  param('id').isMongoId().withMessage('Invalid appointment id'),
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
];

export const addNotesValidator = [
  param('id').isMongoId().withMessage('Invalid appointment id'),
  body('notes').notEmpty().withMessage('Notes are required').trim()
];

export const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['pending', 'approved', 'rejected'])
];
