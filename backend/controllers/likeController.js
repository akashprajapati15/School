import Like from '../models/Like.js';
import Post from '../models/Post.js';
import { sendNotification } from '../utils/notifier.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Toggle Like on a Post
// @route   POST /api/likes/:postId
// @access  Private (All Roles - must have access to the post's club)
export const toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user has already liked this post
    const existingLike = await Like.findOne({ postId, userId });

    let liked = false;

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      liked = false;
    } else {
      // Like
      await Like.create({ postId, userId });
      liked = true;

      // Notify the post owner if it's not the same user
      if (post.uploadedBy.toString() !== userId.toString()) {
        await sendNotification(
          post.uploadedBy,
          'Your post got a like!',
          `"${req.user.fullName}" liked your post: "${post.title}".`
        );
      }
    }

    const likeCount = await Like.countDocuments({ postId });

    return res.json({
      success: true,
      data: {
        liked,
        likeCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
