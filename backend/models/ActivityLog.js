import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index to query by performedBy and action timestamp
activityLogSchema.index({ performedBy: 1, timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
