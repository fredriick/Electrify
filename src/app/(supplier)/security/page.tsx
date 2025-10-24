"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { securityService, PasswordUpdateResult } from '@/lib/securityService';

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] });

  const { user, loading: authLoading } = useAuth();

  // Validate password strength when new password changes
  useEffect(() => {
    if (newPassword) {
      securityService.validatePassword(newPassword).then(setPasswordStrength);
    } else {
      setPasswordStrength({ isValid: false, errors: [] });
    }
  }, [newPassword]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate passwords match
      if (!securityService.passwordsMatch(newPassword, confirmPassword)) {
        setError("New passwords do not match.");
        setLoading(false);
        return;
      }

      // Validate password strength
      if (!passwordStrength.isValid) {
        setError("Password does not meet security requirements.");
        setLoading(false);
        return;
      }

      // Update password using real service
      console.log('Attempting to update password...');
      console.log('Current password length:', currentPassword.length);
      console.log('New password length:', newPassword.length);
      
      const result: PasswordUpdateResult = await securityService.updatePassword(currentPassword, newPassword);
      
      console.log('Password update result:', result);

      if (result.success) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStrength({ isValid: false, errors: [] });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to update password");
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-xl mx-auto text-center text-red-500">
          Please log in to access security settings.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Change your password and manage security settings</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-4 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            Password changed successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${passwordStrength.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-xs ${passwordStrength.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordStrength.isValid ? 'Strong password' : 'Weak password'}
                  </span>
                </div>
                {passwordStrength.errors.length > 0 && (
                  <div className="text-xs text-red-600 space-y-1">
                    {passwordStrength.errors.map((error, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password match indicator */}
            {confirmPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${securityService.passwordsMatch(newPassword, confirmPassword) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-xs ${securityService.passwordsMatch(newPassword, confirmPassword) ? 'text-green-600' : 'text-red-600'}`}>
                    {securityService.passwordsMatch(newPassword, confirmPassword) ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !passwordStrength.isValid || !securityService.passwordsMatch(newPassword, confirmPassword)}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
} 