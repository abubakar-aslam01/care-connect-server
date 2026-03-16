import { body } from 'express-validator';

export const updateSettingsValidator = [
  body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phone').optional().trim(),
  body('notificationEmail').optional().isBoolean().toBoolean(),
  body('darkMode').optional().isBoolean().toBoolean()
];

export const updatePasswordValidator = [
  body('oldPassword').notEmpty().withMessage('Old password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];
