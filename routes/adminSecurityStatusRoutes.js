import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getSecurityStatus } from '../controllers/adminSecurityStatusController.js';

const router = Router();

router.use(requireAdmin);
router.get('/profile/security-status', getSecurityStatus);

export default router;
