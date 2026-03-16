import { Router } from 'express';
import { requirePatient } from '../middleware/requirePatient.js';
import { getPatientBilling } from '../controllers/patientBillingController.js';

const router = Router();

router.use(requirePatient);
router.get('/profile/billing', getPatientBilling);

export default router;
