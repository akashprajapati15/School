import Notification from '../models/Notification.js';
import { logger } from './logger.js';

/**
 * Send an in-app notification to a user
 * @param {string} userId - Target user ID
 * @param {string} title - Notification Title
 * @param {string} message - Notification Message body
 */
export const sendNotification = async (userId, title, message) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      isRead: false,
    });
    await notification.save();
    logger.debug(`Notification created for user ${userId}: ${title}`);
  } catch (error) {
    logger.error(`Failed to send notification to user ${userId}:`, error);
  }
};
