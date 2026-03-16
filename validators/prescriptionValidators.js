import { body } from 'express-validator';

export const prescriptionValidator = [
  body('hospitalName').trim().notEmpty().withMessage('hospitalName is required'),
  body('doctorName').trim().notEmpty().withMessage('doctorName is required'),
  body('patientName').trim().notEmpty().withMessage('patientName is required'),
  body('notes').trim().notEmpty().withMessage('notes are required'),
  body('date').optional().isISO8601().withMessage('date must be ISO8601 format')
];
