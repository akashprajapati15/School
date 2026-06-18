import User from '../models/User.js';
import Club from '../models/Club.js';
import { logActivity } from '../utils/activityLogger.js';
import { sendNotification } from '../utils/notifier.js';
import { logger } from '../utils/logger.js';

// @desc    Get all Teachers
// @route   GET /api/teachers
// @access  Private (Super Admin)
export const getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).sort({ createdAt: -1 });

    // For each teacher, find if they are managing any club
    const teachersWithClubs = await Promise.all(
      teachers.map(async (teacher) => {
        const clubs = await Club.find({ assignedTeacher: teacher._id }).select('name description');
        return {
          ...teacher.toObject(),
          managedClubs: clubs,
        };
      })
    );

    return res.json({
      success: true,
      count: teachersWithClubs.length,
      data: teachersWithClubs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Pending Teacher approval requests
// @route   GET /api/teachers/pending
// @access  Private (Super Admin)
export const getPendingTeachers = async (req, res, next) => {
  try {
    const pendingTeachers = await User.find({ role: 'teacher', accountStatus: 'pending' }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: pendingTeachers.length,
      data: pendingTeachers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject Teacher registration
// @route   PUT /api/teachers/:id/status
// @access  Private (Super Admin)
export const updateTeacherStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // status must be 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const oldStatus = teacher.accountStatus;
    teacher.accountStatus = status;
    await teacher.save();

    logger.info(`Teacher ${teacher.email} status updated to ${status}`);

    let actionLabel = 'Teacher Account Updated';
    let notifyMessage = '';

    if (status === 'approved') {
      actionLabel = oldStatus === 'pending' ? 'Approved Teacher Registration' : 'Activated Teacher Account';
      notifyMessage = 'Your teacher account has been approved. You can now log in and manage clubs.';
    } else if (status === 'rejected') {
      actionLabel = oldStatus === 'approved' ? 'Suspended Teacher Account' : 'Rejected Teacher Registration';
      notifyMessage = 'Your teacher account has been suspended or rejected. Please contact the Principal.';

      // If suspended/rejected, unassign them from any clubs they manage
      const clubs = await Club.find({ assignedTeacher: teacher._id });
      for (const club of clubs) {
        club.assignedTeacher = null;
        await club.save();
        await logActivity(`Unassigned suspended teacher "${teacher.fullName}" from Club "${club.name}"`, req.user._id, club._id);
      }
    }

    await logActivity(`${actionLabel} (${teacher.fullName})`, req.user._id, teacher._id);
    await sendNotification(teacher._id, `Account Status: ${status.toUpperCase()}`, notifyMessage);

    return res.json({
      success: true,
      message: `Teacher account status updated to ${status} successfully`,
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics for Teacher
// @route   GET /api/teachers/dashboard-stats
// @access  Private (Teacher)
export const getTeacherDashboardStats = async (req, res, next) => {
  try {
    // Find clubs assigned to this teacher
    const clubs = await Club.find({ assignedTeacher: req.user._id });
    const clubIds = clubs.map((c) => c._id);

    // Count students across these clubs
    const totalMembersCount = await ClubMember.countDocuments({ clubId: { $in: clubIds } });

    // Count posts in these clubs
    const totalPostsCount = await Post.countDocuments({ clubId: { $in: clubIds } });

    // Count pending join requests in these clubs
    const pendingRequestsCount = await JoinRequest.countDocuments({
      clubId: { $in: clubIds },
      status: 'pending',
    });

    return res.json({
      success: true,
      data: {
        totalClubs: clubs.length,
        totalMembers: totalMembersCount,
        totalPosts: totalPostsCount,
        pendingRequests: pendingRequestsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
