'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isSupplier } from '@/lib/auth';

interface SupplierProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SupplierProtectedRoute({ children, fallback }: SupplierProtectedRouteProps) {
  const { user, profile, loading, isInitialized } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [profileLoadAttempts, setProfileLoadAttempts] = useState(0);

  useEffect(() => {
    const checkAuthorization = async () => {
      // Wait for auth to finish loading
      if (loading) {
        return;
      }

      // Check if user is logged in
      if (!user) {
        router.push('/sell');
        return;
      }

      // Reset profile load attempts when we have a user
      if (profileLoadAttempts > 0) {
        setProfileLoadAttempts(0);
      }

      // Check if user has a profile - wait a bit longer for profile to load
      if (!profile) {
        setProfileLoadAttempts(prev => prev + 1);
        
        // Only redirect if we've waited long enough (more than 5 seconds)
        if (profileLoadAttempts > 50) { // 50 attempts * 100ms = 5 seconds
          router.push('/sell');
          return;
        }
        
        // Don't redirect immediately, give profile time to load
        return;
      }

      // Check if user is a supplier
      if (!isSupplier(profile)) {
        router.push('/sell');
        return;
      }

      // Check if supplier is active (if the property exists)
      if ('is_active' in profile && (profile as any).is_active === false) {
        router.push('/sell');
        return;
      }

      // All checks passed
      setIsAuthorized(true);
      setIsChecking(false);
      setProfileLoadAttempts(0); // Reset attempts when successful
    };

    // Add a small delay to ensure profile has time to load
    const timeoutId = setTimeout(() => {
      checkAuthorization();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user, profile, loading, router]);

  // Show loading state while checking
  if (!isInitialized || loading || isChecking || (user && !profile)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading authentication...' : 
             user && !profile ? 'Loading profile...' : 
             'Checking authorization...'}
          </p>
        </div>
      </div>
    );
  }

  // Show fallback or redirect if not authorized
  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You must be logged in as a supplier to access this page.</p>
          <button
            onClick={() => router.push('/sell')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // User is authorized, show the protected content
  return <>{children}</>;
} 