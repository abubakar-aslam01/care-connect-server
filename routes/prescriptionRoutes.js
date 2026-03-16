import { Router } from 'express';
import { generatePrescriptionPdf } from '../controllers/prescriptionController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { prescriptionValidator } from '../validators/prescriptionValidators.js';

const router = Router();

// Generate and download prescription PDF
router.post('/pdf', protect, authorize('doctor', 'admin'), validate(prescriptionValidator), generatePrescriptionPdf);

export default router;
