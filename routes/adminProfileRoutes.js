import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getAdminProfile, updateAdminProfile } from '../controllers/adminProfileController.js';
import { validate } from '../middleware/validate.js';
import { updateAdminProfileValidator } from '../validators/adminProfileValidators.js';

const router = Router();

router.use(requireAdmin);

router.get('/profile', getAdminProfile);
router.put('/profile/update', validate(updateAdminProfileValidator), updateAdminProfile);

export default router;
