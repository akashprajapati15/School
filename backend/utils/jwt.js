import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 * @param {string} id - User ID
 * @returns {string} Signed JWT token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};
