import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { uploadProfileImage } from '../middleware/upload.js';
import { listUsers, uploadAvatar } from '../controllers/userController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import { listUsersValidator } from '../validators/userValidators.js';

const router = Router();

router.get('/', requireAdmin, validate(listUsersValidator), listUsers);
router.post('/profile-image', protect, uploadProfileImage.single('image'), uploadAvatar);

export default router;
