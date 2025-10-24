'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Crown, AlertTriangle, CheckCircle, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function SuperAdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    twoFactorCode: ''
  });
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement super admin authentication logic
      // This would typically involve:
      // 1. Validating super admin credentials
      // 2. Checking super admin role permissions
      // 3. Two-factor authentication verification
      // 4. Setting super admin session with elevated privileges
      // 5. Redirecting to super admin dashboard
      
      console.log('Super admin login attempt:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, redirect to super admin dashboard
      router.push('/super-admin-dashboard');
    } catch (err) {
      setError('Invalid super admin credentials. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

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
            Ultimate system control and management
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
                Super Admin Access
              </p>
              <p className="text-xs text-purple-300 mt-1">
                This portal grants ultimate system control. Use with extreme caution.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Login Form */}
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
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-700/50 text-white placeholder-purple-300"
                  placeholder="superadmin@company.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                Super Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-700/50 text-white placeholder-purple-300"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            {showTwoFactor && (
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-purple-200 mb-2">
                  Two-Factor Code
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                  <input
                    type="text"
                    id="twoFactorCode"
                    value={formData.twoFactorCode}
                    onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-700/50 text-white placeholder-purple-300"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="rounded border-purple-600 text-purple-600 focus:ring-purple-500 bg-purple-700/50"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-purple-200">
                  Remember this device (30 days)
                </span>
              </label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Access Super Admin Panel
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Security Features */}
          <div className="mt-6 pt-6 border-t border-purple-700/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Multi-factor authentication required</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Session timeout: 15 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>All actions are logged and audited</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>IP address restrictions enabled</span>
              </div>
            </div>
          </div>

          {/* Help Links */}
          <div className="mt-6 pt-6 border-t border-purple-700/50">
            <div className="flex items-center justify-between text-sm">
              <Link
                href="/super-admin-reset-password"
                className="text-purple-300 hover:text-purple-200 font-medium"
              >
                Reset Password
              </Link>
              <Link
                href="/super-admin-support"
                className="text-purple-400 hover:text-purple-300"
              >
                Super Admin Support
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-purple-400">
            © 2025 Solar Panel Marketplace. Super admin access is strictly monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
} 