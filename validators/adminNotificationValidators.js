import { body } from 'express-validator';

export const updateAdminNotificationSettingsValidator = [
  body('receiveSystemAlerts').optional().isBoolean().toBoolean(),
  body('receiveLowStockAlerts').optional().isBoolean().toBoolean(),
  body('receiveSecurityAlerts').optional().isBoolean().toBoolean(),
  body('receiveRevenueReports').optional().isBoolean().toBoolean()
];
