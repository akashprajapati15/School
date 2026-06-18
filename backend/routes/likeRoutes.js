import express from 'express';
import { toggleLike } from '../controllers/likeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/:postId', toggleLike);

export default router;
