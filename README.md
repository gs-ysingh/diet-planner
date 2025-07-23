# Diet Planner Application

A comprehensive AI-powered diet planning application built with React, TypeScript, Relay GraphQL, and Node.js.

## Features

- 🍽️ AI-powered weekly diet plan generation
- 👤 User profile management
- 📱 Responsive and accessible design
- 📄 PDF export functionality
- 🔄 Plan customization and updates
- 🌍 Multi-cultural cuisine support

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
