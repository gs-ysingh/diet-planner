# Google Analytics Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] Install react-ga4 package
- [x] Create analytics utility functions
- [x] Create analytics React hooks
- [x] Integrate tracking in App.tsx
- [x] Add tracking to all pages
- [x] Add tracking to all components
- [x] Test build successfully
- [x] Update environment variable files
- [x] Create documentation

## 🚀 Deployment Steps

### Step 1: Create Google Analytics Property
- [ ] Go to [Google Analytics](https://analytics.google.com/)
- [ ] Click "Admin" (gear icon)
- [ ] Create a new GA4 Property
- [ ] Set property name (e.g., "Diet Planner")
- [ ] Set timezone and currency
- [ ] Click "Create"
- [ ] Copy your Measurement ID (G-XXXXXXXXXX)

### Step 2: Configure Vercel Environment
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Select your Diet Planner project
- [ ] Go to Settings → Environment Variables
- [ ] Add new variable:
  - **Name:** `REACT_APP_GA_MEASUREMENT_ID`
  - **Value:** `G-XXXXXXXXXX` (your actual ID)
  - **Environment:** Check all (Production, Preview, Development)
- [ ] Click "Save"

### Step 3: Deploy
- [ ] Commit and push your code (if not already done)
- [ ] Vercel will auto-deploy with the new environment variable
- [ ] OR trigger manual deployment from Vercel dashboard

### Step 4: Verify Tracking
- [ ] Visit your deployed site
- [ ] Open Google Analytics → Reports → Realtime
- [ ] Navigate through your site
- [ ] Confirm page views appear in real-time
- [ ] Test creating a plan
- [ ] Verify "Create Plan" events appear

### Step 5: Configure GA4 (Optional but Recommended)

#### Mark Key Events as Conversions
- [ ] Go to Admin → Events
- [ ] Find "Create Plan Success" event
- [ ] Toggle "Mark as conversion"
- [ ] Repeat for other important events:
  - Register
  - Login

#### Create Custom Reports
- [ ] Go to Explore
- [ ] Create a funnel report:
  1. Landing page view
  2. Register
  3. Create Plan Clicked
  4. Create Plan Started
  5. Create Plan Success

#### Set Up Alerts (Optional)
- [ ] Go to Admin → Custom Alerts
- [ ] Create alert for sudden traffic drops
- [ ] Create alert for error spikes

## 📊 Verification Commands

### Test in Development
```bash
# Set local environment variable
cd client
echo "REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX" > .env.local

# Start development server
npm start

# Open browser console - you should see:
# "Google Analytics initialized with ID: G-XXXXXXXXXX"
# "GA Page View: / Landing Page"
```

### Test Production Build
```bash
cd client
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX npm run build
npm install -g serve
serve -s build

# Visit http://localhost:3000
# Check GA Real-Time reports
```

## 🔍 Troubleshooting

### Analytics Not Working?
- [ ] Verify environment variable is set correctly
- [ ] Check Measurement ID format (must be G-XXXXXXXXXX)
- [ ] Disable ad blockers
- [ ] Check browser console for errors
- [ ] Use GA DebugView for detailed event tracking

### Events Not Showing?
- [ ] Wait 24-48 hours for some reports
- [ ] Use Real-Time reports for immediate verification
- [ ] Check event names match in GA4 dashboard
- [ ] Verify GA4 property is active (not paused)

### Build Errors?
- [ ] Run `npm install` in client directory
- [ ] Clear node_modules: `rm -rf node_modules && npm install`
- [ ] Check TypeScript errors: `npm run type-check`

## 📝 Post-Deployment Tasks

### Week 1
- [ ] Monitor Real-Time reports daily
- [ ] Verify all tracked events appear
- [ ] Check funnel completion rates
- [ ] Ensure no console errors

### Week 2-4
- [ ] Review engagement metrics
- [ ] Analyze plan creation funnel
- [ ] Identify drop-off points
- [ ] Review most popular preferences

### Monthly
- [ ] Create monthly report
- [ ] Review conversion rates
- [ ] Analyze user behavior trends
- [ ] Optimize based on insights

## 🎯 Success Metrics

### What to Track
1. **Plan Creation Success Rate**
   - Target: >70% of users who click "Create Plan" complete it

2. **Average Time on Create Plan Page**
   - Baseline: Track for first month
   - Goal: Reduce if too high (simplify flow)

3. **Most Popular Preferences**
   - Use to optimize default selections
   - Consider featuring popular options

4. **User Journey**
   - Average time from registration to first plan
   - Goal: <5 minutes

5. **Export Usage**
   - PDF vs CSV preferences
   - Feature adoption rate

## 📞 Support

If you encounter any issues:
1. Check [GOOGLE_ANALYTICS.md](./GOOGLE_ANALYTICS.md) for detailed docs
2. Review [GA_SETUP.md](./GA_SETUP.md) for quick reference
3. Check Google Analytics Help Center
4. Review browser console for errors

## ✅ Deployment Complete!

Once you've checked all items above, your Google Analytics implementation is live and tracking!
