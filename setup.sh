#!/bin/bash

# Diet Planner Quick Setup Script

echo "🍽️  Diet Planner - Quick Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (version 16+) from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing server dependencies..."
cd server
npm install

echo "📦 Installing client dependencies..."
cd ../client
npm install
cd ..

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up PostgreSQL database"
echo "2. Get OpenAI API key"
echo "3. Copy and configure environment files:"
echo "   - cp server/.env.example server/.env"
echo "   - cp client/.env.example client/.env"
echo "4. Update server/.env with your database URL and OpenAI API key"
echo "5. Run database migrations: cd server && npx prisma migrate dev"
echo "6. Start the application: npm run dev"
echo ""
echo "📖 See SETUP.md for detailed instructions"
echo ""
echo "🚀 Happy meal planning!"
