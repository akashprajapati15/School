import express from 'express';
import {
  registerTeacher,
  registerStudent,
  login,
  getMe,
  updateProfile,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validateTeacherRegister,
  validateStudentRegister,
  validateLogin,
  validateUpdateProfile,
} from '../validations/schemas.js';

const router = express.Router();

router.post('/register-teacher', validateTeacherRegister, registerTeacher);
router.post('/register-student', validateStudentRegister, registerStudent);
router.post('/login', validateLogin, login);

router.use(protect); // All routes below are protected
router.get('/me', getMe);
router.put('/profile', validateUpdateProfile, updateProfile);
router.post('/logout', logout);

export default router;
