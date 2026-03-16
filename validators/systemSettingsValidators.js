import { body } from 'express-validator';

export const updateSettingsValidator = [
  body('hospitalName').optional().trim(),
  body('hospitalLogo').optional().trim(),
  body('contactEmail').optional().isEmail().withMessage('Valid email').normalizeEmail(),
  body('contactPhone').optional().trim(),
  body('address').optional().trim(),
  body('timezone').optional().trim(),
  body('currency').optional().trim(),
  body('appointmentDuration').optional().isInt({ min: 1 }).toInt(),
  body('defaultConsultationFee').optional().isNumeric({ min: 0 }).toFloat(),
  body('maintenanceMode').optional().isBoolean().toBoolean()
];
