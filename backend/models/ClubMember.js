import mongoose from 'mongoose';

const clubMemberSchema = new mongoose.Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate membership entries
clubMemberSchema.index({ clubId: 1, studentId: 1 }, { unique: true });

const ClubMember = mongoose.model('ClubMember', clubMemberSchema);

export default ClubMember;
