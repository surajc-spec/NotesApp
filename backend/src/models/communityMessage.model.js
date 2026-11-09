const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderRole: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    isAnnouncement: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for instant retrieval of class group messages
communityMessageSchema.index({
  branch: 1,
  semester: 1,
  createdAt: -1,
});

const CommunityMessage = mongoose.model('CommunityMessage', communityMessageSchema);

module.exports = CommunityMessage;
