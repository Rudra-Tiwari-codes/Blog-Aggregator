#!/bin/bash

# Blog Aggregator Setup Script
# This script helps you quickly set up the Blog Aggregator project

echo "================================"
echo "Blog Aggregator Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js is installed: $(node --version)"
echo ""

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "Warning: MongoDB is not found in PATH."
    echo "Make sure MongoDB is installed and running."
    echo "Download from: https://www.mongodb.com/try/download/community"
    echo ""
fi

# Setup Backend
echo "Setting up backend..."
cd server

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit server/.env with your configuration:"
    echo "  - MONGODB_URI (MongoDB connection string)"
    echo "  - OPENAI_API_KEY (Your OpenAI API key)"
    echo ""
fi

echo "Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install backend dependencies"
    exit 1
fi

echo "✓ Backend setup complete"
echo ""

# Setup Frontend
echo "Setting up frontend..."
cd ../client

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

echo "Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install frontend dependencies"
    exit 1
fi

echo "✓ Frontend setup complete"
echo ""

cd ..

echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Make sure MongoDB is running"
echo ""
echo "2. Edit server/.env with your configuration:"
echo "   - Add your OpenAI API key"
echo "   - Configure MongoDB URI if needed"
echo ""
echo "3. Start the backend server:"
echo "   cd server"
echo "   npm run dev"
echo ""
echo "4. In a new terminal, start the frontend:"
echo "   cd client"
echo "   npm run dev"
echo ""
echo "5. Fetch initial blog data:"
echo "   curl -X POST http://localhost:5000/api/admin/fetch-blogs"
echo ""
echo "6. Generate AI summaries:"
echo "   curl -X POST http://localhost:5000/api/admin/generate-summaries"
echo ""
echo "7. Open your browser to http://localhost:3000"
echo ""
echo "For more details, see SETUP.md"
echo "================================"
