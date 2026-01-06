# Google Analytics Quick Setup

## 1. Get Your Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

## 2. Set Environment Variable

### Local Development
Create a `.env.local` file in the `client/` directory:
```bash
cd client
echo "REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX" > .env.local
```
Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### Production (Vercel)
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - **Name:** `REACT_APP_GA_MEASUREMENT_ID`
   - **Value:** `G-XXXXXXXXXX`
   - **Scope:** Production, Preview, Development

## 3. Restart Development Server

```bash
cd client
npm start
```

## 4. Verify It's Working

### In Browser Console (Development)
You should see:
```
Google Analytics initialized with ID: G-XXXXXXXXXX
GA Page View: / Landing Page
```

### In Google Analytics (Real-Time)
1. Go to Reports → Realtime
2. Navigate through your app
3. See your activity appear in real-time

## What's Tracked

✅ **Page visits** for all pages  
✅ **Create Plan button clicks** (from Dashboard and Diet Plans page)  
✅ **Plan creation start** (when user submits the form)  
✅ **Plan creation success** (when plan is fully generated and saved)  
✅ **Plan creation errors** (if generation fails)  
✅ **Plan generation progress** (each step of the AI generation)  
✅ **User authentication** (login, register, logout)  
✅ **Profile updates**  
✅ **Plan exports** (PDF and CSV)  
✅ **Plan deletions**  
✅ **Engagement time** on each page  

## View Reports

### Key Events to Monitor
Go to **Reports → Engagement → Events** and look for:
- `page_view` - All page visits
- Custom events in the `Diet Plan` category:
  - Create Plan Clicked
  - Create Plan Started
  - Create Plan Success
  - Generation Progress

### Create Conversion Events
Mark important events as conversions:
1. Go to **Admin → Events**
2. Find "Create Plan Success"
3. Toggle "Mark as conversion"

## Need Help?

See [GOOGLE_ANALYTICS.md](./GOOGLE_ANALYTICS.md) for detailed documentation.
