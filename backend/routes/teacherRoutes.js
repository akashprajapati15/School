import express from 'express';
import {
  getAllTeachers,
  getPendingTeachers,
  updateTeacherStatus,
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateUpdateStatus } from '../validations/schemas.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin')); // All teacher admin tasks require Super Admin role

router.get('/', getAllTeachers);
router.get('/pending', getPendingTeachers);
router.put('/:id/status', validateUpdateStatus, updateTeacherStatus);

export default router;
