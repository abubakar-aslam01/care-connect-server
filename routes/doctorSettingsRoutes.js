import { Router } from 'express';
import { requireDoctor } from '../middleware/requireDoctor.js';
import { updateDoctorPassword, updateDoctorSettings } from '../controllers/doctorSettingsController.js';
import { validate } from '../middleware/validate.js';
import { updatePasswordValidator, updateSettingsValidator } from '../validators/doctorSettingsValidators.js';

const router = Router();

router.use(requireDoctor);

router.put('/settings/update', validate(updateSettingsValidator), updateDoctorSettings);
router.put('/settings/password', validate(updatePasswordValidator), updateDoctorPassword);

export default router;
