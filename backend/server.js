import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
// import dotenv from 'dotenv';

// Config & Utils
import connectDB from './config/db.js';
import { seedSuperAdmin } from './utils/seed.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import joinRequestRoutes from './routes/joinRequestRoutes.js';
import postRoutes from './routes/postRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Load environment variables
// dotenv.config();

// Connect to Database
connectDB().then(() => {
  // Seed Super Admin on success
  seedSuperAdmin();
});

const app = express();

// Security Middlewares
app.use(helmet()); // Secure HTTP headers

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting (Prevent abuse / DDoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
  },
});
app.use('/api/', apiLimiter);

// Request parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger middleware
app.use(morgan('dev'));

// API Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'School Club Management Portal API is running successfully.',
    version: '1.0.0',
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`, err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
