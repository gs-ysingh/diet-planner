# Google Analytics Setup Guide - Step by Step

This guide will walk you through setting up Google Analytics 4 for your Diet Planner application.

---

## 📋 Overview

**Time Required:** 10-15 minutes  
**Prerequisites:** Google account, Vercel account (for production)  
**What You'll Get:** Full tracking of page visits and plan creation events

---

## Step 1: Create Google Analytics Account & Property

### 1.1 Go to Google Analytics
- Visit: https://analytics.google.com/
- Sign in with your Google account

### 1.2 Create Account (if you don't have one)
1. Click **"Start measuring"** or **"Admin"** (gear icon at bottom left)
2. Click **"Create Account"**
3. Enter Account Name: `Diet Planner` (or your preferred name)
4. Configure data sharing settings (recommended: keep defaults)
5. Click **"Next"**

### 1.3 Create Property
1. Property Name: `Diet Planner App`
2. Select your timezone
3. Select your currency
4. Click **"Next"**

### 1.4 Business Information
1. Select your industry category: `Health & Fitness` or `Food & Drink`
2. Select business size
3. Select how you intend to use Analytics
4. Click **"Create"**

### 1.5 Accept Terms
1. Select your country
2. Check the boxes to accept Terms of Service
3. Click **"I Accept"**

### 1.6 Skip Email Options (Optional)
- Uncheck boxes if you don't want promotional emails
- Click **"Save"**

---

## Step 2: Set Up Data Stream

### 2.1 Create Web Data Stream
1. You should see "Choose a platform" screen
2. Click **"Web"**

### 2.2 Configure Stream
1. **Website URL:** Enter your production URL
   - Example: `https://your-diet-planner.vercel.app`
   - Or use: `https://localhost:3000` for testing
2. **Stream name:** `Diet Planner Production` (or `Development`)
3. Click **"Create stream"**

### 2.3 Copy Measurement ID ⭐ **IMPORTANT**
You'll see your stream details with:
```
Measurement ID: G-XXXXXXXXXX
```

**📝 COPY THIS!** You'll need it in the next steps.

Example: `G-1A2B3C4D5E`

---

## Step 3: Configure Local Development Environment

### 3.1 Create Environment File
Open your terminal and run:

```bash
cd /Users/yogeshsingh/diet-planner/client
```

### 3.2 Create .env.local File
Create a new file with your Measurement ID:

```bash
echo "REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX" > .env.local
```

**Replace `G-XXXXXXXXXX` with your actual Measurement ID!**

For example:
```bash
echo "REACT_APP_GA_MEASUREMENT_ID=G-1A2B3C4D5E" > .env.local
```

### 3.3 Verify the File
Check that it was created:

```bash
cat .env.local
```

You should see:
```
REACT_APP_GA_MEASUREMENT_ID=G-1A2B3C4D5E
```

---

## Step 4: Test in Development

### 4.1 Start Development Server
```bash
npm start
```

### 4.2 Open Browser
- Your app should open at `http://localhost:3000`
- Open Chrome DevTools (F12 or Right-click → Inspect)

### 4.3 Check Console
You should see:
```
Google Analytics initialized with ID: G-XXXXXXXXXX
GA Page View: / Landing Page
```

✅ If you see this, Analytics is working!

### 4.4 Test Real-Time Tracking
1. Go back to Google Analytics
2. Click **Reports** → **Realtime**
3. Navigate through your app
4. You should see your activity appear within seconds!

**Try these actions:**
- Visit different pages
- Click "Create Plan" button
- Go to Login page
- Go to Register page

You should see each page visit in the Real-Time report!

---

## Step 5: Deploy to Production (Vercel)

### 5.1 Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your **Diet Planner** project

### 5.2 Add Environment Variable
1. Click **Settings** (top navigation)
2. Click **Environment Variables** (left sidebar)
3. Click **Add New**

### 5.3 Configure Variable
Fill in the form:
- **Key:** `REACT_APP_GA_MEASUREMENT_ID`
- **Value:** `G-XXXXXXXXXX` (your Measurement ID)
- **Environment:** Check all boxes:
  - ☑️ Production
  - ☑️ Preview
  - ☑️ Development

### 5.4 Save
Click **Save**

---

## Step 6: Redeploy Your Application

### Option A: Automatic (via Git Push)
```bash
cd /Users/yogeshsingh/diet-planner
git add .
git commit -m "Add Google Analytics configuration"
git push origin main
```

Vercel will automatically redeploy with the new environment variable.

### Option B: Manual Redeploy
1. Go to your project in Vercel Dashboard
2. Click **Deployments** tab
3. Click the **⋯** menu on your latest deployment
4. Click **Redeploy**
5. Check **Use existing Build Cache** (optional)
6. Click **Redeploy**

---

## Step 7: Verify Production Tracking

### 7.1 Visit Your Live Site
Open your production URL (e.g., `https://your-diet-planner.vercel.app`)

### 7.2 Check Real-Time Reports
1. Go to Google Analytics
2. Click **Reports** → **Realtime**
3. You should see yourself as an active user!

### 7.3 Test Key Features
Navigate through your production site:
- ✅ Landing page
- ✅ Login/Register
- ✅ Dashboard
- ✅ Click "Create Plan" button
- ✅ Create a diet plan
- ✅ View diet plans

All these actions will appear in Real-Time!

---

## Step 8: Configure Important Events (Recommended)

### 8.1 Mark Conversions
1. In Google Analytics, click **Admin** (gear icon)
2. Under **Data display**, click **Events**
3. Wait for events to populate (may take 24 hours)
4. Find these events and toggle **Mark as conversion**:
   - `Create_Plan_Success` ⭐ Most important!
   - `Login`
   - `Register`

### 8.2 Why This Matters
Marking events as conversions lets you:
- Track conversion rates
- Create conversion-based audiences
- Measure ROI if you run ads
- See conversions in reports

---

## Step 9: Create Your First Report (Optional)

### 9.1 Create Plan Creation Funnel
1. Click **Explore** (left sidebar)
2. Click **Funnel exploration**
3. Click **Edit** on the funnel
4. Add these steps:
   - **Step 1:** `page_view` (page_path = `/create-plan`)
   - **Step 2:** `Create_Plan_Started`
   - **Step 3:** `Create_Plan_Success`
5. Click **Apply**

### 9.2 What You'll See
- How many users start creating a plan
- How many complete it
- Conversion rate at each step
- Drop-off points

---

## 🎉 Congratulations! You're Done!

Google Analytics is now tracking:

✅ **All page visits** across your entire app  
✅ **Every "Create Plan" button click**  
✅ **When users start creating a plan**  
✅ **Each step of plan generation**  
✅ **Successful plan creations**  
✅ **Any errors that occur**  
✅ **User authentication events**  
✅ **Profile updates**  
✅ **Plan exports (PDF/CSV)**  
✅ **Engagement time on each page**

---

## 📊 What to Monitor

### Daily (First Week)
- Real-Time reports to ensure tracking works
- Event counts to verify all events fire
- Console errors (if any)

### Weekly
- Total users and page views
- Plan creation success rate
- Most visited pages
- Average engagement time

### Monthly
- User growth trends
- Conversion funnel analysis
- Popular dietary preferences
- Export format preferences (PDF vs CSV)

---

## 🔍 Troubleshooting

### "Not seeing any data"
- ✅ Check environment variable is set correctly
- ✅ Verify Measurement ID format: `G-XXXXXXXXXX`
- ✅ Disable ad blockers
- ✅ Wait 24-48 hours for some reports
- ✅ Use Real-Time reports for immediate verification

### "Events not showing"
- ✅ Check browser console for errors
- ✅ Verify `REACT_APP_GA_MEASUREMENT_ID` is set
- ✅ Clear cache and reload
- ✅ Test in incognito mode

### "Build failing"
- ✅ Run `npm install` in client directory
- ✅ Check for TypeScript errors: `npm run type-check`
- ✅ Verify react-ga4 is in package.json dependencies

---

## 📚 Additional Resources

- **Quick Reference:** See `GA_SETUP.md`
- **Detailed Documentation:** See `GOOGLE_ANALYTICS.md`
- **Deployment Checklist:** See `GA_DEPLOYMENT_CHECKLIST.md`
- **Google Analytics Help:** https://support.google.com/analytics

---

## 🆘 Need Help?

If you run into issues:
1. Check browser console for error messages
2. Verify environment variable in Vercel Dashboard
3. Use GA DebugView for detailed event tracking
4. Check Real-Time reports (most reliable)

---

**You're all set! 🚀** Your Google Analytics is now collecting valuable insights about your users and how they interact with your Diet Planner app.
