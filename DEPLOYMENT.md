# Deployment Guide - Vercel + Railway

This guide will walk you through deploying your Diet Planner app using Vercel (frontend) and Railway (backend + database).

## Prerequisites

- GitHub account with your code pushed
- [Vercel account](https://vercel.com) (free)
- [Railway account](https://railway.app) (free tier available)
- OpenAI API key
- SMTP credentials (Gmail, SendGrid, etc.)

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `diet-planner` repository
5. Railway will auto-detect your Node.js app

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will provision a database automatically
4. Click on PostgreSQL service → **"Connect"** tab
5. Copy the **"Postgres Connection URL"** (starts with `postgresql://`)

### Step 3: Configure Backend Environment Variables

1. Click on your backend service (not the database)
2. Go to **"Variables"** tab
3. Add these environment variables:

```bash
DATABASE_URL=<paste-postgres-connection-url>
NODE_ENV=production
PORT=4000
JWT_SECRET=<generate-random-secure-string>
OPENAI_API_KEY=<your-openai-api-key>
CORS_ORIGIN=https://your-app.vercel.app

# SMTP Settings (example with Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<your-app-password>
FROM_EMAIL=noreply@dietplanner.com

# Client URL for email links (set after deploying frontend)
CLIENT_URL=https://your-app.vercel.app
```

**Important Notes:**
- For `JWT_SECRET`, generate a random string: Run `openssl rand -base64 32` in terminal
- For Gmail SMTP, create an [App Password](https://support.google.com/accounts/answer/185833)
- You'll update `CORS_ORIGIN` and `CLIENT_URL` after deploying frontend

### Step 4: Configure Build Settings

1. In your backend service, go to **"Settings"** tab
2. Under **"Build"**, ensure:
   - **Root Directory**: Leave empty (or set to `server` if Railway doesn't detect it)
   - **Install Command**: `cd server && npm install`
   - **Build Command**: `cd server && npm run build && npx prisma generate`
   - **Start Command**: `cd server && npx prisma migrate deploy && npm start`

3. Click **"Deploy"**

### Step 5: Get Your Backend URL

1. Once deployed, go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy your domain (e.g., `diet-planner-production.up.railway.app`)
4. Your GraphQL endpoint will be: `https://your-domain.railway.app/graphql`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your `diet-planner` repository
4. Vercel will auto-detect it as a Create React App

### Step 2: Configure Build Settings

1. **Root Directory**: Select `client`
2. **Framework Preset**: Create React App (auto-detected)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `build` (default)
5. **Install Command**: `npm install` (default)

### Step 3: Add Environment Variables

1. In **"Environment Variables"** section, add:

```bash
REACT_APP_GRAPHQL_ENDPOINT=https://your-railway-domain.railway.app/graphql
```

Replace `your-railway-domain.railway.app` with your actual Railway domain from Part 1, Step 5.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Copy your Vercel URL (e.g., `https://diet-planner.vercel.app`)

---

## Part 3: Update Backend CORS Settings

Now that you have your frontend URL, update Railway:

1. Go back to Railway → Your backend service
2. Go to **"Variables"** tab
3. Update these variables:

```bash
CORS_ORIGIN=https://your-app.vercel.app
CLIENT_URL=https://your-app.vercel.app
```

4. The service will automatically redeploy

---

## Part 4: Verify Deployment

### Test Backend:

1. Visit: `https://your-railway-domain.railway.app/health`
2. Should see: `{"status":"OK","timestamp":"..."}`

### Test Frontend:

1. Visit: `https://your-app.vercel.app`
2. Try registering a new user
3. Check email verification works
4. Try creating a diet plan

---

## Part 5: Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to your project → **"Settings"** → **"Domains"**
2. Add your custom domain (e.g., `dietplanner.com`)
3. Follow DNS configuration instructions

### For Railway (Backend):
1. Go to your service → **"Settings"** → **"Networking"**
2. Add custom domain (e.g., `api.dietplanner.com`)
3. Update Vercel env variable with new backend URL

---

## Ongoing Maintenance

### View Logs:
- **Railway**: Project → Service → **"Logs"** tab
- **Vercel**: Project → **"Deployments"** → Select deployment → **"Logs"**

### Database Management:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Connect to database
railway run psql $DATABASE_URL
```

### Update Deployment:
- **Both platforms auto-deploy** when you push to GitHub main branch
- Or use **"Redeploy"** button in dashboard

### Costs:
- **Railway**: Free $5 credit/month, then ~$10-20/month
- **Vercel**: Free for hobby projects, unlimited deployments
- **Total**: ~$10-20/month after free tier

---

## Troubleshooting

### Backend won't start:
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure DATABASE_URL is correct

### Frontend can't connect to backend:
- Check CORS_ORIGIN in Railway matches your Vercel URL
- Verify REACT_APP_GRAPHQL_ENDPOINT in Vercel is correct
- Check browser console for CORS errors

### Database migration errors:
- Run manually: `railway run npx prisma migrate deploy`
- Or use Railway's terminal feature

### Email not working:
- Verify SMTP credentials are correct
- Check Railway logs for email errors
- For Gmail, ensure "App Password" is used (not regular password)

---

## Quick Commands Reference

```bash
# Generate JWT secret
openssl rand -base64 32

# Test backend locally before deploying
cd server
npm run build
npm start

# Test frontend build locally
cd client
npm run build
npx serve -s build

# Check if Railway CLI is authenticated
railway whoami

# Deploy manually (if auto-deploy is disabled)
railway up
```

---

## Security Checklist

- ✅ JWT_SECRET is long and random (32+ characters)
- ✅ OPENAI_API_KEY is kept secret
- ✅ Database credentials are secure
- ✅ SMTP password uses App Password (for Gmail)
- ✅ CORS_ORIGIN is set to your exact frontend URL
- ✅ NODE_ENV=production in Railway
- ✅ No .env files committed to Git

---

## Next Steps

1. Set up monitoring (Railway has built-in metrics)
2. Configure database backups in Railway
3. Add custom domain
4. Set up CI/CD testing before deploy
5. Add error tracking (Sentry, etc.)

---

**Your app is now live! 🎉**

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-railway-domain.railway.app/graphql`
- Database: Managed by Railway

Need help? Check Railway and Vercel documentation or community forums.
