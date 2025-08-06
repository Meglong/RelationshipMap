# Relationship Mapping Slack App

A comprehensive Slack application designed to help users visualize and manage their professional relationships within their organization. The app enables users to build a personal relationship map, understand connections, and easily access key information about their contacts.

## 🚀 Features

### Core Functionality
- **Interactive Relationship Map**: Visualize your professional network with an interactive D3.js force-directed graph
- **Multiple Ways to Add Contacts**: 
  - Search and add individual users
  - Import team members from Slack channels
  - Add contacts from recent DM conversations
- **Rich Profile Information**: View detailed contact profiles with interaction history, shared interests, and relationship metadata
- **Smart Filtering**: Filter relationships by type, recent interactions, and shared interests
- **Real-time Updates**: Live synchronization with Slack data

### User Experience
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Intuitive Navigation**: Clean sidebar navigation with clear sections
- **Hover Previews**: Quick preview of contact information on map nodes
- **Detailed Profiles**: Comprehensive contact details with interaction history
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

### Data Management
- **Secure Authentication**: OAuth 2.0 integration with Slack
- **Data Privacy**: All user data handled with highest security standards
- **Automatic Sync**: Keep your relationship data up-to-date with Slack
- **Flexible Storage**: MongoDB-based data storage with efficient indexing

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Slack Bolt Framework** for Slack integration
- **JWT** for authentication
- **Helmet** and **CORS** for security

### Frontend
- **React 18** with functional components and hooks
- **React Query** for server state management
- **React Router** for navigation
- **D3.js** and **React Force Graph** for visualization
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hook Form** for form handling

### DevOps & Security
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **Error Handling** with proper logging
- **Environment-based Configuration**

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **Slack App** credentials (see setup below)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd relationship-mapping-slack-app
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:
```bash
cp env.example .env
```

Fill in your configuration:
```env
# Slack App Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/relationship-mapping

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret for authentication
JWT_SECRET=your-jwt-secret-key

# Slack App URLs
SLACK_APP_URL=https://your-app-domain.com
SLACK_REDIRECT_URI=https://your-app-domain.com/auth/slack/callback
```

### 4. Slack App Setup

1. **Create a Slack App**:
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App" → "From scratch"
   - Name your app and select your workspace

2. **Configure OAuth & Permissions**:
   - Go to "OAuth & Permissions"
   - Add the following scopes:
     - `users:read`
     - `channels:read`
     - `groups:read`
     - `im:read`
     - `mpim:read`
     - `chat:write` (optional, for notifications)

3. **Set Redirect URLs**:
   - Add your redirect URL: `https://your-domain.com/api/auth/slack/callback`

4. **Install App to Workspace**:
   - Go to "Install App" and install to your workspace
   - Copy the Bot User OAuth Token

5. **Update Environment Variables**:
   - Add your Slack app credentials to `.env`

### 5. Database Setup

Ensure MongoDB is running and accessible:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your connection string
```

### 6. Start the Application

#### Development Mode
```bash
# Start backend server
npm run dev

# In another terminal, start frontend
cd client
npm start
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Heroku Deployment
1. **Create Heroku App**:
```bash
heroku create your-app-name
```

2. **Set Environment Variables**:
```bash
heroku config:set SLACK_BOT_TOKEN=xoxb-your-token
heroku config:set SLACK_SIGNING_SECRET=your-secret
# ... set all other environment variables
```

3. **Deploy**:
```bash
git push heroku main
```

### Docker Deployment
```bash
# Build image
docker build -t relationship-mapping-app .

# Run container
docker run -p 3000:3000 --env-file .env relationship-mapping-app
```

## 📖 API Documentation

### Authentication Endpoints
- `GET /api/auth/slack/callback` - Slack OAuth callback
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

### Relationship Endpoints
- `GET /api/relationships/map` - Get user's relationship map
- `POST /api/relationships/add` - Add individual relationship
- `POST /api/relationships/add-team` - Add team members from channel
- `POST /api/relationships/add-recent-dms` - Add recent DM contacts
- `PUT /api/relationships/:id` - Update relationship
- `DELETE /api/relationships/:id` - Delete relationship

### Slack Integration Endpoints
- `GET /api/slack/users/search` - Search users
- `GET /api/slack/channels` - Get user's channels
- `POST /api/slack/sync-user` - Sync user data
- `POST /api/slack/sync-team` - Sync team data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all user inputs
- **CORS Protection**: Configured for production domains
- **Helmet Security**: HTTP headers protection
- **Environment Variables**: Secure credential management

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the PRD for detailed requirements

## 🎯 Roadmap

### Future Enhancements
- [ ] Custom relationship types
- [ ] Calendar integration
- [ ] Connection recommendations
- [ ] Export functionality
- [ ] Group relationship maps
- [ ] Advanced search and filtering
- [ ] Mobile app
- [ ] Analytics dashboard

---

Built with ❤️ for better professional relationships 