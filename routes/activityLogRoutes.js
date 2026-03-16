import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { validate } from '../middleware/validate.js';
import { query } from 'express-validator';

const router = Router();

router.use(requireAdmin);

router.get(
  '/profile/activity-logs',
  validate([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
    query('userId').optional().isMongoId(),
    query('role').optional().trim(),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601()
  ]),
  getActivityLogs
);

export default router;
