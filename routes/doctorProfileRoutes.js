import { Router } from 'express';
import { requireDoctor } from '../middleware/requireDoctor.js';
import { getDoctorProfile, updateDoctorProfile } from '../controllers/doctorProfileController.js';
import { getDoctorDepartment } from '../controllers/doctorDepartmentController.js';
import { getDoctorReports } from '../controllers/doctorReportsController.js';
import { validate } from '../middleware/validate.js';
import { updateDoctorProfileValidator } from '../validators/doctorProfileValidators.js';

const router = Router();

router.use(requireDoctor);

router.get('/profile', getDoctorProfile);
router.put('/profile/update', validate(updateDoctorProfileValidator), updateDoctorProfile);
router.get('/department', getDoctorDepartment);
router.get('/reports', getDoctorReports);

export default router;
