import User from '../models/User.js';
import { logger } from './logger.js';

export const seedSuperAdmin = async () => {
  try {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@school.edu';
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'AdminPass123!';

    // Check if any super_admin exists
    const adminExists = await User.findOne({ role: 'super_admin' });

    if (!adminExists) {
      logger.info('No Super Admin found in the database. Seeding a default Super Admin account...');

      const defaultAdmin = new User({
        fullName: 'Super Admin Principal',
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin',
        accountStatus: 'approved',
        phone: '1234567890',
        profileImage: 'https://res.cloudinary.com/diqqf3eq2/image/upload/v1586883334/person-1_rfzshl.jpg',
      });

      await defaultAdmin.save();
      logger.info(`Super Admin account successfully seeded with email: ${adminEmail}`);
    } else {
      logger.info(`Super Admin account found: ${adminExists.email}. Skipping seed.`);
    }
  } catch (error) {
    logger.error('Error seeding Super Admin account:', error);
  }
};
