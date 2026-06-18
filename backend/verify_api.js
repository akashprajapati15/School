import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Club from './models/Club.js';
import Post from './models/Post.js';
import Like from './models/Like.js';
import { logger } from './utils/logger.js';

dotenv.config();

const VERIFY_DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school-club-portal-verify';

const runVerification = async () => {
  logger.info('--- Starting Backend Verification Script ---');
  logger.info(`Connecting to DB: ${VERIFY_DB_URI}`);

  try {
    await mongoose.connect(VERIFY_DB_URI, { serverSelectionTimeoutMS: 3000 });
    logger.info('✔ Database Connection: SUCCESS');
  } catch (err) {
    logger.error('✘ Database Connection: FAILED', err);
    process.exit(1);
  }

  try {
    // Clean up any old verification residues
    await User.deleteMany({ email: /@verify\.test$/ });
    await Club.deleteMany({ name: /Verification Club/ });

    logger.info('\n--- Running Assertions ---');

    // 1. Check User Creation & Hashing
    const testEmail = 'teacher@verify.test';
    const testPass = 'Password123!';
    const teacher = new User({
      fullName: 'Verification Teacher',
      email: testEmail,
      password: testPass,
      role: 'teacher',
      accountStatus: 'pending',
    });

    await teacher.save();
    logger.info('✔ Assertion 1: User creation & schema saving succeeds');

    // 2. Validate Password Hashing
    const savedTeacher = await User.findOne({ email: testEmail }).select('+password');
    const isPassHashed = savedTeacher.password !== testPass && savedTeacher.password.startsWith('$2a$');
    if (isPassHashed) {
      logger.info('✔ Assertion 2: Pre-save password hashing is active');
    } else {
      logger.error('✘ Assertion 2: Password was not properly hashed!');
      throw new Error('Hashing check failed');
    }

    // 3. Match passwords
    const isMatch = await savedTeacher.matchPassword(testPass);
    const isFalseMatch = await savedTeacher.matchPassword('WrongPassword');
    if (isMatch && !isFalseMatch) {
      logger.info('✔ Assertion 3: bcrypt matchPassword validation matches correctly');
    } else {
      logger.error('✘ Assertion 3: bcrypt matching verification mismatch!');
      throw new Error('Password compare check failed');
    }

    // 4. Club Creation & References
    const club = new Club({
      name: 'Verification Club Alpha',
      description: 'Validation testing club environment',
      coverImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800',
      createdBy: savedTeacher._id,
      assignedTeacher: savedTeacher._id,
    });
    await club.save();
    logger.info('✔ Assertion 4: Club model constraints pass');

    // 5. Post Creation & Types
    const post = new Post({
      title: 'Verification Announcement',
      description: 'This is a verification post',
      fileType: 'announcement',
      clubId: club._id,
      uploadedBy: savedTeacher._id,
    });
    await post.save();
    logger.info('✔ Assertion 5: Post model assertions pass');

    // 6. Like Toggle & Compound Constraints
    const like1 = new Like({
      postId: post._id,
      userId: savedTeacher._id,
    });
    await like1.save();

    // Check compound unique index block
    try {
      const duplicateLike = new Like({
        postId: post._id,
        userId: savedTeacher._id,
      });
      await duplicateLike.save();
      logger.error('✘ Assertion 6: Allowed duplicate likes, unique compound index missing!');
      throw new Error('Composite index failure');
    } catch (e) {
      if (e.code === 11000) {
        logger.info('✔ Assertion 6: Single-like constraint compound index works as expected');
      } else {
        throw e;
      }
    }

    // Clear verification datasets
    await User.deleteMany({ email: /@verify\.test$/ });
    await Club.deleteMany({ name: /Verification Club/ });
    await Post.deleteMany({ clubId: club._id });
    await Like.deleteMany({ postId: post._id });
    logger.info('✔ Assertion 7: Cleanup collections: SUCCESS');

    logger.info('\n✔ ALL BACKEND INTEGRITY VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (error) {
    logger.error('✘ VERIFICATION FAILED:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Database disconnected. Verification run finished.');
  }
};

runVerification();
