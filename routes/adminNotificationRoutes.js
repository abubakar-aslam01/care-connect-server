import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { updateAdminNotificationSettings } from '../controllers/adminNotificationSettingsController.js';
import { validate } from '../middleware/validate.js';
import { updateAdminNotificationSettingsValidator } from '../validators/adminNotificationValidators.js';

const router = Router();

router.use(requireAdmin);
router.put('/profile/notification-settings', validate(updateAdminNotificationSettingsValidator), updateAdminNotificationSettings);

export default router;
