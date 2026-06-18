import multer from 'multer';
import path from 'path';

// Store files in memory buffer before uploading to Cloudinary
const storage = multer.memoryStorage();

// File type and format validator
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error(`Unsupported file type '${ext}'. Allowed formats: jpg, jpeg, png, webp, mp4, pdf`),
      false
    );
  }
  cb(null, true);
};

// General limit configured to absolute maximum (25MB for video)
// Detailed file-type specific size limits checked inside controllers/middlewares
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
  },
});

// Helper validation middleware to verify file size constraints based on file types
export const validateFileSize = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const { mimetype, size } = req.file;

  // Image validation (max 5 MB)
  if (mimetype.startsWith('image/')) {
    if (size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image size exceeds the limit of 5 MB',
      });
    }
  } 
  // Video validation (max 25 MB)
  else if (mimetype.startsWith('video/')) {
    if (size > 25 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Video size exceeds the limit of 25 MB',
      });
    }
  } 
  // PDF validation (max 10 MB)
  else if (mimetype === 'application/pdf') {
    if (size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'PDF size exceeds the limit of 10 MB',
      });
    }
  } 
  else {
    return res.status(400).json({
      success: false,
      message: 'Invalid file format uploaded',
    });
  }

  next();
};
