const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Slack OAuth callback
router.get('/slack/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://slack.com/api/oauth.v2.access', {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.SLACK_REDIRECT_URI
    });

    const { access_token, user } = tokenResponse.data;

    if (!access_token || !user) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    // Get user info from Slack
    const userInfoResponse = await axios.get('https://slack.com/api/users.info', {
      params: { user: user.id },
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userInfo = userInfoResponse.data.user;

    // Create or update user in database
    let dbUser = await User.findOne({ slackUserId: user.id });
    
    if (!dbUser) {
      dbUser = new User({
        slackUserId: user.id,
        slackTeamId: user.team_id,
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
      dbUser.email = userInfo.profile.email;
      dbUser.displayName = userInfo.profile.display_name || userInfo.name;
      dbUser.realName = userInfo.profile.real_name || userInfo.name;
      dbUser.profile = {
        title: userInfo.profile.title,
        department: userInfo.profile.fields?.Xf0DMHFDQA?.value || '',
        interests: userInfo.profile.fields?.Xf0DMHFDQA?.value?.split(',').map(i => i.trim()) || [],
        status: userInfo.profile.status_text,
        statusEmoji: userInfo.profile.status_emoji,
        phone: userInfo.profile.phone,
        skype: userInfo.profile.skype
      };
      dbUser.avatar = userInfo.profile.image_192;
      dbUser.isAdmin = userInfo.is_admin;
      dbUser.isOwner = userInfo.is_owner;
      dbUser.lastUpdated = new Date();
    }

    await dbUser.save();

    // Generate JWT token
    const token = generateToken(dbUser);

    // Redirect to frontend with token
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.SLACK_APP_URL}/auth-success?token=${token}`
      : `http://localhost:3000/auth-success?token=${token}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const user = await User.findOne({ slackUserId: req.user.slackUserId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      slackUserId: user.slackUserId,
      slackTeamId: user.slackTeamId,
      email: user.email,
      displayName: user.displayName,
      realName: user.realName,
      profile: user.profile,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      isOwner: user.isOwner
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const user = await User.findOne({ slackUserId: req.user.slackUserId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // In a stateless JWT setup, logout is handled client-side
  // by removing the token from storage
  res.json({ message: 'Logged out successfully' });
});

module.exports = router; 