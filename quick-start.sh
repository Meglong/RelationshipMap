#!/bin/bash

echo "🚀 Relationship Mapping Slack App - Quick Start Demo"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   mongod"
    echo ""
    echo "   Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env"
    echo ""
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with demo configuration..."
    cp demo-env.txt .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

echo ""
echo "🎉 Setup complete! Starting the demo..."
echo ""
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:3001"
echo ""
echo "🎯 Click 'Try Demo Version' to experience the app!"
echo ""
echo "Press Ctrl+C to stop the demo"
echo ""

# Start the demo
node start-demo.js 