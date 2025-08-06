const jwt = require('jsonwebtoken');
const inMemoryStore = require('../utils/inMemoryStore');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // For demo mode, just use the decoded token data
    req.user = {
      userId: decoded.slackUserId, // Changed from slackUserId to userId
      teamId: decoded.slackTeamId, // Changed from slackTeamId to teamId
      slackUserId: decoded.slackUserId,
      slackTeamId: decoded.slackTeamId,
      email: decoded.email
    };

    console.log('Authentication successful for user:', req.user);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    {
      slackUserId: user.slackUserId,
      slackTeamId: user.slackTeamId,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifySlackToken = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Slack token required' });
  }

  try {
    // Verify with Slack API
    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!data.ok) {
      return res.status(401).json({ error: 'Invalid Slack token' });
    }

    req.slackUser = {
      userId: data.user_id,
      teamId: data.team_id,
      teamName: data.team,
      user: data.user
    };

    next();
  } catch (error) {
    console.error('Slack token verification error:', error);
    return res.status(500).json({ error: 'Token verification failed' });
  }
};

module.exports = {
  authenticateToken,
  generateToken,
  verifySlackToken
}; 