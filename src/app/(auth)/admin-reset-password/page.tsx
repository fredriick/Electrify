'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement admin password reset logic
      // This would typically involve:
      // 1. Validating admin email
      // 2. Sending reset email with admin-specific template
      // 3. Logging the reset attempt for security
      
      console.log('Admin password reset attempt:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Admin Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-300">
              Password reset initiated
            </p>
          </div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">
                Reset Email Sent
              </h2>
              
              <p className="text-gray-300 mb-6">
                If an admin account with the email <span className="font-medium text-white">{email}</span> exists, you will receive a password reset link shortly.
              </p>
              
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-blue-200">
                      Security Notice
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      This reset link will expire in 15 minutes for security reasons.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/admin-login"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Admin Login
                </Link>
                
                <p className="text-xs text-gray-500">
                  Didn't receive the email? Check your spam folder or contact admin support.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Admin Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-300">
            Reset your admin password
          </p>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-200">
                Admin Access Required
              </p>
              <p className="text-xs text-red-300 mt-1">
                Only authorized administrators can reset passwords through this portal.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Reset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-200">{error}</span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                  placeholder="admin@company.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending Reset Email...
                </>
              ) : (
                <>
                  Send Reset Email
                </>
              )}
            </Button>
          </form>

          {/* Security Features */}
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Reset link expires in 15 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>All reset attempts are logged</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Email will be sent to admin address only</span>
              </div>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <Link
              href="/admin-login"
              className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Login
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Solar Panel Marketplace. Admin password resets are monitored for security.
          </p>
        </div>
      </div>
    </div>
  );
} 