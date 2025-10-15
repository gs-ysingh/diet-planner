# 🍽️ Diet Planner - Modern AI-Powered Meal Planning

> A comprehensive, modern full-stack web application that generates personalized weekly meal plans using AI technology. Built with the latest 2024-2025 tech stack for optimal performance and developer experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2+-61dafb?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7+-2d3748?logo=prisma)](https://www.prisma.io/)

## ✨ Features

- 🤖 **AI-Powered Generation**: Create personalized meal plans using OpenAI GPT-4
- 📱 **Modern UI/UX**: Beautiful, responsive interface with Material-UI
- 🎯 **Personalization**: Dietary preferences, restrictions, and health goals
- 📊 **Nutrition Tracking**: Detailed nutritional information for each meal
- 📄 **PDF Export**: Download meal plans as formatted PDFs
- 🔐 **Secure Authentication**: JWT-based user authentication
- � **Real-time Updates**: Live form validation and instant feedback
- � **Smooth Animations**: Elegant transitions with Framer Motion

## Tech Stack

### Frontend (Client)
- React 18
- TypeScript
- Relay GraphQL
- Material-UI / Tailwind CSS
- Responsive design
- Accessibility features

### Backend (Server)
- Node.js with Express
- GraphQL with Apollo Server
- PostgreSQL database
- OpenAI API integration
- PDF generation
- JWT authentication

## Quick Start

1. Install dependencies for all packages:
```bash
npm run install:all
```

2. Set up environment variables (see .env.example files)

3. Start development servers:
```bash
npm run dev
```

This will start both the server (port 4000) and client (port 3000) concurrently.

## Project Structure

```
diet-planner/
├── client/          # React frontend application
├── server/          # Node.js backend application
├── package.json     # Root package.json for scripts
└── README.md        # This file
```

## Environment Setup

### Server Environment Variables
Create `server/.env` file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/diet_planner
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
PORT=4000
```

### Client Environment Variables
Create `client/.env` file:
```
REACT_APP_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

## Development

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:4000
- GraphQL Playground: http://localhost:4000/graphql

## Build and Deploy

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
