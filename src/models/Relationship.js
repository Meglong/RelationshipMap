const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
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
  relationshipType: {
    type: String,
    enum: ['team_member', 'direct_report', 'manager', 'colleague', 'mentor', 'mentee', 'friend', 'custom'],
    default: 'colleague'
  },
  customRelationshipType: {
    type: String,
    maxlength: 50
  },
  addedVia: {
    type: String,
    enum: ['manual', 'team_import', 'direct_reports', 'recent_dms', 'channel_members'],
    required: true
  },
  sourceChannel: {
    type: String,
    description: 'Channel ID if added via channel import'
  },
  lastInteraction: {
    type: Date,
    description: 'Last DM interaction date'
  },
  interactionCount: {
    type: Number,
    default: 0,
    description: 'Number of DM interactions'
  },
  sharedChannels: [{
    channelId: String,
    channelName: String,
    isPrivate: Boolean
  }],
  sharedInterests: [String],
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    addedAt: {
      type: Date,
      default: Date.now
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
relationshipSchema.index({ userId: 1, teamId: 1 });
relationshipSchema.index({ userId: 1, relationshipType: 1 });
relationshipSchema.index({ userId: 1, isActive: 1 });
relationshipSchema.index({ contactId: 1, teamId: 1 });

// Ensure unique relationships per user-contact pair
relationshipSchema.index({ userId: 1, contactId: 1 }, { unique: true });

module.exports = mongoose.model('Relationship', relationshipSchema); 