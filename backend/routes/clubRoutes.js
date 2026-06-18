import express from 'express';
import {
  createClub,
  getAllClubs,
  getClubById,
  updateClub,
  assignTeacher,
  deleteClub,
} from '../controllers/clubController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateClub, validateAssignTeacher } from '../validations/schemas.js';

const router = express.Router();

router.use(protect); // All club operations require authentication

router
  .route('/')
  .post(authorize('super_admin'), validateClub, createClub)
  .get(getAllClubs);

router
  .route('/:id')
  .get(getClubById)
  .put(authorize('super_admin'), validateClub, updateClub)
  .delete(authorize('super_admin'), deleteClub);

router.post('/:id/assign-teacher', authorize('super_admin'), validateAssignTeacher, assignTeacher);

export default router;
