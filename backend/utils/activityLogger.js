import ActivityLog from '../models/ActivityLog.js';
import { logger } from './logger.js';

/**
 * Log an administrative or user activity to the database
 * @param {string} action - Action description (e.g. 'Approved Teacher Request')
 * @param {string} performedBy - User ID who did the action
 * @param {string} [targetId] - ID of the target resource (user, club, post)
 */
export const logActivity = async (action, performedBy, targetId = null) => {
  try {
    const activity = new ActivityLog({
      action,
      performedBy,
      targetId,
    });
    await activity.save();
    logger.debug(`Activity logged: ${action} by ${performedBy}`);
  } catch (error) {
    logger.error('Failed to log activity to database:', error);
  }
};
