import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

// Hook to automatically track page views when route changes
export const usePageTracking = () => {
  const location = useLocation();
  const prevLocation = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Only track if the path has actually changed
    if (currentPath !== prevLocation.current) {
      // Get page title from route
      const pageTitle = getPageTitle(location.pathname);
      trackPageView(currentPath, pageTitle);
      prevLocation.current = currentPath;
    }
  }, [location]);
};

// Helper function to get human-readable page titles
const getPageTitle = (pathname: string): string => {
  const titles: { [key: string]: string } = {
    '/': 'Landing Page',
    '/login': 'Login',
    '/register': 'Register',
    '/forgot-password': 'Forgot Password',
    '/reset-password': 'Reset Password',
    '/verify-email': 'Email Verification',
    '/dashboard': 'Dashboard',
    '/profile': 'Profile',
    '/diet-plans': 'Diet Plans',
    '/create-plan': 'Create Diet Plan',
  };

  return titles[pathname] || pathname;
};

// Hook to track engagement time on a page
export const useEngagementTracking = (pageName: string) => {
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const timeStarted = startTime.current;
    
    return () => {
      const engagementTime = Math.floor((Date.now() - timeStarted) / 1000);
      // Only track if user spent more than 3 seconds on the page
      if (engagementTime > 3) {
        // Import dynamically to avoid circular dependencies
        import('../utils/analytics').then(({ trackEngagementTime }) => {
          trackEngagementTime(pageName, engagementTime);
        });
      }
    };
  }, [pageName]);
};
