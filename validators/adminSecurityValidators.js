import { body } from 'express-validator';

export const updateAdminPasswordValidator = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

export const toggleTwoFactorValidator = [
  body('enabled').isBoolean().withMessage('enabled must be boolean').toBoolean()
];
