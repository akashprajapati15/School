import express from 'express';
import {
  requestToJoinClub,
  getJoinRequests,
  updateJoinRequestStatus,
  removeClubMember,
  getClubMembers,
} from '../controllers/joinRequestController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateUpdateStatus } from '../validations/schemas.js';

const router = express.Router();

router.use(protect);

// Student membership requests
router.post('/:clubId', authorize('student'), requestToJoinClub);

// Admin / Teacher listings and management
router.get('/', authorize('super_admin', 'teacher'), getJoinRequests);
router.put('/:id', authorize('super_admin', 'teacher'), validateUpdateStatus, updateJoinRequestStatus);

// Roster operations
router.get('/club/:clubId/members', getClubMembers);
router.delete(
  '/club/:clubId/student/:studentId',
  authorize('super_admin', 'teacher'),
  removeClubMember
);

export default router;
