import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment
} from '../controllers/departmentController.js';
import { validate } from '../middleware/validate.js';
import { createDepartmentValidator, updateDepartmentValidator } from '../validators/departmentValidators.js';

const router = Router();

router.use(requireAdmin);

router.post('/', validate(createDepartmentValidator), createDepartment);
router.get('/', getDepartments);
router.patch('/:id', validate(updateDepartmentValidator), updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
