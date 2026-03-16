import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { exportSystemData, backupSystemData, restoreSystemData } from '../controllers/adminDataController.js';
import { validate } from '../middleware/validate.js';
import { body } from 'express-validator';

const router = Router();

router.use(requireAdmin);

router.get('/profile/export-system-data', exportSystemData);
router.post('/profile/backup', backupSystemData);
router.post('/profile/restore', validate([body().notEmpty().withMessage('Restore payload required')]), restoreSystemData);

export default router;
