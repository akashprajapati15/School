import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all activity logs
// @route   GET /api/activity-logs
// @access  Private (Super Admin Only)
export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('performedBy', 'fullName email role')
      .sort({ timestamp: -1 })
      .limit(100); // Limit to latest 100 logs for display

    return res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
