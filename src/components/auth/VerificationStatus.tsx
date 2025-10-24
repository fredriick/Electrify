'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import { AlertCircle, CheckCircle, Mail, RefreshCw, Clock } from 'lucide-react';

interface VerificationStatusProps {
  onVerified?: () => void;
}

export default function VerificationStatus({ onVerified }: VerificationStatusProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [lastResendTime, setLastResendTime] = useState<number>(() => {
    // Check localStorage for last resend time
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lastResendTime');
      return stored ? parseInt(stored) : 0;
    }
    return 0;
  });
  const [hasShownVerificationSuccess, setHasShownVerificationSuccess] = useState(() => {
    // Check localStorage for existing verification success state
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('verificationSuccessShown');
      return stored === 'true';
    }
    return false;
  });

  const isSupplier = profile?.role === 'SUPPLIER';
  const isVerified = profile?.is_verified;

  // Calculate remaining cooldown time
  const getRemainingCooldown = () => {
    if (!lastResendTime) return 0;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    const timeSinceLastResend = now - lastResendTime;
    const remaining = fiveMinutes - timeSinceLastResend;
    return remaining > 0 ? Math.ceil(remaining / 1000 / 60) : 0;
  };

  const [remainingCooldown, setRemainingCooldown] = useState(getRemainingCooldown());
  const isResendDisabled = remainingCooldown > 0;

  // Update cooldown timer every minute
  useEffect(() => {
    if (remainingCooldown > 0) {
      const timer = setInterval(() => {
        const newRemaining = getRemainingCooldown();
        setRemainingCooldown(newRemaining);
        if (newRemaining === 0) {
          clearInterval(timer);
        }
      }, 60000); // Update every minute

      return () => clearInterval(timer);
    }
  }, [remainingCooldown, lastResendTime]);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    // Check if 5 minutes have passed since last resend
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    const timeSinceLastResend = now - lastResendTime;
    
    if (lastResendTime && timeSinceLastResend < fiveMinutes) {
      const remainingTime = Math.ceil((fiveMinutes - timeSinceLastResend) / 1000 / 60);
      alert(`Please wait ${remainingTime} minute(s) before requesting another verification email.`);
      return;
    }

    setIsResending(true);
    setResendSuccess(false);

    try {
      // Use Supabase auth to resend verification email
      const supabaseClient = await import('@/lib/auth').then(m => m.getSupabaseClient());
      if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await supabaseClient.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Error resending verification:', error);
        alert('Failed to resend verification email. Please try again.');
      } else {
        setResendSuccess(true);
        setLastResendTime(now);
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastResendTime', now.toString());
        }
        alert('Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      alert('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };



  // Track verification status changes
  useEffect(() => {
    if (isVerified && !hasShownVerificationSuccess) {
      // User just became verified, show success message once
      setHasShownVerificationSuccess(true);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('verificationSuccessShown', 'true');
      }
      if (onVerified) {
        onVerified();
      }
    } else if (!isVerified) {
      // User is not verified, reset the flag
      setHasShownVerificationSuccess(false);
      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('verificationSuccessShown');
      }
    }
  }, [isVerified, hasShownVerificationSuccess, onVerified]);

  if (!isSupplier) {
    return null;
  }

  if (isVerified && !hasShownVerificationSuccess) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              Email Verified
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your account has been verified and you can now access all features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show yellow warning if not verified
  if (!isVerified) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Email Verification Required
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 mb-3">
              Please check your email and click the verification link to activate your account.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleResendVerification}
                disabled={isResending || isResendDisabled}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                  isResendDisabled 
                    ? 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                    : 'text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-800/50 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-800/70'
                }`}
              >
                {isResending ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : isResendDisabled ? (
                  <Clock className="w-3 h-3 mr-1" />
                ) : (
                  <Mail className="w-3 h-3 mr-1" />
                )}
                {isResending 
                  ? 'Sending...' 
                  : isResendDisabled 
                    ? `Wait ${remainingCooldown}m` 
                    : 'Resend Email'
                }
              </button>
              {resendSuccess && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  Email sent!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If verified and already shown success message, don't show anything
  return null;
} 