import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI;
  if (!connUri) {
    logger.error('MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  let retries = 5;
  while (retries > 0) {
    try {
      logger.info('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(connUri, options);
      logger.info(`MongoDB Connected successfully to host: ${conn.connection.host}`);
      break;
    } catch (error) {
      retries -= 1;
      logger.error(`Database connection failed. Retries remaining: ${retries}`, error);
      if (retries === 0) {
        logger.error('Could not connect to MongoDB. Exiting application...');
        process.exit(1);
      }
      // Wait for 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection disconnected! Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection runtime error:', err);
});

export default connectDB;
