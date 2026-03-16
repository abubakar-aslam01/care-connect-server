import { Router } from 'express';
import { getOverviewStats } from '../controllers/statsController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/overview', requireAdmin, getOverviewStats);

export default router;
