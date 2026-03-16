import { Router } from 'express';
import { requirePatient } from '../middleware/requirePatient.js';
import { exportPatientData } from '../controllers/patientExportController.js';

const router = Router();

router.use(requirePatient);
router.get('/profile/export-data', exportPatientData);

export default router;
