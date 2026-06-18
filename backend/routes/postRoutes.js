import express from 'express';
import { createPost, getClubPosts, getAllPosts, deletePost } from '../controllers/postController.js';
import { protect, authorize, isClubMemberOrAdmin } from '../middleware/auth.js';
import { upload, validateFileSize } from '../middleware/upload.js';
import { validatePost } from '../validations/schemas.js';

const router = express.Router();

router.use(protect); // Require login for all post actions

// Get all posts (Super Admin Audit view)
router.get('/', authorize('super_admin'), getAllPosts);

// Create and get club posts
router.post(
  '/:clubId',
  isClubMemberOrAdmin,
  upload.single('file'),
  validateFileSize,
  validatePost,
  createPost
);

router.get('/club/:clubId', isClubMemberOrAdmin, getClubPosts);

// Delete post (verifies ownership inside controller)
router.delete('/:id', deletePost);

export default router;
