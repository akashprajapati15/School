import Club from '../models/Club.js';
import ClubMember from '../models/ClubMember.js';
import JoinRequest from '../models/JoinRequest.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { deleteFromCloudinary } from '../services/cloudinaryService.js';
import { logActivity } from '../utils/activityLogger.js';
import { sendNotification } from '../utils/notifier.js';
import { logger } from '../utils/logger.js';

// @desc    Create a new Club
// @route   POST /api/clubs
// @access  Private (Super Admin)
export const createClub = async (req, res, next) => {
  try {
    const { name, description, coverImage, assignedTeacher } = req.body;

    const clubExists = await Club.findOne({ name });
    if (clubExists) {
      return res.status(400).json({ success: false, message: 'Club with this name already exists' });
    }

    // If teacher is assigned, check if teacher exists and is approved
    if (assignedTeacher) {
      const teacher = await User.findOne({ _id: assignedTeacher, role: 'teacher' });
      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Teacher not found' });
      }
      if (teacher.accountStatus !== 'approved') {
        return res.status(400).json({ success: false, message: 'Assigned teacher account is not approved' });
      }
    }

    const club = await Club.create({
      name,
      description,
      coverImage: coverImage || undefined,
      assignedTeacher: assignedTeacher || null,
      createdBy: req.user._id,
    });

    logger.info(`Club created: ${club.name}`);
    await logActivity(`Created Club "${club.name}"`, req.user._id, club._id);

    // Notify assigned teacher
    if (assignedTeacher) {
      await sendNotification(
        assignedTeacher,
        'Assigned as Club Admin',
        `You have been assigned as the Club Admin for the new club: "${club.name}".`
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Club created successfully',
      data: club,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Clubs
// @route   GET /api/clubs
// @access  Private (All roles)
export const getAllClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find()
      .populate('assignedTeacher', 'fullName email profileImage phone')
      .populate('createdBy', 'fullName email');

    return res.json({
      success: true,
      count: clubs.length,
      data: clubs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Club by ID
// @route   GET /api/clubs/:id
// @access  Private (All roles)
export const getClubById = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('assignedTeacher', 'fullName email profileImage phone')
      .populate('createdBy', 'fullName email');

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Check if the current student is a member of the club
    let isMember = false;
    let hasPendingRequest = false;

    if (req.user.role === 'student') {
      const membership = await ClubMember.findOne({ clubId: club._id, studentId: req.user._id });
      isMember = !!membership;

      const pendingRequest = await JoinRequest.findOne({
        clubId: club._id,
        studentId: req.user._id,
        status: 'pending',
      });
      hasPendingRequest = !!pendingRequest;
    }

    return res.json({
      success: true,
      data: {
        ...club.toObject(),
        isMember,
        hasPendingRequest,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a Club
// @route   PUT /api/clubs/:id
// @access  Private (Super Admin)
export const updateClub = async (req, res, next) => {
  try {
    const { name, description, coverImage, assignedTeacher } = req.body;

    let club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Check name uniqueness if changed
    if (name && name !== club.name) {
      const nameExists = await Club.findOne({ name });
      if (nameExists) {
        return res.status(400).json({ success: false, message: 'Club with this name already exists' });
      }
    }

    const previousTeacher = club.assignedTeacher;

    // Verify teacher if assigning
    if (assignedTeacher && (!previousTeacher || previousTeacher.toString() !== assignedTeacher)) {
      const teacher = await User.findOne({ _id: assignedTeacher, role: 'teacher' });
      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Teacher not found' });
      }
      if (teacher.accountStatus !== 'approved') {
        return res.status(400).json({ success: false, message: 'Teacher account is not approved' });
      }
    }

    club.name = name || club.name;
    club.description = description || club.description;
    club.coverImage = coverImage || club.coverImage;
    club.assignedTeacher = assignedTeacher !== undefined ? assignedTeacher : club.assignedTeacher;

    await club.save();

    logger.info(`Club updated: ${club.name}`);
    await logActivity(`Updated Club details for "${club.name}"`, req.user._id, club._id);

    // Notify assigned teachers
    if (assignedTeacher && (!previousTeacher || previousTeacher.toString() !== assignedTeacher)) {
      if (previousTeacher) {
        await sendNotification(
          previousTeacher,
          'Removed as Club Admin',
          `You have been removed as Club Admin for: "${club.name}".`
        );
      }
      await sendNotification(
        assignedTeacher,
        'Assigned as Club Admin',
        `You have been assigned as the Club Admin for: "${club.name}".`
      );
    }

    return res.json({
      success: true,
      message: 'Club updated successfully',
      data: club,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign a Teacher to a Club
// @route   POST /api/clubs/:id/assign-teacher
// @access  Private (Super Admin)
export const assignTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.body;

    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (teacher.accountStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Teacher is not approved by Super Admin' });
    }

    const previousTeacher = club.assignedTeacher;
    club.assignedTeacher = teacherId;
    await club.save();

    logger.info(`Teacher ${teacher.email} assigned to club ${club.name}`);
    await logActivity(`Assigned teacher "${teacher.fullName}" as Admin for "${club.name}"`, req.user._id, club._id);

    // Notify previous teacher
    if (previousTeacher && previousTeacher.toString() !== teacherId) {
      await sendNotification(
        previousTeacher,
        'Removed as Club Admin',
        `You have been removed as Club Admin for: "${club.name}".`
      );
    }

    // Notify new teacher
    await sendNotification(
      teacherId,
      'Assigned as Club Admin',
      `You have been assigned as Club Admin for club: "${club.name}".`
    );

    return res.json({
      success: true,
      message: 'Teacher assigned successfully',
      data: club,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Club (Cascade delete posts, members, join requests)
// @route   DELETE /api/clubs/:id
// @access  Private (Super Admin)
export const deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Delete all posts files from Cloudinary
    const posts = await Post.find({ clubId: club._id });
    for (const post of posts) {
      if (post.cloudinaryPublicId) {
        await deleteFromCloudinary(post.cloudinaryPublicId, post.fileType);
      }
    }

    // Delete posts
    await Post.deleteMany({ clubId: club._id });

    // Delete memberships
    await ClubMember.deleteMany({ clubId: club._id });

    // Delete join requests
    await JoinRequest.deleteMany({ clubId: club._id });

    // Delete the club itself
    await Club.findByIdAndDelete(club._id);

    logger.info(`Club deleted: ${club.name}`);
    await logActivity(`Deleted Club "${club.name}"`, req.user._id, club._id);

    if (club.assignedTeacher) {
      await sendNotification(
        club.assignedTeacher,
        'Club Deleted',
        `The club "${club.name}" that you managed has been deleted by Super Admin.`
      );
    }

    return res.json({
      success: true,
      message: 'Club and all associated posts, members, and requests deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
