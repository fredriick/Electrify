import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { visitorAnalyticsService } from '@/lib/visitorAnalyticsService';

export const useVisitorTracking = (pagePath: string, pageTitle?: string) => {
  const { user } = useAuth();

  useEffect(() => {
    // Track page view when component mounts
    const trackPageView = async () => {
      await visitorAnalyticsService.trackPageView(pagePath, pageTitle, user?.id);
    };

    trackPageView();

    // Track when user leaves the page
    const handleBeforeUnload = () => {
      visitorAnalyticsService.trackPageView(pagePath, pageTitle, user?.id);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pagePath, pageTitle, user?.id]);
};

export const useProductTracking = (productId: string, supplierId: string) => {
  const { user } = useAuth();

  useEffect(() => {
    // Track product view when component mounts
    const trackProductView = async () => {
      await visitorAnalyticsService.trackProductView(productId, supplierId, user?.id);
    };

    trackProductView();
  }, [productId, supplierId, user?.id]);
};


