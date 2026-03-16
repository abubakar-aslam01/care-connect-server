import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { updateAdminPassword, toggleTwoFactor } from '../controllers/adminSecurityController.js';
import { validate } from '../middleware/validate.js';
import { updateAdminPasswordValidator, toggleTwoFactorValidator } from '../validators/adminSecurityValidators.js';

const router = Router();

router.use(requireAdmin);

router.put('/profile/password', validate(updateAdminPasswordValidator), updateAdminPassword);
router.put('/profile/two-factor-toggle', validate(toggleTwoFactorValidator), toggleTwoFactor);

export default router;
