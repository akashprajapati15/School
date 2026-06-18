import JoinRequest from '../models/JoinRequest.js';
import ClubMember from '../models/ClubMember.js';
import Club from '../models/Club.js';
import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';
import { sendNotification } from '../utils/notifier.js';
import { logger } from '../utils/logger.js';

// @desc    Request to join a Club
// @route   POST /api/join-requests/:clubId
// @access  Private (Student Only)
export const requestToJoinClub = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const studentId = req.user._id;

    // Verify club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Verify student is not already a member
    const alreadyMember = await ClubMember.findOne({ clubId, studentId });
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this club' });
    }

    // Verify no existing pending request
    const pendingRequest = await JoinRequest.findOne({
      clubId,
      studentId,
      status: 'pending',
    });
    if (pendingRequest) {
      return res.status(400).json({ success: false, message: 'You already have a pending join request for this club' });
    }

    const joinRequest = await JoinRequest.create({
      clubId,
      studentId,
      status: 'pending',
    });

    logger.info(`Student ${req.user.email} requested to join club ${club.name}`);
    await logActivity(`Requested to join Club "${club.name}"`, studentId, joinRequest._id);

    // Notify Club Admin (Teacher) if assigned
    if (club.assignedTeacher) {
      await sendNotification(
        club.assignedTeacher,
        'New Club Join Request',
        `Student "${req.user.fullName}" has requested to join your club: "${club.name}".`
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Join request submitted successfully',
      data: joinRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending join requests (Admin/Club Admin filtered)
// @route   GET /api/join-requests
// @access  Private (Super Admin / Teacher)
export const getJoinRequests = async (req, res, next) => {
  try {
    let query = { status: 'pending' };

    // If teacher, show only requests for clubs they manage
    if (req.user.role === 'teacher') {
      const managedClubs = await Club.find({ assignedTeacher: req.user._id });
      const clubIds = managedClubs.map((club) => club._id);
      query.clubId = { $in: clubIds };
    }

    const requests = await JoinRequest.find(query)
      .populate('studentId', 'fullName email profileImage phone')
      .populate('clubId', 'name description coverImage')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject Club Join Request
// @route   PUT /api/join-requests/:id
// @access  Private (Super Admin / Teacher with dynamic checks)
export const updateJoinRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // status must be 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const joinRequest = await JoinRequest.findById(req.params.id)
      .populate('studentId', 'fullName email')
      .populate('clubId', 'name assignedTeacher');

    if (!joinRequest) {
      return res.status(404).json({ success: false, message: 'Join request not found' });
    }

    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${joinRequest.status}` });
    }

    // Role check: Super Admin or Club Admin (assigned teacher)
    if (req.user.role === 'teacher') {
      const isAssigned =
        joinRequest.clubId.assignedTeacher &&
        joinRequest.clubId.assignedTeacher.toString() === req.user._id.toString();

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not the Club Admin of this club',
        });
      }
    }

    joinRequest.status = status;
    await joinRequest.save();

    logger.info(`Join request ${joinRequest._id} status updated to ${status}`);

    if (status === 'approved') {
      // Add to Club Members
      try {
        await ClubMember.create({
          clubId: joinRequest.clubId._id,
          studentId: joinRequest.studentId._id,
        });
      } catch (err) {
        // Handle race conditions (e.g., student double joined somehow)
        if (err.code !== 11000) {
          throw err;
        }
      }

      await sendNotification(
        joinRequest.studentId._id,
        'Club Request Approved!',
        `Congratulations! Your request to join the club "${joinRequest.clubId.name}" has been approved.`
      );

      await logActivity(
        `Approved join request for Student "${joinRequest.studentId.fullName}" to Club "${joinRequest.clubId.name}"`,
        req.user._id,
        joinRequest.clubId._id
      );
    } else {
      await sendNotification(
        joinRequest.studentId._id,
        'Club Request Declined',
        `Your request to join the club "${joinRequest.clubId.name}" was declined.`
      );

      await logActivity(
        `Declined join request for Student "${joinRequest.studentId.fullName}" to Club "${joinRequest.clubId.name}"`,
        req.user._id,
        joinRequest.clubId._id
      );
    }

    return res.json({
      success: true,
      message: `Join request successfully ${status}`,
      data: joinRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from a Club
// @route   DELETE /api/join-requests/club/:clubId/student/:studentId
// @access  Private (Super Admin / Club Admin)
export const removeClubMember = async (req, res, next) => {
  try {
    const { clubId, studentId } = req.params;

    // Check permissions
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (req.user.role === 'teacher') {
      const isAssigned = club.assignedTeacher && club.assignedTeacher.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'You are not the Admin of this club' });
      }
    }

    const membership = await ClubMember.findOne({ clubId, studentId });
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Student is not a member of this club' });
    }

    await ClubMember.findByIdAndDelete(membership._id);

    // Update join request status back to rejected or remove so student can request again
    await JoinRequest.deleteMany({ clubId, studentId });

    const student = await User.findById(studentId);
    const studentName = student ? student.fullName : 'Student';

    logger.info(`Student ${studentId} removed from club ${clubId}`);
    await logActivity(`Removed student "${studentName}" from Club "${club.name}"`, req.user._id, clubId);

    if (student) {
      await sendNotification(
        studentId,
        'Removed from Club',
        `You have been removed from the club: "${club.name}" by the Club Admin.`
      );
    }

    return res.json({
      success: true,
      message: 'Student removed from club membership successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get members of a specific club
// @route   GET /api/join-requests/club/:clubId/members
// @access  Private (All authenticated)
export const getClubMembers = async (req, res, next) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const members = await ClubMember.find({ clubId })
      .populate('studentId', 'fullName email profileImage phone')
      .sort({ joinedAt: -1 });

    return res.json({
      success: true,
      count: members.length,
      data: members.map((m) => m.studentId), // Return student user details directly
    });
  } catch (error) {
    next(error);
  }
};
