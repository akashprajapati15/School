import Joi from 'joi';

// Helper validator utility
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({ success: false, message: messages });
    }
    next();
  };
};

// Joi schemas
const teacherRegisterSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name cannot exceed 50 characters',
    'any.required': 'Full name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid emailAddress address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow('').messages({
    'string.pattern.base': 'Please provide a valid international phone number',
  }),
});

const studentRegisterSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name cannot exceed 50 characters',
    'any.required': 'Full name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid emailAddress address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow('').messages({
    'string.pattern.base': 'Please provide a valid international phone number',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid emailAddress address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const clubSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Club name must be at least 3 characters',
    'string.max': 'Club name cannot exceed 100 characters',
    'any.required': 'Club name is required',
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Club description must be at least 10 characters',
    'string.max': 'Club description cannot exceed 1000 characters',
    'any.required': 'Club description is required',
  }),
  coverImage: Joi.string().uri().allow('').messages({
    'string.uri': 'Cover image must be a valid URL',
  }),
});

const assignTeacherSchema = Joi.object({
  teacherId: Joi.string().hex().length(24).required().messages({
    'string.length': 'Teacher ID must be a valid 24-character hex string',
    'any.required': 'Teacher ID is required',
  }),
});

const postSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().min(5).max(2000).required().messages({
    'string.min': 'Description must be at least 5 characters',
    'string.max': 'Description cannot exceed 2000 characters',
    'any.required': 'Description is required',
  }),
  fileType: Joi.string().valid('image', 'video', 'pdf', 'announcement').required().messages({
    'any.only': 'File type must be one of: image, video, pdf, announcement',
    'any.required': 'File type is required',
  }),
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Full name must be at least 2 characters',
    'any.required': 'Full name is required',
  }),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow('').messages({
    'string.pattern.base': 'Please provide a valid international phone number',
  }),
  password: Joi.string().min(6).allow('').messages({
    'string.min': 'Password must be at least 6 characters long',
  }),
  profileImage: Joi.string().uri().allow(''),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected', 'pending').required().messages({
    'any.only': 'Status must be approved, rejected or pending',
    'any.required': 'Status is required',
  }),
});

export const validateTeacherRegister = validateRequest(teacherRegisterSchema);
export const validateStudentRegister = validateRequest(studentRegisterSchema);
export const validateLogin = validateRequest(loginSchema);
export const validateClub = validateRequest(clubSchema);
export const validateAssignTeacher = validateRequest(assignTeacherSchema);
export const validatePost = validateRequest(postSchema);
export const validateUpdateProfile = validateRequest(updateProfileSchema);
export const validateUpdateStatus = validateRequest(updateStatusSchema);
