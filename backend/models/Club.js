import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide club name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Club name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide club description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop', // Default clean dashboard/club background
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Clubs can start without an assigned teacher, then assigned
    },
  },
  {
    timestamps: true,
  }
);

const Club = mongoose.model('Club', clubSchema);

export default Club;
