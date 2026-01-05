#!/bin/bash

# Deployment Setup Script for Vercel + Railway

echo "🚀 Diet Planner Deployment Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is clean
echo -e "${BLUE}Checking git status...${NC}"
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}⚠️  You have uncommitted changes. Commit them before deploying.${NC}"
  echo ""
  git status -s
  echo ""
  read -p "Do you want to commit these changes now? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Commit message:"
    read commit_msg
    git add .
    git commit -m "$commit_msg"
    git push origin main
    echo -e "${GREEN}✅ Changes committed and pushed${NC}"
  else
    echo -e "${YELLOW}⚠️  Please commit changes manually before deploying${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ Git is clean${NC}"
fi

echo ""
echo -e "${BLUE}Installing CLIs...${NC}"

# Check and install Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
else
  echo -e "${GREEN}✅ Vercel CLI already installed${NC}"
fi

# Check and install Railway CLI
if ! command -v railway &> /dev/null; then
  echo "Installing Railway CLI..."
  npm install -g @railway/cli
else
  echo -e "${GREEN}✅ Railway CLI already installed${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo ""
echo -e "${BLUE}1. Deploy Backend to Railway:${NC}"
echo "   - Visit https://railway.app"
echo "   - Create new project from GitHub"
echo "   - Add PostgreSQL database"
echo "   - Configure environment variables (see DEPLOYMENT.md)"
echo ""
echo -e "${BLUE}2. Deploy Frontend to Vercel:${NC}"
echo "   cd client"
echo "   vercel"
echo "   # Follow the prompts"
echo ""
echo -e "${BLUE}3. Update CORS settings in Railway${NC}"
echo "   - Add your Vercel URL to CORS_ORIGIN"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
