import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getFinancialOverview } from '../controllers/adminFinancialController.js';

const router = Router();

router.use(requireAdmin);
router.get('/profile/financial-overview', getFinancialOverview);

export default router;
