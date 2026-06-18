import Post from '../models/Post.js';
import Club from '../models/Club.js';
import ClubMember from '../models/ClubMember.js';
import Like from '../models/Like.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import { logActivity } from '../utils/activityLogger.js';
import { sendNotification } from '../utils/notifier.js';
import { logger } from '../utils/logger.js';

// @desc    Create a new Post in a Club
// @route   POST /api/posts/:clubId
// @access  Private (Super Admin, Club Admin, Student Member)
export const createPost = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { title, description, fileType } = req.body;
    const userId = req.user._id;

    // Check if club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    let fileUrl = '';
    let cloudinaryPublicId = '';

    // Handle file upload if present and fileType is not 'announcement'
    if (fileType !== 'announcement') {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: `File upload is required for post type '${fileType}'`,
        });
      }

      // Verify file matches expectations
      const mimetype = req.file.mimetype;
      if (fileType === 'image' && !mimetype.startsWith('image/')) {
        return res.status(400).json({ success: false, message: 'File is not a valid image' });
      }
      if (fileType === 'video' && !mimetype.startsWith('video/')) {
        return res.status(400).json({ success: false, message: 'File is not a valid video' });
      }
      if (fileType === 'pdf' && mimetype !== 'application/pdf') {
        return res.status(400).json({ success: false, message: 'File is not a valid PDF' });
      }

      try {
        logger.info(`Uploading post file to Cloudinary (${fileType})...`);
        const result = await uploadToCloudinary(req.file.buffer, fileType);
        fileUrl = result.secure_url;
        cloudinaryPublicId = result.public_id;
        logger.info(`Cloudinary upload complete: ${fileUrl}`);
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: `Failed to upload file to Cloudinary: ${err.message || (typeof err === 'object' ? JSON.stringify(err) : err)}`,
        });
      }
    }

    const post = await Post.create({
      title,
      description,
      fileType,
      fileUrl,
      cloudinaryPublicId,
      clubId,
      uploadedBy: userId,
    });

    logger.info(`Post created in club ${club.name}: ${post.title}`);
    await logActivity(`Created Post "${post.title}" (${fileType}) in Club "${club.name}"`, userId, post._id);

    // Notify club members about the new post
    const members = await ClubMember.find({ clubId }).select('studentId');
    for (const member of members) {
      if (member.studentId.toString() !== userId.toString()) {
        await sendNotification(
          member.studentId,
          `New Post in ${club.name}`,
          `"${req.user.fullName}" uploaded a new ${fileType}: "${post.title}"`
        );
      }
    }

    // Populate user info for response
    const populatedPost = await Post.findById(post._id)
      .populate('uploadedBy', 'fullName email profileImage role')
      .populate('clubId', 'name');

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts in a Club
// @route   GET /api/posts/club/:clubId
// @access  Private (Super Admin, Club Admin, Student Member)
export const getClubPosts = async (req, res, next) => {
  try {
    const { clubId } = req.params;

    const posts = await Post.find({ clubId })
      .populate('uploadedBy', 'fullName email profileImage role')
      .populate('clubId', 'name')
      .sort({ createdAt: -1 });

    // Append like count and whether the user liked it
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Like.countDocuments({ postId: post._id });
        const userLiked = await Like.findOne({ postId: post._id, userId: req.user._id });
        return {
          ...post.toObject(),
          likeCount,
          likedByUser: !!userLiked,
        };
      })
    );

    return res.json({
      success: true,
      count: postsWithLikes.length,
      data: postsWithLikes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts across all clubs (Admin View)
// @route   GET /api/posts
// @access  Private (Super Admin Only)
export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('uploadedBy', 'fullName email profileImage role')
      .populate('clubId', 'name')
      .sort({ createdAt: -1 });

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Like.countDocuments({ postId: post._id });
        const userLiked = await Like.findOne({ postId: post._id, userId: req.user._id });
        return {
          ...post.toObject(),
          likeCount,
          likedByUser: !!userLiked,
        };
      })
    );

    return res.json({
      success: true,
      count: postsWithLikes.length,
      data: postsWithLikes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Post (Autodeletes file from Cloudinary and deletes Likes)
// @route   DELETE /api/posts/:id
// @access  Private (Super Admin, Club Admin, Post Owner)
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('clubId');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isOwner = post.uploadedBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'super_admin';

    let isClubAdmin = false;
    if (req.user.role === 'teacher') {
      const club = await Club.findById(post.clubId);
      isClubAdmin = club && club.assignedTeacher && club.assignedTeacher.toString() === req.user._id.toString();
    }

    // Authorization check
    if (!isOwner && !isSuperAdmin && !isClubAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to delete this post',
      });
    }

    // Delete file from Cloudinary if it exists
    if (post.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(post.cloudinaryPublicId, post.fileType);
      } catch (err) {
        logger.error(`Cloudinary deletion error during post delete: ${err.message}`);
      }
    }

    // Delete associated Likes
    await Like.deleteMany({ postId: post._id });

    // Delete the Post
    await Post.findByIdAndDelete(post._id);

    logger.info(`Post deleted: ${post.title}`);
    await logActivity(`Deleted Post "${post.title}"`, req.user._id, post._id);

    return res.json({
      success: true,
      message: 'Post and associated media assets deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
