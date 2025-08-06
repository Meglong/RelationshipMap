const express = require('express');
const jwt = require('jsonwebtoken');
const inMemoryStore = require('../utils/inMemoryStore');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Demo login endpoint
router.post('/login', async (req, res) => {
  try {
    // Find the demo user (John Doe)
    let user = await inMemoryStore.findUser({ slackUserId: 'U1234567890' });
    
    if (!user) {
      // If demo user doesn't exist, reset the data
      await inMemoryStore.resetData();
      user = await inMemoryStore.findUser({ slackUserId: 'U1234567890' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        slackUserId: user.slackUserId,
        slackTeamId: user.slackTeamId,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        slackUserId: user.slackUserId,
        slackTeamId: user.slackTeamId,
        email: user.email,
        displayName: user.displayName,
        realName: user.realName,
        profile: user.profile,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        isOwner: user.isOwner
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Demo login failed' });
  }
});

// Demo data reset endpoint
router.post('/reset', async (req, res) => {
  try {
    const result = await inMemoryStore.resetData();
    res.json({
      message: 'Demo data reset successfully',
      ...result
    });
  } catch (error) {
    console.error('Demo reset error:', error);
    res.status(500).json({ error: 'Demo reset failed' });
  }
});

// Demo user info endpoint
router.get('/user', async (req, res) => {
  try {
    const user = await inMemoryStore.findUser({ slackUserId: 'U1234567890' });
    
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found' });
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
    console.error('Get demo user error:', error);
    res.status(500).json({ error: 'Failed to get demo user info' });
  }
});

// Debug endpoint to check data
router.get('/debug', async (req, res) => {
  try {
    const debugInfo = await inMemoryStore.debugData();
    res.json({
      message: 'Debug information',
      ...debugInfo
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
});

// Test authentication endpoint
router.get('/test-auth', authenticateToken, (req, res) => {
  res.json({
    message: 'Authentication successful',
    user: {
      userId: req.user.userId,
      teamId: req.user.teamId,
      slackUserId: req.user.slackUserId,
      slackTeamId: req.user.slackTeamId,
      email: req.user.email
    }
  });
});

// Test relationships endpoint
router.get('/test-relationships', async (req, res) => {
  try {
    const relationships = await inMemoryStore.findRelationships({
      userId: 'U1234567890',
      teamId: 'T1234567890',
      isActive: true
    });
    
    res.json({
      message: 'Test relationships',
      count: relationships.length,
      relationships: relationships.slice(0, 3) // Show first 3
    });
  } catch (error) {
    console.error('Test relationships error:', error);
    res.status(500).json({ error: 'Test relationships failed' });
  }
});

// Simple test endpoint to check relationships data
router.get('/test-data', async (req, res) => {
  try {
    const relationships = await inMemoryStore.findRelationships({
      userId: 'U1234567890',
      teamId: 'T1234567890',
      isActive: true
    });
    
    res.json({
      message: 'Direct data test',
      query: { userId: 'U1234567890', teamId: 'T1234567890', isActive: true },
      count: relationships.length,
      firstRelationship: relationships[0] || null
    });
  } catch (error) {
    console.error('Test data error:', error);
    res.status(500).json({ error: 'Test data failed' });
  }
});

module.exports = router; 