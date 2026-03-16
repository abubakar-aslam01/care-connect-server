import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import { body, param, query } from 'express-validator';
import { createMedicine, deleteMedicine, listMedicinesAdmin, updateMedicine } from '../controllers/adminPharmacyController.js';
import { listPharmacyActivity } from '../controllers/adminPharmacyActivityController.js';

const router = Router();

router.use(requireAdmin);

router.get(
  '/pharmacy/medicines',
  validate([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim()
  ]),
  listMedicinesAdmin
);

router.post(
  '/pharmacy/medicines',
  validate([
    body('name').notEmpty().withMessage('name is required').trim(),
    body('description').optional().trim(),
    body('stock').isInt({ min: 0 }).withMessage('stock must be >= 0').toInt(),
    body('price').optional().isFloat({ min: 0 }).toFloat(),
    body('unit').optional().trim()
  ]),
  createMedicine
);

router.put(
  '/pharmacy/medicines/:id',
  validate([
    param('id').isMongoId(),
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('stock').optional().isInt({ min: 0 }).toInt(),
    body('price').optional().isFloat({ min: 0 }).toFloat(),
    body('unit').optional().trim()
  ]),
  updateMedicine
);

router.delete('/pharmacy/medicines/:id', validate([param('id').isMongoId()]), deleteMedicine);

router.get(
  '/pharmacy/activity',
  validate([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ]),
  listPharmacyActivity
);

export default router;
