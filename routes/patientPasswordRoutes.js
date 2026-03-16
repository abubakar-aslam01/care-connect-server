import { Router } from 'express';
import { requirePatient } from '../middleware/requirePatient.js';
import { updatePatientPassword } from '../controllers/patientPasswordController.js';
import { validate } from '../middleware/validate.js';
import { updatePatientPasswordValidator } from '../validators/patientPasswordValidators.js';
import { deletePatientAccount } from '../controllers/patientDeleteController.js';
import { body } from 'express-validator';

const router = Router();

router.use(requirePatient);
router.put('/profile/password', validate(updatePatientPasswordValidator), updatePatientPassword);
router.delete(
  '/profile/delete-account',
  validate([body('password').notEmpty().withMessage('Password is required')]),
  deletePatientAccount
);

export default router;
