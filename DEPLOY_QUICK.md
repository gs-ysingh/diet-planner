# Quick Deployment Guide

## 🚀 Deploy in 3 Steps

### 1️⃣ Deploy Backend (Railway)
1. Go to [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Select `diet-planner` repo
4. **+ New** → **Database** → **PostgreSQL**
5. Click backend service → **Variables** tab → Add:
   ```
   DATABASE_URL=<from-railway-postgres>
   NODE_ENV=production
   JWT_SECRET=<run: openssl rand -base64 32>
   OPENAI_API_KEY=<your-key>
   CORS_ORIGIN=<will-update-after-step-2>
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<your-email>
   SMTP_PASS=<app-password>
   CLIENT_URL=<will-update-after-step-2>
   ```
6. **Settings** → **Networking** → **Generate Domain**
7. Copy your Railway URL (e.g., `https://xxx.railway.app`)

### 2️⃣ Deploy Frontend (Vercel)
```bash
cd client
npx vercel
```
Or via dashboard:
1. Go to [vercel.com](https://vercel.com)
2. **New Project** → Import `diet-planner` repo
3. Root Directory: `client`
4. Add environment variable:
   ```
   REACT_APP_GRAPHQL_ENDPOINT=https://your-railway-url.railway.app/graphql
   ```
5. Deploy
6. Copy your Vercel URL (e.g., `https://diet-planner.vercel.app`)

### 3️⃣ Update Backend CORS
1. Go back to Railway → Backend service → **Variables**
2. Update:
   ```
   CORS_ORIGIN=https://your-vercel-url.vercel.app
   CLIENT_URL=https://your-vercel-url.vercel.app
   ```
3. Service auto-redeploys

## ✅ Verify
- Backend: Visit `https://your-railway-url.railway.app/health`
- Frontend: Visit `https://your-vercel-url.vercel.app`

## 📖 Full Guide
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 💰 Cost
- **Free tier**: Railway $5 credit/month + Vercel free
- **After free tier**: ~$10-20/month

## 🔧 Need Help?
- Railway logs: Project → Service → **Logs**
- Vercel logs: Project → Deployment → **Logs**
- Detailed troubleshooting in [DEPLOYMENT.md](./DEPLOYMENT.md)
