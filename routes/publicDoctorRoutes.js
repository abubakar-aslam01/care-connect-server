import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { doctorQueryValidator } from '../validators/doctorValidators.js';
import { listPublicDoctors } from '../controllers/doctorController.js';

const router = Router();

// Allow any authenticated user to browse doctors
router.get('/doctors', protect, validate(doctorQueryValidator), listPublicDoctors);

export default router;
