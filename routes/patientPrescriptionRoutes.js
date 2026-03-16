import { Router } from 'express';
import { requirePatient } from '../middleware/requirePatient.js';
import { getPatientPrescriptions } from '../controllers/patientPrescriptionController.js';
import { validate } from '../middleware/validate.js';
import { query } from 'express-validator';

const router = Router();

router.use(requirePatient);

router.get(
  '/profile/prescriptions',
  validate([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ]),
  getPatientPrescriptions
);

export default router;
