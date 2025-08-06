const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Interaction = require('../models/Interaction');

const router = express.Router();

// Search users
router.get('/users/search', async (req, res) => {
  try {
    const { userId, teamId } = req.user;
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    // Search in database first
    const users = await User.find({
      slackTeamId: teamId,
      isDeleted: false,
      $or: [
        { displayName: { $regex: query, $options: 'i' } },
        { realName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { 'profile.title': { $regex: query, $options: 'i' } },
        { 'profile.department': { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

    res.json(users.map(user => ({
      slackUserId: user.slackUserId,
      displayName: user.displayName,
      realName: user.realName,
      email: user.email,
      profile: user.profile,
      avatar: user.avatar
    })));
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get channels
router.get('/channels', async (req, res) => {
  try {
    const { userId } = req.user;

    // This would require Slack API calls to get user's channels
    // For now, return mock data - implement based on available Slack API scopes
    const channels = [
      { id: 'C1234567890', name: 'general', isPrivate: false },
      { id: 'C1234567891', name: 'random', isPrivate: false },
      { id: 'C1234567892', name: 'team-engineering', isPrivate: false }
    ];

    res.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: 'Failed to get channels' });
  }
});

// Sync user data from Slack
router.post('/sync-user', async (req, res) => {
  try {
    const { userId, teamId } = req.user;

    // Get user info from Slack API
    const userInfo = await getSlackUserInfo(userId);

    if (!userInfo) {
      return res.status(404).json({ error: 'User not found in Slack' });
    }

    // Update or create user in database
    let user = await User.findOne({ slackUserId: userId });
    
    if (!user) {
      user = new User({
        slackUserId: userId,
        slackTeamId: teamId,
        email: userInfo.profile.email,
        displayName: userInfo.profile.display_name || userInfo.name,
        realName: userInfo.profile.real_name || userInfo.name,
        profile: {
          title: userInfo.profile.title,
          department: userInfo.profile.fields?.Xf0DMHFDQA?.value || '',
          interests: userInfo.profile.fields?.Xf0DMHFDQA?.value?.split(',').map(i => i.trim()) || [],
          status: userInfo.profile.status_text,
          statusEmoji: userInfo.profile.status_emoji,
          phone: userInfo.profile.phone,
          skype: userInfo.profile.skype
        },
        avatar: userInfo.profile.image_192,
        isAdmin: userInfo.is_admin,
        isOwner: userInfo.is_owner,
        isBot: userInfo.is_bot,
        timezone: userInfo.tz,
        locale: userInfo.locale
      });
    } else {
      // Update existing user
      user.email = userInfo.profile.email;
      user.displayName = userInfo.profile.display_name || userInfo.name;
      user.realName = userInfo.profile.real_name || userInfo.name;
      user.profile = {
        title: userInfo.profile.title,
        department: userInfo.profile.fields?.Xf0DMHFDQA?.value || '',
        interests: userInfo.profile.fields?.Xf0DMHFDQA?.value?.split(',').map(i => i.trim()) || [],
        status: userInfo.profile.status_text,
        statusEmoji: userInfo.profile.status_emoji,
        phone: userInfo.profile.phone,
        skype: userInfo.profile.skype
      };
      user.avatar = userInfo.profile.image_192;
      user.isAdmin = userInfo.is_admin;
      user.isOwner = userInfo.is_owner;
      user.lastUpdated = new Date();
    }

    await user.save();

    res.json({
      message: 'User data synced successfully',
      user: {
        slackUserId: user.slackUserId,
        displayName: user.displayName,
        realName: user.realName,
        email: user.email,
        profile: user.profile,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ error: 'Failed to sync user data' });
  }
});

// Sync team members
router.post('/sync-team', async (req, res) => {
  try {
    const { teamId } = req.user;

    // Get team members from Slack API
    const teamMembers = await getSlackTeamMembers(teamId);

    const syncedUsers = [];
    const errors = [];

    for (const member of teamMembers) {
      try {
        if (member.is_bot || member.is_deleted) continue;

        let user = await User.findOne({ slackUserId: member.id });
        
        if (!user) {
          user = new User({
            slackUserId: member.id,
            slackTeamId: teamId,
            email: member.profile.email,
            displayName: member.profile.display_name || member.name,
            realName: member.profile.real_name || member.name,
            profile: {
              title: member.profile.title,
              department: member.profile.fields?.Xf0DMHFDQA?.value || '',
              interests: member.profile.fields?.Xf0DMHFDQA?.value?.split(',').map(i => i.trim()) || [],
              status: member.profile.status_text,
              statusEmoji: member.profile.status_emoji,
              phone: member.profile.phone,
              skype: member.profile.skype
            },
            avatar: member.profile.image_192,
            isAdmin: member.is_admin,
            isOwner: member.is_owner,
            isBot: member.is_bot,
            timezone: member.tz,
            locale: member.locale
          });
        } else {
          // Update existing user
          user.email = member.profile.email;
          user.displayName = member.profile.display_name || member.name;
          user.realName = member.profile.real_name || member.name;
          user.profile = {
            title: member.profile.title,
            department: member.profile.fields?.Xf0DMHFDQA?.value || '',
            interests: member.profile.fields?.Xf0DMHFDQA?.value?.split(',').map(i => i.trim()) || [],
            status: member.profile.status_text,
            statusEmoji: member.profile.status_emoji,
            phone: member.profile.phone,
            skype: member.profile.skype
          };
          user.avatar = member.profile.image_192;
          user.isAdmin = member.is_admin;
          user.isOwner = member.is_owner;
          user.lastUpdated = new Date();
        }

        await user.save();
        syncedUsers.push(user.slackUserId);
      } catch (error) {
        errors.push({ userId: member.id, error: error.message });
      }
    }

    res.json({
      synced: syncedUsers.length,
      users: syncedUsers,
      errors
    });
  } catch (error) {
    console.error('Sync team error:', error);
    res.status(500).json({ error: 'Failed to sync team data' });
  }
});

// Get user's recent DMs
router.get('/recent-dms', async (req, res) => {
  try {
    const { userId } = req.user;
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get recent DM interactions from database
    const recentDMs = await Interaction.find({
      userId,
      channelType: 'im',
      messageTimestamp: { $gte: cutoffDate }
    }).distinct('contactId');

    // Get user details for each DM contact
    const dmContacts = await User.find({
      slackUserId: { $in: recentDMs }
    }).select('slackUserId displayName realName avatar profile');

    res.json(dmContacts);
  } catch (error) {
    console.error('Get recent DMs error:', error);
    res.status(500).json({ error: 'Failed to get recent DMs' });
  }
});

// Helper functions
async function getSlackUserInfo(userId) {
  try {
    // This would make a call to Slack API
    // For now, return mock data - implement with actual Slack API
    return {
      id: userId,
      name: 'testuser',
      profile: {
        email: 'test@example.com',
        display_name: 'Test User',
        real_name: 'Test User',
        title: 'Software Engineer',
        status_text: 'Available',
        status_emoji: ':white_check_mark:',
        phone: '',
        skype: '',
        image_192: 'https://via.placeholder.com/192'
      },
      is_admin: false,
      is_owner: false,
      is_bot: false,
      tz: 'America/New_York',
      locale: 'en-US'
    };
  } catch (error) {
    console.error('Get Slack user info error:', error);
    return null;
  }
}

async function getSlackTeamMembers(teamId) {
  try {
    // This would make a call to Slack API
    // For now, return mock data - implement with actual Slack API
    return [
      {
        id: 'U1234567890',
        name: 'user1',
        profile: {
          email: 'user1@example.com',
          display_name: 'User One',
          real_name: 'User One',
          title: 'Product Manager',
          status_text: 'In a meeting',
          status_emoji: ':meeting:',
          phone: '',
          skype: '',
          image_192: 'https://via.placeholder.com/192'
        },
        is_admin: false,
        is_owner: false,
        is_bot: false,
        tz: 'America/New_York',
        locale: 'en-US'
      },
      {
        id: 'U1234567891',
        name: 'user2',
        profile: {
          email: 'user2@example.com',
          display_name: 'User Two',
          real_name: 'User Two',
          title: 'Designer',
          status_text: 'Working from home',
          status_emoji: ':house:',
          phone: '',
          skype: '',
          image_192: 'https://via.placeholder.com/192'
        },
        is_admin: false,
        is_owner: false,
        is_bot: false,
        tz: 'America/New_York',
        locale: 'en-US'
      }
    ];
  } catch (error) {
    console.error('Get Slack team members error:', error);
    return [];
  }
}

module.exports = router; 