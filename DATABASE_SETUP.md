# PostgreSQL Database Setup Guide

## Option 1: Install PostgreSQL Locally (Recommended for Development)

### macOS Installation

#### Using Homebrew (Recommended):
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create a database user (optional, you can use your system user)
createuser --superuser postgres

# Set password for postgres user
psql postgres -c "ALTER USER postgres PASSWORD 'your_password';"
```

#### Using PostgreSQL.app:
1. Download from: https://postgresapp.com/
2. Install and launch the app
3. Click "Initialize" to create a new server
4. The default settings work fine for development

### Windows Installation

1. Download PostgreSQL installer from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Make sure to note the port (default is 5432)

### Linux (Ubuntu/Debian) Installation

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database
sudo -u postgres psql
```

## Option 2: Use Docker (Great for Development)

### Docker Setup:
```bash
# Pull PostgreSQL image
docker pull postgres:15

# Run PostgreSQL container
docker run --name diet-planner-db \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_USER=diet_user \
  -e POSTGRES_DB=diet_planner \
  -p 5432:5432 \
  -d postgres:15

# Check if container is running
docker ps
```

### Docker Compose (Recommended):
Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    container_name: diet-planner-db
    environment:
      POSTGRES_USER: diet_user
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: diet_planner
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Then run:
```bash
docker-compose up -d
```

## Option 3: Cloud Database (For Production)

### Popular Options:
- **Supabase** (Free tier available): https://supabase.com/
- **Railway** (Free tier): https://railway.app/
- **Render** (Free tier): https://render.com/
- **AWS RDS**: https://aws.amazon.com/rds/
- **Google Cloud SQL**: https://cloud.google.com/sql
- **Azure Database**: https://azure.microsoft.com/en-us/products/postgresql

## Database Setup Steps

### 1. Create the Database

If using local PostgreSQL:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE diet_planner;

# Create user (optional)
CREATE USER diet_user WITH ENCRYPTED PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE diet_planner TO diet_user;

# Exit
\q
```

### 2. Configure Environment Variables

Copy the server environment file:
```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your database connection details:

#### For Local PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/diet_planner?schema=public"
# OR if you created a specific user:
DATABASE_URL="postgresql://diet_user:your_password@localhost:5432/diet_planner?schema=public"

JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
OPENAI_API_KEY="your-openai-api-key-here"
NODE_ENV="development"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

#### For Docker:
```env
DATABASE_URL="postgresql://diet_user:your_password@localhost:5432/diet_planner?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
OPENAI_API_KEY="your-openai-api-key-here"
NODE_ENV="development"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

#### For Cloud Database:
Use the connection string provided by your cloud provider, for example:
```env
DATABASE_URL="postgresql://username:password@hostname:port/database_name?sslmode=require"
```

### 3. Install Dependencies and Run Migrations

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data (optional)
npm run db:seed
```

## Verification Steps

### 1. Test Database Connection

You can test the connection using Prisma Studio:
```bash
cd server
npx prisma studio
```

This will open a web interface at http://localhost:5555 where you can view and edit your database.

### 2. Test with psql (for local installations):
```bash
# Connect to the database
psql -U postgres -d diet_planner

# List tables (should show your migrated tables)
\dt

# Exit
\q
```

### 3. Check Server Connection

Start the server and check if it connects:
```bash
cd server
npm run dev
```

Look for messages like:
```
🚀 Server ready at http://localhost:4000/graphql
```

## Common Issues and Solutions

### Issue 1: "Connection refused"
**Solution**: Make sure PostgreSQL is running
```bash
# macOS with Homebrew
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Docker
docker start diet-planner-db
```

### Issue 2: "Authentication failed"
**Solution**: Check username/password in DATABASE_URL

### Issue 3: "Database does not exist"
**Solution**: Create the database first:
```bash
psql -U postgres -c "CREATE DATABASE diet_planner;"
```

### Issue 4: "SSL connection required"
**Solution**: Add `?sslmode=require` to your DATABASE_URL for cloud databases

### Issue 5: Prisma migration errors
**Solution**: Reset and re-run migrations:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## Database Schema Overview

The application uses these main tables:
- **users**: User profiles and authentication
- **diet_plans**: Weekly diet plans
- **meals**: Individual meals with nutritional info

## Next Steps

After setting up the database:

1. **Get OpenAI API Key**:
   - Visit: https://platform.openai.com/api-keys
   - Create a new API key
   - Add it to your `.env` file

2. **Start the Application**:
   ```bash
   # From project root
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend GraphQL: http://localhost:4000/graphql
   - Database Studio: http://localhost:5555 (run `npx prisma studio`)

## Security Best Practices

1. **Use strong passwords** for database users
2. **Never commit** `.env` files to version control
3. **Use connection pooling** for production
4. **Enable SSL** for production databases
5. **Regular backups** for production data
6. **Limit database user permissions** to only what's needed

## Backup and Restore

### Create Backup:
```bash
pg_dump -U postgres diet_planner > backup.sql
```

### Restore Backup:
```bash
psql -U postgres diet_planner < backup.sql
```

That's it! Your PostgreSQL database should now be ready for the Diet Planner application.
