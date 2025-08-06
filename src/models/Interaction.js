const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  teamId: {
    type: String,
    required: true,
    index: true
  },
  contactId: {
    type: String,
    required: true,
    index: true
  },
  channelId: {
    type: String,
    required: true
  },
  channelType: {
    type: String,
    enum: ['im', 'mpim', 'private_channel', 'public_channel'],
    required: true
  },
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  messageType: {
    type: String,
    enum: ['sent', 'received'],
    required: true
  },
  messageText: {
    type: String,
    maxlength: 1000
  },
  messageTimestamp: {
    type: Date,
    required: true
  },
  hasReactions: {
    type: Boolean,
    default: false
  },
  reactionCount: {
    type: Number,
    default: 0
  },
  hasThread: {
    type: Boolean,
    default: false
  },
  threadCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  metadata: {
    clientMsgId: String,
    userAgent: String,
    platform: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
interactionSchema.index({ userId: 1, contactId: 1, messageTimestamp: -1 });
interactionSchema.index({ userId: 1, teamId: 1, messageTimestamp: -1 });
interactionSchema.index({ channelId: 1, messageTimestamp: -1 });
interactionSchema.index({ messageTimestamp: -1 });

// TTL index to automatically delete old interactions (keep last 2 years)
interactionSchema.index({ messageTimestamp: 1 }, { expireAfterSeconds: 63072000 });

module.exports = mongoose.model('Interaction', interactionSchema); 