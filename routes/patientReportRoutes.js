import { Router } from 'express';
import { requirePatient } from '../middleware/requirePatient.js';
import { uploadReport } from '../config/uploadReports.js';
import { uploadReport as uploadReportCtrl, getReports, deleteReport } from '../controllers/patientReportController.js';
import { validate } from '../middleware/validate.js';
import { param, query } from 'express-validator';

const router = Router();

router.use(requirePatient);

router.post('/profile/upload-report', uploadReport.single('file'), uploadReportCtrl);
router.get('/profile/reports', validate([
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
]), getReports);
router.delete('/profile/report/:id', validate([param('id').isMongoId()]), deleteReport);

export default router;
