const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  slackUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  slackTeamId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  realName: {
    type: String,
    required: true
  },
  profile: {
    title: String,
    department: String,
    interests: [String],
    status: String,
    statusEmoji: String,
    statusText: String,
    phone: String,
    skype: String
  },
  avatar: {
    type: String
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isOwner: {
    type: Boolean,
    default: false
  },
  isBot: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  timezone: String,
  locale: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ slackTeamId: 1, displayName: 1 });
userSchema.index({ slackTeamId: 1, 'profile.department': 1 });

module.exports = mongoose.model('User', userSchema); 