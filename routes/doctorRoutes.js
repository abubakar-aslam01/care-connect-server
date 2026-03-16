import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor
} from '../controllers/doctorController.js';
import {
  createDoctorValidator,
  updateDoctorValidator,
  doctorQueryValidator
} from '../validators/doctorValidators.js';

const router = Router();

router.use(requireAdmin);

router.get('/', validate(doctorQueryValidator), getDoctors);
router.post('/', validate(createDoctorValidator), createDoctor);
router.patch('/:id', validate(updateDoctorValidator), updateDoctor);
router.delete('/:id', validate(updateDoctorValidator), deleteDoctor);

export default router;
