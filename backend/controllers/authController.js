import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { logActivity } from '../utils/activityLogger.js';
import { logger } from '../utils/logger.js';

// @desc    Register a new Teacher
// @route   POST /api/auth/register-teacher
// @access  Public
export const registerTeacher = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    const teacher = await User.create({
      fullName,
      email,
      password,
      phone,
      role: 'teacher',
      accountStatus: 'pending', // Awaiting Super Admin approval
    });

    logger.info(`Teacher registered: ${email}`);
    await logActivity('Teacher Registered (Pending Approval)', teacher._id, teacher._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is pending Super Admin approval.',
      data: {
        id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        role: teacher.role,
        accountStatus: teacher.accountStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new Student
// @route   POST /api/auth/register-student
// @access  Public
export const registerStudent = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    const student = await User.create({
      fullName,
      email,
      password,
      phone,
      role: 'student',
      accountStatus: 'approved', // Active immediately
    });

    const token = generateToken(student._id);

    logger.info(`Student registered: ${email}`);
    await logActivity('Student Registered (Auto-Approved)', student._id, student._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      data: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        accountStatus: student.accountStatus,
        profileImage: student.profileImage,
        phone: student.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    User Login
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists (explicitly select password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check accountStatus
    if (user.accountStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.accountStatus}. Please contact the school Principal.`,
      });
    }

    const token = generateToken(user._id);

    logger.info(`User logged in: ${email}`);
    await logActivity('User Logged In', user._id, user._id);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        profileImage: user.profileImage,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    // req.user is already populated by the protect middleware
    return res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { fullName, phone, password, profileImage } = req.body;

    user.fullName = fullName || user.fullName;
    user.phone = phone !== undefined ? phone : user.phone;
    user.profileImage = profileImage || user.profileImage;

    if (password) {
      user.password = password;
    }

    await user.save();

    // Remove password field for response
    user.password = undefined;

    logger.info(`User profile updated: ${user.email}`);
    await logActivity('Updated Profile Settings', user._id, user._id);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    User Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    await logActivity('User Logged Out', req.user._id, req.user._id);

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
