'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';

interface SellerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSellerLogin?: (email: string, password: string) => void;
}

export function SellerLoginModal({ isOpen, onClose, onSellerLogin }: SellerLoginModalProps) {
  const { signIn, resetPassword, setProfile } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);

  const validateLoginForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotPasswordForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!forgotPasswordEmail) {
      newErrors.forgotPasswordEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      newErrors.forgotPasswordEmail = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;

    setIsLoading(true);
    
    try {
      const result = await signIn(email, password, rememberMe);
      
      if (result.data && !result.error) {
        // Fetch user profile to check role
        const profile = await authService.getProfile(result.data.user?.id);
        
        // Update the AuthContext with the fetched profile
        if (profile) {
          setProfile(profile);
        }
        
        // Check if user is a supplier
        if (profile?.role === 'SUPPLIER') {
          setShowSuccessPopup(true);
          setTimeout(() => {
            setShowSuccessPopup(false);
            handleClose();
            // Redirect to seller dashboard using router
            router.push('/dashboard');
          }, 2000);
        } else {
          setErrors({ general: 'This account is not registered as a seller. Please use the regular login or register as a seller.' });
        }
      } else {
        setErrors({ general: result.error?.message || 'Login failed. Please check your credentials.' });
      }
    } catch (error) {
      console.error('Seller login failed:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForgotPasswordForm()) return;

    setIsResettingPassword(true);
    setErrors({});
    
    try {
      const result = await resetPassword(forgotPasswordEmail);
      
      if (result.error) {
        setErrors({ forgotPasswordEmail: result.error.message || 'Failed to send reset email. Please try again.' });
      } else {
        setResetPasswordSuccess(true);
        // Auto-close after 3 seconds
        setTimeout(() => {
          setResetPasswordSuccess(false);
          setShowForgotPassword(false);
          setForgotPasswordEmail('');
        }, 3000);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ forgotPasswordEmail: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRememberMe(false);
    setErrors({});
    setIsLoading(false);
    setShowSuccessPopup(false);
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setIsResettingPassword(false);
    setResetPasswordSuccess(false);
    onClose();
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        title={showForgotPassword ? "Reset Password" : "Seller Login"}
      >
        <div className="space-y-6">
          {showForgotPassword ? (
            // Forgot Password Form
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              {resetPasswordSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Check Your Email</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Please check your email and follow the instructions to reset your password.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  {errors.forgotPasswordEmail && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.forgotPasswordEmail}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        id="forgot-email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                          errors.forgotPasswordEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your business email"
                      />
                    </div>
                    {errors.forgotPasswordEmail && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.forgotPasswordEmail}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      disabled={isResettingPassword}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      {isResettingPassword ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            // Login Form
            <form onSubmit={handleLoginSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
              </div>
            )}

            <div>
              <label htmlFor="seller-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="seller-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your business email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="seller-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="seller-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In to Seller Dashboard'
              )}
            </button>
          </form>
          )}
        </div>
      </Modal>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Login Successful!</h3>
              <p className="text-gray-600 dark:text-gray-400">Redirecting to seller dashboard...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 