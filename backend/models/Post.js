import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide post title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide post description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    fileType: {
      type: String,
      enum: ['image', 'video', 'pdf', 'announcement'],
      required: true,
    },
    fileUrl: {
      type: String,
      default: '', // Optional for pure announcements, required for others
    },
    cloudinaryPublicId: {
      type: String,
      default: '', // Optional for pure announcements, required for others
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
