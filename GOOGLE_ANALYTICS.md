# Google Analytics Implementation Guide

## Overview

This document describes the extensive Google Analytics (GA4) implementation for tracking user behavior and plan creation in the Diet Planner application.

## Setup Instructions

### 1. Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property for your website
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Configure Environment Variables

Add your Google Analytics Measurement ID to your environment variables:

**Development (.env.local):**
```bash
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Production (Vercel Dashboard):**
```bash
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Deploy

The Google Analytics tracking will automatically start working once the environment variable is set.

## What's Being Tracked

### Page Views
All page navigation is automatically tracked, including:
- Landing Page (`/`)
- Login Page (`/login`)
- Register Page (`/register`)
- Dashboard (`/dashboard`)
- Profile Page (`/profile`)
- Diet Plans Page (`/diet-plans`)
- Create Plan Page (`/create-plan`)
- Forgot Password (`/forgot-password`)
- Reset Password (`/reset-password`)
- Email Verification (`/verify-email`)

### Diet Plan Creation Events

#### 1. Create Plan Button Clicks
**Event Category:** Diet Plan  
**Event Action:** Create Plan Clicked  
**Tracked When:** User clicks any "Create Plan" button
- Dashboard: "Create Your First Plan" button
- Dashboard: "Create New Plan" button (when plans exist)
- Diet Plans Page: "Create New Plan" button (header)
- Diet Plans Page: "Create Your First Plan" button (empty state)

#### 2. Plan Creation Started
**Event Category:** Diet Plan  
**Event Action:** Create Plan Started  
**Event Label:** Plan name  
**Tracked When:** User submits the form to start generating a plan

#### 3. Plan Generation Progress
**Event Category:** Diet Plan  
**Event Action:** Generation Progress  
**Event Label:** Stage and day information  
**Tracked When:** Each stage of the plan generation:
- `start` - Generation begins
- `progress` - Each day being generated
- `day_complete` - Each day completed
- `plan_complete` - All days generated

#### 4. Successful Plan Creation
**Event Category:** Diet Plan  
**Event Action:** Create Plan Success  
**Event Label:** Plan name and preferences  
**Tracked When:** Plan is successfully generated and saved to database

#### 5. Failed Plan Creation
**Event Category:** Diet Plan  
**Event Action:** Create Plan Error  
**Event Label:** Error message  
**Tracked When:** Plan creation fails at any stage

### User Authentication Events

#### Login
**Event Category:** Authentication  
**Event Action:** Login  
**Tracked When:** User successfully logs in

#### Register
**Event Category:** Authentication  
**Event Action:** Register  
**Tracked When:** User successfully registers

#### Logout
**Event Category:** Authentication  
**Event Action:** Logout  
**Tracked When:** User logs out

### Form Submissions
**Event Category:** Form Submission  
**Event Action:** Form name  
**Event Label:** Success or Failed  
**Tracked Forms:**
- Login form
- Registration form
- Profile update form

### Profile Updates
**Event Category:** Profile  
**Event Action:** Update  
**Event Label:** Updated fields  
**Tracked When:** User updates their profile information

### Diet Plan Management

#### View Plan
**Event Category:** Diet Plan  
**Event Action:** View Plan  
**Event Label:** Plan ID and name  

#### Export Plan (PDF)
**Event Category:** Diet Plan  
**Event Action:** Export Plan  
**Event Label:** Format: PDF | Plan ID  
**Tracked When:** User exports a plan as PDF

#### Export Plan (CSV)
**Event Category:** Diet Plan  
**Event Action:** Export Plan  
**Event Label:** Format: CSV | Plan ID  
**Tracked When:** User exports a plan as CSV

#### Delete Plan
**Event Category:** Diet Plan  
**Event Action:** Delete Plan  
**Event Label:** Plan ID  
**Tracked When:** User deletes a diet plan

#### Set Active Plan
**Event Category:** Button Click  
**Event Action:** Set Active Plan  
**Event Label:** Diet Plans  
**Tracked When:** User sets a plan as active

### Button Clicks
**Event Category:** Button Click  
**Event Action:** Button name  
**Event Label:** Location  
**Tracked Buttons:**
- Next/Back buttons in Create Plan wizard
- Dietary preference selections
- Navigation buttons

### Engagement Time
**Event Category:** Engagement  
**Event Action:** Time on Page  
**Event Label:** Page name  
**Event Value:** Time in seconds  
**Tracked When:** User leaves a page (minimum 3 seconds)
**Tracked Pages:**
- Landing
- Login
- Register
- Dashboard
- Create Plan
- Diet Plans
- Profile

## Implementation Details

### Files Structure

```
client/src/
├── utils/
│   └── analytics.ts          # Core GA tracking functions
├── hooks/
│   └── useAnalytics.ts       # React hooks for page tracking & engagement
└── pages/ & components/       # Tracking integrated throughout
```

### Key Functions

#### `initGA(measurementId?: string)`
Initializes Google Analytics with the measurement ID from environment variables.

#### `trackPageView(path: string, title?: string)`
Tracks page views automatically on route changes.

#### `trackEvent(category, action, label?, value?)`
Core function for tracking custom events.

#### Specialized Tracking Functions
- `trackCreatePlanClick()` - Track "Create Plan" button clicks
- `trackCreatePlanStart(planName)` - Track plan creation initiation
- `trackCreatePlanSuccess(planName, preferences)` - Track successful plan creation
- `trackCreatePlanError(errorMessage)` - Track plan creation errors
- `trackPlanGenerationProgress(stage, day)` - Track generation progress
- `trackAuth(action)` - Track authentication events
- `trackProfileUpdate(field)` - Track profile updates
- `trackDietPlanExport(planId, format)` - Track plan exports
- `trackDietPlanDelete(planId)` - Track plan deletions
- `trackButtonClick(buttonName, location)` - Track button interactions
- `trackFormSubmission(formName, success)` - Track form submissions
- `trackEngagementTime(pageName, timeInSeconds)` - Track time spent on pages

### Custom Hooks

#### `usePageTracking()`
Automatically tracks page views when routes change. Used in App.tsx.

#### `useEngagementTracking(pageName: string)`
Tracks how long users spend on each page. Cleanup occurs on unmount.

## Viewing Analytics Data

### In Google Analytics Dashboard

1. **Real-Time Reports**: See live user activity
   - Go to Reports > Realtime

2. **Events**: View all custom events
   - Go to Reports > Engagement > Events
   - Filter by event name:
     - `Create Plan Clicked`
     - `Create Plan Started`
     - `Create Plan Success`
     - `Create Plan Error`
     - `Generation Progress`
     - etc.

3. **Conversions**: Set up key events as conversions
   - Go to Admin > Events > Mark as conversion
   - Recommended conversions:
     - `Create Plan Success`
     - `Login`
     - `Register`

4. **User Flow**: See how users navigate
   - Go to Reports > Engagement > Pages and screens

5. **Custom Reports**: Create funnels and explore data
   - Go to Explore
   - Create funnel for:
     - Landing → Register → Create Plan → Success

## Key Metrics to Monitor

### Plan Creation Funnel
1. **Create Plan Button Clicks** → How many users click "Create Plan"
2. **Create Plan Started** → How many actually submit the form
3. **Create Plan Success** → How many successfully complete creation
4. **Conversion Rate** → Success / Clicks

### User Engagement
- Average time on Create Plan page
- Number of preferences selected
- Plan generation time (from start to complete events)
- Return visits after creating a plan

### Most Popular Features
- Which dietary preferences are most selected
- PDF vs CSV exports
- Active plan changes
- Profile update frequency

### User Journey
- Path from landing to first plan creation
- Drop-off points in registration
- Time between registration and first plan

## Privacy & Compliance

- No personally identifiable information (PII) is sent to Google Analytics
- User IDs are not tracked
- Plan names and preferences are anonymized in labels
- Complies with GDPR and privacy best practices

## Testing

### Development Testing
When running locally, the analytics will log to console:
```
GA Page View: /create-plan Create Diet Plan
GA Event: {category: "Diet Plan", action: "Create Plan Started", label: "My Plan"}
```

### Production Testing
1. Open browser developer tools
2. Go to Network tab
3. Filter by "google-analytics" or "collect"
4. Interact with the app
5. See POST requests to GA endpoints

## Troubleshooting

### Analytics Not Working
1. Check if `REACT_APP_GA_MEASUREMENT_ID` is set
2. Verify the format is `G-XXXXXXXXXX`
3. Check browser console for initialization message
4. Disable ad blockers for testing

### Events Not Showing
1. Wait 24-48 hours for data to appear in some reports
2. Use Real-Time reports for immediate verification
3. Check console logs in development mode
4. Verify event names match between code and GA4 dashboard

## Future Enhancements

Potential additions:
- User demographics (with consent)
- A/B testing for plan creation flow
- Enhanced e-commerce tracking for premium features
- Custom dimensions for plan types
- Goal completions and conversions
- User segmentation by activity level
- Cohort analysis for retention
