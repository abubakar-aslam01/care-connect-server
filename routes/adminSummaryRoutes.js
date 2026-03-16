import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getAdminSummary } from '../controllers/adminSummaryController.js';

const router = Router();

router.use(requireAdmin);
router.get('/profile/summary', getAdminSummary);

export default router;
