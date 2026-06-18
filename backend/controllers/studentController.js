import User from '../models/User.js';
import ClubMember from '../models/ClubMember.js';
import JoinRequest from '../models/JoinRequest.js';
import Post from '../models/Post.js';
import Like from '../models/Like.js';
import Notification from '../models/Notification.js';
import { deleteFromCloudinary } from '../services/cloudinaryService.js';
import { logActivity } from '../utils/activityLogger.js';
import { logger } from '../utils/logger.js';

// @desc    Get all Students
// @route   GET /api/students
// @access  Private (Super Admin / Teacher)
export const getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });

    // Populate which clubs each student belongs to
    const studentsWithClubs = await Promise.all(
      students.map(async (student) => {
        const memberships = await ClubMember.find({ studentId: student._id })
          .populate('clubId', 'name')
          .select('clubId joinedAt');

        const clubs = memberships.map((m) => ({
          id: m.clubId?._id,
          name: m.clubId?.name,
          joinedAt: m.joinedAt,
        }));

        return {
          ...student.toObject(),
          clubs,
        };
      })
    );

    return res.json({
      success: true,
      count: studentsWithClubs.length,
      data: studentsWithClubs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a Student (Cascade delete everything)
// @route   DELETE /api/students/:id
// @access  Private (Super Admin Only)
export const removeStudent = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const studentId = student._id;

    // 1. Delete student's posts and files on Cloudinary
    const posts = await Post.find({ uploadedBy: studentId });
    for (const post of posts) {
      if (post.cloudinaryPublicId) {
        await deleteFromCloudinary(post.cloudinaryPublicId, post.fileType);
      }
    }
    await Post.deleteMany({ uploadedBy: studentId });

    // 2. Delete student's likes
    await Like.deleteMany({ userId: studentId });

    // 3. Delete student's club memberships
    await ClubMember.deleteMany({ studentId });

    // 4. Delete student's club join requests
    await JoinRequest.deleteMany({ studentId });

    // 5. Delete student's notifications
    await Notification.deleteMany({ userId: studentId });

    // 6. Delete student user account
    await User.findByIdAndDelete(studentId);

    logger.info(`Student removed: ${student.email}`);
    await logActivity(`Removed Student account: "${student.fullName}"`, req.user._id, studentId);

    return res.json({
      success: true,
      message: 'Student account and all associated memberships, posts, and requests deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
