import Club from '../models/Club.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import JoinRequest from '../models/JoinRequest.js';
import ClubMember from '../models/ClubMember.js';
import Notification from '../models/Notification.js';

// @desc    Get dashboard metrics based on user role
// @route   GET /api/dashboard/stats
// @access  Private (All)
export const getDashboardStats = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;

    if (role === 'super_admin') {
      const totalClubs = await Club.countDocuments();
      const totalTeachers = await User.countDocuments({ role: 'teacher' });
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalPosts = await Post.countDocuments();

      const pendingTeachers = await User.countDocuments({
        role: 'teacher',
        accountStatus: 'pending',
      });
      const pendingJoinRequests = await JoinRequest.countDocuments({
        status: 'pending',
      });

      return res.json({
        success: true,
        data: {
          totalClubs,
          totalTeachers,
          totalStudents,
          totalPosts,
          pendingTeachers,
          pendingJoinRequests,
        },
      });
    }

    if (role === 'teacher') {
      // Find clubs where this teacher is assigned
      const managedClubs = await Club.find({ assignedTeacher: userId });
      const clubIds = managedClubs.map((c) => c._id);

      const totalClubs = managedClubs.length;
      const totalMembers = await ClubMember.countDocuments({ clubId: { $in: clubIds } });
      const totalPosts = await Post.countDocuments({ clubId: { $in: clubIds } });
      const pendingRequests = await JoinRequest.countDocuments({
        clubId: { $in: clubIds },
        status: 'pending',
      });

      return res.json({
        success: true,
        data: {
          totalClubs,
          totalMembers,
          totalPosts,
          pendingRequests,
        },
      });
    }

    if (role === 'student') {
      const totalClubs = await Club.countDocuments();
      const joinedClubs = await ClubMember.countDocuments({ studentId: userId });
      const myPosts = await Post.countDocuments({ uploadedBy: userId });
      const unreadNotifications = await Notification.countDocuments({
        userId,
        isRead: false,
      });

      return res.json({
        success: true,
        data: {
          totalClubs,
          joinedClubs,
          myPosts,
          unreadNotifications,
        },
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid user role' });
  } catch (error) {
    next(error);
  }
};
