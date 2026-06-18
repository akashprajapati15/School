import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending requests for same user to same club
joinRequestSchema.index({ studentId: 1, clubId: 1, status: 1 });

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

export default JoinRequest;
