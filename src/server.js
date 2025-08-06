const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const relationshipRoutes = require('./routes/relationships');
const slackRoutes = require('./routes/slack');
const demoRoutes = require('./routes/demo');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Initialize Slack app only in production
let slackApp = null;
if (process.env.NODE_ENV === 'production') {
  const { App } = require('@slack/bolt');
  slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: false,
    port: PORT
  });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for demo purposes
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.SLACK_APP_URL 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection (skip in demo mode)
if (process.env.NODE_ENV === 'production') {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('Demo mode: Using in-memory data store');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/relationships', authenticateToken, relationshipRoutes);
app.use('/api/slack', slackRoutes);
app.use('/api/demo', demoRoutes);

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Demo mode: ${process.env.NODE_ENV === 'development' ? 'Enabled' : 'Disabled'}`);
});

// Export for testing
module.exports = { app, slackApp }; 