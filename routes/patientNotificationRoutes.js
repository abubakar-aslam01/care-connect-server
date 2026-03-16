import { Router } from 'express';
import { requirePatient } from '../middleware/requirePatient.js';
import { getNotifications, markRead, deleteNotification } from '../controllers/notificationController.js';
import { validate } from '../middleware/validate.js';
import { param, query } from 'express-validator';

const router = Router();

router.use(requirePatient);

router.get(
  '/notifications',
  validate([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ]),
  getNotifications
);

router.put('/notifications/read/:id', validate([param('id').isMongoId()]), markRead);
router.delete('/notifications/:id', validate([param('id').isMongoId()]), deleteNotification);

export default router;
