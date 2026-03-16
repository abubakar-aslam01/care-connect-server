import { Router } from 'express';
import { requireDoctor } from '../middleware/requireDoctor.js';
import { listMedicines, createPrescription } from '../controllers/doctorPharmacyController.js';
import { validate } from '../middleware/validate.js';
import { body, query } from 'express-validator';

const router = Router();

router.use(requireDoctor);

router.get(
  '/medicines',
  validate([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim()
  ]),
  listMedicines
);

router.post(
  '/prescription',
  validate([
    body('medicines').isArray({ min: 1 }).withMessage('medicines must be an array'),
    body('medicines.*.medicineId').isMongoId().withMessage('medicineId required'),
    body('medicines.*.quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
    body('patientId').optional().isMongoId(),
    body('appointmentId').optional().isMongoId(),
    body('patientName').optional().trim(),
    body('notes').optional().trim()
  ]),
  createPrescription
);

export default router;
