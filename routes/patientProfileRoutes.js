import { Router } from 'express';
import { requirePatient } from '../middleware/requirePatient.js';
import { getPatientProfile, updatePatientProfile } from '../controllers/patientProfileController.js';
import { validate } from '../middleware/validate.js';
import { updatePatientProfileValidator } from '../validators/patientProfileValidators.js';

const router = Router();

router.use(requirePatient);

router.get('/profile', getPatientProfile);
router.put('/profile/update', validate(updatePatientProfileValidator), updatePatientProfile);

export default router;
