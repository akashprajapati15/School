import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger.js';

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

// Configure Cloudinary only if variables are set
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info('Cloudinary SDK configured successfully.');
} else {
  logger.warn('Cloudinary environment credentials missing. File uploads will fail.');
}

export default cloudinary;
