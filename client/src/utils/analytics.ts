import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = (measurementId?: string) => {
  const gaId = measurementId || process.env.REACT_APP_GA_MEASUREMENT_ID;
  
  if (gaId) {
    ReactGA.initialize(gaId, {
      gaOptions: {
        debug_mode: process.env.NODE_ENV === 'development',
      },
    });
    console.log('Google Analytics initialized with ID:', gaId);
  } else {
    console.warn('Google Analytics measurement ID not found. Please set REACT_APP_GA_MEASUREMENT_ID in your environment variables.');
  }
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title || document.title,
  });
  console.log('GA Page View:', path, title);
};

// Track custom events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
  console.log('GA Event:', { category, action, label, value });
};

// Specific tracking functions for diet planner app

// Track when user clicks "Create Plan" button
export const trackCreatePlanClick = () => {
  trackEvent('Diet Plan', 'Create Plan Clicked', 'User clicked create plan button');
};

// Track when user starts creating a plan
export const trackCreatePlanStart = (planName: string) => {
  trackEvent('Diet Plan', 'Create Plan Started', planName);
};

// Track when user successfully creates a plan
export const trackCreatePlanSuccess = (planName: string, preferences?: string[]) => {
  trackEvent(
    'Diet Plan',
    'Create Plan Success',
    `Plan: ${planName} | Preferences: ${preferences?.join(', ') || 'None'}`
  );
};

// Track when plan creation fails
export const trackCreatePlanError = (errorMessage: string) => {
  trackEvent('Diet Plan', 'Create Plan Error', errorMessage);
};

// Track plan generation progress
export const trackPlanGenerationProgress = (stage: string, day?: string) => {
  trackEvent('Diet Plan', 'Generation Progress', `Stage: ${stage} | Day: ${day || 'N/A'}`);
};

// Track user navigation
export const trackNavigation = (from: string, to: string) => {
  trackEvent('Navigation', 'Page Change', `From: ${from} to: ${to}`);
};

// Track user authentication events
export const trackAuth = (action: 'login' | 'logout' | 'register') => {
  trackEvent('Authentication', action.charAt(0).toUpperCase() + action.slice(1), action);
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('Button Click', buttonName, location);
};

// Track form submissions
export const trackFormSubmission = (formName: string, success: boolean) => {
  trackEvent('Form Submission', formName, success ? 'Success' : 'Failed');
};

// Track profile updates
export const trackProfileUpdate = (field: string) => {
  trackEvent('Profile', 'Update', field);
};

// Track diet plan views
export const trackDietPlanView = (planId: string, planName: string) => {
  trackEvent('Diet Plan', 'View Plan', `${planId} - ${planName}`);
};

// Track diet plan exports
export const trackDietPlanExport = (planId: string, format: 'PDF' | 'CSV') => {
  trackEvent('Diet Plan', 'Export Plan', `Format: ${format} | Plan ID: ${planId}`);
};

// Track diet plan deletions
export const trackDietPlanDelete = (planId: string) => {
  trackEvent('Diet Plan', 'Delete Plan', planId);
};

// Track user engagement time
export const trackEngagementTime = (pageName: string, timeInSeconds: number) => {
  trackEvent('Engagement', 'Time on Page', pageName, timeInSeconds);
};

// Track errors
export const trackError = (errorType: string, errorMessage: string, location: string) => {
  trackEvent('Error', errorType, `${location}: ${errorMessage}`);
};
