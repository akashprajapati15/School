import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin'));

router.get('/', getActivityLogs);

export default router;
