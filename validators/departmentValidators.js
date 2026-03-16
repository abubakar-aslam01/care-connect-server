import { body, param } from 'express-validator';

export const createDepartmentValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim()
];

export const updateDepartmentValidator = [
  param('id').isMongoId().withMessage('Invalid department id'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim()
];
