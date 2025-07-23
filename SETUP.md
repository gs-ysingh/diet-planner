# Diet Planner Setup Instructions

## Prerequisites

Before setting up the application, make sure you have the following installed:

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- PostgreSQL database
- OpenAI API key

## Installation Steps

### 1. Install Dependencies

Install dependencies for all packages:

```bash
npm run install:all
```

Or install manually:

```bash
# Root dependencies
npm install

# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database named `diet_planner`
2. Copy the server environment file:
   ```bash
   cd server
   cp .env.example .env
   ```
3. Update the `.env` file with your database credentials and API keys:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/diet_planner?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   OPENAI_API_KEY="your-openai-api-key-here"
   NODE_ENV="development"
   PORT=4000
   CORS_ORIGIN="http://localhost:3000"
   ```

### 3. Database Migration

Run Prisma migrations to set up the database schema:

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 4. Seed Database (Optional)

Add sample data to the database:

```bash
cd server
npm run db:seed
```

### 5. Client Environment Setup

1. Copy the client environment file:
   ```bash
   cd client
   cp .env.example .env
   ```
2. Update if necessary (default should work for local development):
   ```
   REACT_APP_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
   ```

## Running the Application

### Development Mode

Start both server and client in development mode:

```bash
npm run dev
```

This will start:
- Server on http://localhost:4000
- Client on http://localhost:3000
- GraphQL Playground on http://localhost:4000/graphql

### Production Build

Build the client for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Environment Variables

### Server (.env)

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/diet_planner?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="your-openai-api-key"
NODE_ENV="development"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

### Client (.env)

```bash
REACT_APP_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

## Features

✅ **User Authentication & Authorization**
- JWT-based authentication
- User registration and login
- Protected routes

✅ **User Profile Management**
- Personal information (age, weight, height, goals)
- Dietary preferences and restrictions
- Activity level settings

✅ **AI-Powered Diet Plan Generation**
- OpenAI integration for meal planning
- Personalized recommendations
- Cultural cuisine considerations
- Nutritional information

✅ **Diet Plan Management**
- Create multiple diet plans
- Set active plans
- Edit and update plans
- Delete plans

✅ **Meal Management**
- Weekly meal planning (7 days × 4 meals)
- Nutritional information display
- Ingredient lists and cooking instructions
- Meal regeneration with custom requirements

✅ **PDF Export**
- Beautiful PDF generation of diet plans
- Downloadable meal plans
- Professional formatting

✅ **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimization
- Accessible UI components

✅ **Modern Tech Stack**
- React 18 with TypeScript
- Material-UI for components
- GraphQL with Apollo Server
- PostgreSQL with Prisma ORM
- Node.js backend

## API Endpoints

### GraphQL Endpoint
- **URL**: `http://localhost:4000/graphql`
- **Playground**: Available in development mode

### Health Check
- **URL**: `http://localhost:4000/health`
- **Method**: GET

## Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: User profiles and authentication
- **DietPlans**: Weekly diet plans
- **Meals**: Individual meals with nutritional info

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in server/.env
   - Verify database exists

2. **OpenAI API Error**
   - Check OPENAI_API_KEY in server/.env
   - Ensure you have API credits
   - Verify API key is valid

3. **Port Already in Use**
   - Change PORT in server/.env
   - Update REACT_APP_GRAPHQL_ENDPOINT in client/.env

4. **CORS Issues**
   - Check CORS_ORIGIN in server/.env
   - Ensure client URL matches

### Reset Database

To reset the database:

```bash
cd server
npx prisma migrate reset
npx prisma generate
npm run db:seed
```

## Development Commands

```bash
# Root level
npm run dev              # Start both server and client
npm run install:all      # Install all dependencies
npm run build           # Build client for production
npm start              # Start production server

# Server level (cd server)
npm run dev            # Start server in development
npm run build          # Build server
npm start             # Start production server
npm run db:migrate     # Run database migrations
npm run db:generate    # Generate Prisma client
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed database

# Client level (cd client)
npm start             # Start development server
npm run build         # Build for production
npm test              # Run tests
npm run type-check    # TypeScript type checking
```

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Ensure all environment variables are set correctly
3. Verify all dependencies are installed
4. Check server and client logs for errors

## License

This project is licensed under the MIT License.
