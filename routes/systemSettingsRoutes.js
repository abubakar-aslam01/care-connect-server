import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getSettings, updateSettings } from '../controllers/systemSettingsController.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsValidator } from '../validators/systemSettingsValidators.js';

const router = Router();

router.use(requireAdmin);

router.get('/settings', getSettings);
router.put('/settings/update', validate(updateSettingsValidator), updateSettings);

export default router;
