'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Crown, AlertTriangle, CheckCircle, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function SuperAdminResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement super admin password reset logic
      // This would typically involve:
      // 1. Validating super admin email
      // 2. Sending reset email with super admin-specific template
      // 3. Enhanced logging and security monitoring
      // 4. IP address verification
      
      console.log('Super admin password reset attempt:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Super Admin Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl mb-4 shadow-2xl relative">
              <Crown className="w-12 h-12 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-yellow-900" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Super Admin
            </h1>
            <p className="text-purple-200">
              Password reset initiated
            </p>
          </div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-purple-800/40 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-700/50 p-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">
                Reset Email Sent
              </h2>
              
              <p className="text-purple-300 mb-6">
                If a super admin account with the email <span className="font-medium text-white">{email}</span> exists, you will receive a password reset link shortly.
              </p>
              
              <div className="p-4 bg-purple-900/30 border border-purple-500/40 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-purple-200">
                      Enhanced Security Notice
                    </p>
                    <p className="text-xs text-purple-300 mt-1">
                      This reset link will expire in 10 minutes. All attempts are logged and monitored.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/super-admin-login"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Super Admin Login
                </Link>
                
                <p className="text-xs text-purple-400">
                  Didn't receive the email? Check your spam folder or contact super admin support immediately.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Super Admin Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl mb-4 shadow-2xl relative">
            <Crown className="w-12 h-12 text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Zap className="w-3 h-3 text-yellow-900" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Super Admin
          </h1>
          <p className="text-purple-200">
            Reset your super admin password
          </p>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 p-4 bg-purple-900/30 border border-purple-500/40 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-purple-300" />
            <div>
              <p className="text-sm font-medium text-purple-200">
                Super Admin Access Required
              </p>
              <p className="text-xs text-purple-300 mt-1">
                Only authorized super administrators can reset passwords through this portal.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Reset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-purple-800/40 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-700/50 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-200">{error}</span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                Super Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-700/50 text-white placeholder-purple-300"
                  placeholder="superadmin@company.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
          <div className="mt-6 pt-6 border-t border-purple-700/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Reset link expires in 10 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>All reset attempts are logged and audited</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>IP address verification required</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Multi-factor authentication enforced</span>
              </div>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-purple-700/50">
            <Link
              href="/super-admin-login"
              className="flex items-center justify-center gap-2 text-purple-300 hover:text-purple-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Super Admin Login
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-purple-400">
            © 2025 Solar Panel Marketplace. Super admin password resets are strictly monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
} 