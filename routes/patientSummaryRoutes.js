import { Router } from 'express';
import { requirePatient } from '../middleware/requirePatient.js';
import { getPatientAppointmentsSummary } from '../controllers/patientAppointmentsSummaryController.js';

const router = Router();

router.use(requirePatient);
router.get('/profile/appointments-summary', getPatientAppointmentsSummary);

export default router;
