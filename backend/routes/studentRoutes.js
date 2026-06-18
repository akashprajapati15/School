import express from 'express';
import { getAllStudents, removeStudent } from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Teachers and Super Admins can view the roster of students
router.get('/', authorize('super_admin', 'teacher'), getAllStudents);

// Only Super Admin can delete student user accounts
router.delete('/:id', authorize('super_admin'), removeStudent);

export default router;
