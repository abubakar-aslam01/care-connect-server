import { Router } from 'express';
import {
  addPrescriptionNotes,
  cancelAppointment,
  createAppointment,
  getAllAppointments,
  getDoctorAppointments,
  getMyAppointments,
  updateAppointmentStatus
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import {
  addNotesValidator,
  createAppointmentValidator,
  paginationValidator,
  updateStatusValidator
} from '../validators/appointmentValidators.js';

const router = Router();

// Patient routes
router.post('/', protect, authorize('patient'), validate(createAppointmentValidator), createAppointment);
router.get('/me', protect, authorize('patient'), validate(paginationValidator), getMyAppointments);
router.patch('/:id/cancel', protect, authorize('patient'), cancelAppointment);

// Doctor routes
router.get('/doctor', protect, authorize('doctor'), validate(paginationValidator), getDoctorAppointments);
router.patch('/:id/status', protect, authorize('doctor'), validate(updateStatusValidator), updateAppointmentStatus);
router.patch('/:id/notes', protect, authorize('doctor'), validate(addNotesValidator), addPrescriptionNotes);

// Admin routes
router.get('/', requireAdmin, validate(paginationValidator), getAllAppointments);

export default router;
