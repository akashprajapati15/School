import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Club from '../models/Club.js';
import ClubMember from '../models/ClubMember.js';
import { logger } from '../utils/logger.js';

// Protect routes - JWT verification
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      // Check account status
      if (req.user.accountStatus !== 'approved') {
        return res.status(403).json({
          success: false,
          message: `Your account is ${req.user.accountStatus}. Please contact the Super Admin.`,
        });
      }

      next();
    } catch (error) {
      logger.error('JWT authentication error:', error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user is the Club Admin (assigned teacher) or Super Admin for a specific club
export const isClubAdminOrSuperAdmin = async (req, res, next) => {
  try {
    const clubId = req.params.clubId || req.body.clubId;

    if (!clubId) {
      return res.status(400).json({ success: false, message: 'Club ID is required' });
    }

    // Super Admins bypass this check
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Teachers must be the assigned teacher for this club
    if (req.user.role === 'teacher') {
      const club = await Club.findById(clubId);
      if (!club) {
        return res.status(404).json({ success: false, message: 'Club not found' });
      }

      if (club.assignedTeacher && club.assignedTeacher.toString() === req.user._id.toString()) {
        req.club = club; // Attach club to request
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: You must be the Club Admin of this club or a Super Admin',
    });
  } catch (error) {
    logger.error('Club Admin middleware error:', error);
    return res.status(500).json({ success: false, message: 'Server error in auth authorization' });
  }
};

// Check if user is a member of the club, or Club Admin, or Super Admin
export const isClubMemberOrAdmin = async (req, res, next) => {
  try {
    const clubId = req.params.clubId || req.body.clubId;

    if (!clubId) {
      return res.status(400).json({ success: false, message: 'Club ID is required' });
    }

    // Super Admin is allowed
    if (req.user.role === 'super_admin') {
      return next();
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Club Admin (assigned teacher) is allowed
    if (
      req.user.role === 'teacher' &&
      club.assignedTeacher &&
      club.assignedTeacher.toString() === req.user._id.toString()
    ) {
      return next();
    }

    // Students must be members of the club
    if (req.user.role === 'student') {
      const membership = await ClubMember.findOne({ clubId, studentId: req.user._id });
      if (membership) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: You must be a member or admin of this club to perform this action',
    });
  } catch (error) {
    logger.error('Club Membership middleware error:', error);
    return res.status(500).json({ success: false, message: 'Server error in membership check' });
  }
};
