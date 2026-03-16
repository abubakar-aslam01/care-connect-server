import { body } from 'express-validator';

export const updateAdminProfileValidator = [
  body('fullName').optional().trim(),
  body('profileImage').optional().trim(),
  body('phoneNumber').optional().trim(),
  body('alternatePhone').optional().trim(),
  body('designation').optional().trim(),
  body('departmentAccess').optional().isArray(),
  body('departmentAccess.*').optional().isMongoId(),
  body('twoFactorEnabled').optional().isBoolean().toBoolean(),
  body('loginAttempts').optional().isInt({ min: 0 }).toInt(),
  body('accountStatus').optional().isIn(['active', 'suspended']),
  body('emailNotificationsEnabled').optional().isBoolean().toBoolean(),
  body('smsNotificationsEnabled').optional().isBoolean().toBoolean(),
  body('appointmentReminderEnabled').optional().isBoolean().toBoolean()
];
