# 🚀 Relationship Mapping Slack App - Demo Setup

This guide will help you run a working prototype of the Relationship Mapping Slack App with sample data, so you can see exactly how it will look and function once deployed.

## 📋 Prerequisites

Before starting, make sure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (to clone the repository)

## 🔧 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Set Up Environment

Create a `.env` file in the root directory:

```bash
# Copy the demo environment configuration
cp demo-env.txt .env
```

Or manually create `.env` with this content:

```env
NODE_ENV=development
PORT=3001

# Mock Slack App Configuration (for demo purposes)
SLACK_BOT_TOKEN=xoxb-demo-token
SLACK_SIGNING_SECRET=demo-signing-secret
SLACK_CLIENT_ID=demo-client-id
SLACK_CLIENT_SECRET=demo-client-secret

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/relationship-mapping-demo

# JWT Secret for authentication
JWT_SECRET=demo-jwt-secret-key-for-prototype

# Slack App URLs
SLACK_APP_URL=http://localhost:3001
SLACK_REDIRECT_URI=http://localhost:3001/auth/slack/callback

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a free cluster
- Get your connection string and update `MONGODB_URI` in `.env`

### 4. Start the Demo

**Option A: Automatic (Recommended)**
```bash
node start-demo.js
```

**Option B: Manual**
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
cd client
npm start
```

## 🎯 Demo Features

Once the app is running, you'll have access to:

### **Sample Data Included:**
- **5 Demo Users** with realistic profiles and avatars
- **4 Sample Relationships** showing different types:
  - Colleague (Sarah Smith - Product Manager)
  - Team Member (Mike Johnson - UX Designer)
  - Mentor (Lisa Wang - Data Scientist)
  - Manager (David Brown - Engineering Manager)
- **3 Sample Interactions** with message history

### **Full App Functionality:**
- ✅ **Interactive Relationship Map** with D3.js visualization
- ✅ **Dashboard** with statistics and quick actions
- ✅ **Add Relationships** page with search and import options
- ✅ **Profile Management** with sync capabilities
- ✅ **Responsive Design** that works on all devices
- ✅ **Real-time Filtering** and search
- ✅ **Hover Previews** and detailed contact information

### **Demo User:**
- **Name:** John Doe
- **Role:** Senior Software Engineer
- **Email:** john.doe@company.com
- **Interests:** coding, hiking, photography

## 🎮 How to Use the Demo

### 1. **Login**
- Go to http://localhost:3000
- Click **"Try Demo Version"** (no Slack credentials needed)

### 2. **Explore the Dashboard**
- View relationship statistics
- See recent contacts
- Try quick actions

### 3. **Interactive Relationship Map**
- Hover over nodes to see contact previews
- Click nodes for detailed profiles
- Use filters to explore different relationship types
- See shared interests and interaction history

### 4. **Add Relationships**
- Try the search functionality
- Import team members (simulated)
- Add recent DM contacts (simulated)

### 5. **Profile Management**
- View and edit profile information
- Sync data (simulated)
- Manage settings

## 🔍 What You'll See

### **Dashboard View:**
- Welcome message with user avatar
- Statistics cards (Total Relationships, Recent Interactions, etc.)
- Quick action buttons
- Recent relationships list

### **Relationship Map:**
- Force-directed graph visualization
- Color-coded nodes by relationship type
- Interactive hover and click effects
- Filtering options
- Detailed contact cards

### **Add Relationships:**
- User search with real-time results
- Multiple import methods
- Relationship type selection
- Notes and tags functionality

### **Profile Page:**
- Complete user profile information
- Professional details
- Contact information
- Settings and sync options

## 🛠️ Technical Details

### **Backend (Port 3001):**
- Express.js server with MongoDB
- JWT authentication
- RESTful API endpoints
- Demo data seeding
- Rate limiting and security

### **Frontend (Port 3000):**
- React 18 with hooks
- Tailwind CSS for styling
- D3.js for visualizations
- React Query for state management
- Responsive design

### **Database:**
- MongoDB with sample collections:
  - `users` - User profiles
  - `relationships` - Relationship mappings
  - `interactions` - Message history

## 🎨 Customization

### **Add More Demo Data:**
Edit `src/utils/demoData.js` to add more users, relationships, or interactions.

### **Modify Styling:**
Update `client/src/index.css` or `client/tailwind.config.js` for custom styling.

### **Change Demo User:**
Modify the demo user in `src/utils/demoData.js` to see the app from a different perspective.

## 🚨 Troubleshooting

### **Port Already in Use:**
```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### **MongoDB Connection Issues:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Try using MongoDB Atlas for cloud hosting

### **Dependencies Issues:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **Frontend Build Issues:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

## 📱 Mobile Testing

The app is fully responsive! Test on:
- **Desktop:** http://localhost:3000
- **Mobile:** Use browser dev tools or scan QR code from mobile browser
- **Tablet:** Resize browser window or use tablet device

## 🎉 Next Steps

After experiencing the demo:

1. **Deploy to Production:** Follow the main README.md for production deployment
2. **Connect Real Slack:** Set up actual Slack app credentials
3. **Customize Features:** Modify the codebase for your specific needs
4. **Add More Features:** Implement additional functionality from the roadmap

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are installed
4. Try the manual setup option

---

**🎯 Ready to experience the future of relationship mapping? Start the demo now!** 