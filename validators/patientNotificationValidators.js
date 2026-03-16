import { body } from 'express-validator';

export const updatePatientNotificationSettingsValidator = [
  body('emailNotificationsEnabled').optional().isBoolean().toBoolean(),
  body('smsNotificationsEnabled').optional().isBoolean().toBoolean(),
  body('appointmentReminderEnabled').optional().isBoolean().toBoolean()
];
