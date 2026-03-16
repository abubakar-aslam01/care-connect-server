import { Router } from 'express';
import { requirePatient } from '../middleware/requirePatient.js';

const router = Router();

// Apply patient guard to all patient routes
router.use(requirePatient);

// Simple placeholder endpoint for patient profile (extend later)
router.get('/me', (req, res) => {
  res.status(200).json({ success: true, message: 'Patient access granted', data: { user: req.user } });
});

export default router;
