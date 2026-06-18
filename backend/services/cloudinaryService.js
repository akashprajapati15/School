import cloudinary from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';

/**
 * Uploads a file buffer directly to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileType - image, video, or pdf
 * @returns {Promise<object>} Cloudinary upload response object
 */
export const uploadToCloudinary = (fileBuffer, fileType) => {
  return new Promise((resolve, reject) => {
    // If Cloudinary is not configured, reject with descriptive message
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return reject(new Error('Cloudinary environment credentials not set. Upload disabled.'));
    }

    let resourceType = 'auto';
    if (fileType === 'pdf') {
      resourceType = 'raw'; // PDF works best as raw resource type for downloads/viewing
    } else if (fileType === 'video') {
      resourceType = 'video';
    } else if (fileType === 'image') {
      resourceType = 'image';
    }

    const uploadOptions = {
      folder: `school_club_portal/${fileType}s`,
      resource_type: resourceType,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload failed for ${fileType}:`, error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // End stream by writing buffer
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an asset from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} fileType - image, video, or pdf
 * @returns {Promise<object>} Cloudinary destroy response object
 */
export const deleteFromCloudinary = async (publicId, fileType) => {
  try {
    if (!publicId) return null;

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      logger.warn('Cloudinary not configured. Skipping remote deletion.');
      return null;
    }

    let resourceType = 'image';
    if (fileType === 'pdf') {
      resourceType = 'raw';
    } else if (fileType === 'video') {
      resourceType = 'video';
    }

    logger.info(`Deleting asset from Cloudinary: ${publicId} (${fileType})`);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    logger.error(`Failed to delete asset from Cloudinary: ${publicId}`, error);
    throw error;
  }
};
