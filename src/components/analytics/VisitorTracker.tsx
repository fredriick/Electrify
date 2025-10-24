'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { visitorAnalyticsService } from '@/lib/visitorAnalyticsService';

export const VisitorTracker = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    // Create visitor session if it doesn't exist
    const createSession = async () => {
      try {
        await visitorAnalyticsService.createVisitorSession(user?.id);
      } catch (error) {
        // Silently handle errors to prevent interference with main functionality
        console.warn('Visitor session creation failed:', error);
      }
    };

    createSession();
  }, [user?.id]);

  useEffect(() => {
    // Track page view when route changes
    const trackPageView = async () => {
      try {
        const pageTitle = document.title;
        await visitorAnalyticsService.trackPageView(pathname, pageTitle, user?.id);
      } catch (error) {
        // Silently handle errors to prevent interference with main functionality
        console.warn('Page view tracking failed:', error);
      }
    };

    trackPageView();
  }, [pathname, user?.id]);

  return null; // This component doesn't render anything
};


