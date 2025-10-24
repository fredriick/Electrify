"use client";

import React, { useState } from "react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { 
  Settings, 
  Save, 
  Mail, 
  Globe, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building,
  Phone,
  MapPin,
  Users,
  Shield,
  Database
} from "lucide-react";

const defaultSettings = {
  siteName: "Electrify Marketplace",
  contactEmail: "support@theelectrifystore.com",
  contactPhone: "+1 (555) 123-4567",
  companyAddress: "Spring Dr road Oniru, Lagos",
  timezone: "UTC",
  currency: "USD",
  maintenanceMode: false,
  maxUsers: 10000,
  dataRetentionDays: 365,
  enableNotifications: true,
  enableAnalytics: true,
  enableBackup: true,
  securityLevel: "high"
};

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Denver", label: "America/Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (EET)" }
];

const currencies = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
  { value: "AED", label: "AED - Dirham", symbol: "د.إ" },
  { value: "INR", label: "INR - Indian Rupee", symbol: "₹" },
  { value: "CNY", label: "CNY - Yuan", symbol: "¥" },
  { value: "NGN", label: "NGN - Naira", symbol: "₦" },
  { value: "CAD", label: "CAD - Canadian Dollar", symbol: "C$" },
  { value: "AUD", label: "AUD - Australian Dollar", symbol: "A$" },
  { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥" },
  { value: "CHF", label: "CHF - Swiss Franc", symbol: "CHF" },
  { value: "SGD", label: "SGD - Singapore Dollar", symbol: "S$" }
];

const GeneralSettingsPage = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!settings.siteName.trim()) {
      newErrors.siteName = "Site name is required";
    }
    
    if (!settings.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }
    
    if (settings.contactPhone && !/^\+?[\d\s\-\(\)]+$/.test(settings.contactPhone)) {
      newErrors.contactPhone = "Please enter a valid phone number";
    }
    
    if (settings.maxUsers < 100) {
      newErrors.maxUsers = "Maximum users must be at least 100";
    }
    
    if (settings.dataRetentionDays < 30) {
      newErrors.dataRetentionDays = "Data retention must be at least 30 days";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    if (type === "checkbox") {
      setSettings((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencies.find(c => c.value === currencyCode);
    return currency?.symbol || "$";
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Settings className="w-7 h-7 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">General Settings</h1>
        </div>
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Building className="w-5 h-5 text-blue-600 mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="siteName">
              Site Name
            </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="siteName"
                name="siteName"
                type="text"
                value={settings.siteName}
                onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.siteName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter site name"
              />
            </div>
                {errors.siteName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.siteName}
                  </p>
                )}
          </div>
              
          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="contactEmail">
              Contact Email
            </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.contactEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="support@example.com"
                  />
                </div>
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.contactEmail}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="contactPhone">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={settings.contactPhone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.contactPhone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.contactPhone}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="companyAddress">
                  Company Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="companyAddress"
                    name="companyAddress"
                    type="text"
                    value={settings.companyAddress}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter company address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Globe className="w-5 h-5 text-green-600 mr-2" />
              Regional Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="timezone">
              Timezone
            </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="timezone"
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
              </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
            </div>
          </div>
              
          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="currency">
              Currency
            </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="currency"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
                  >
                    {currencies.map((curr) => (
                      <option key={curr.value} value={curr.value}>
                        {curr.label}
                      </option>
                    ))}
              </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Selected currency: {getCurrencySymbol(settings.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Database className="w-5 h-5 text-purple-600 mr-2" />
              System Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="maxUsers">
                  Maximum Users
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="maxUsers"
                    name="maxUsers"
                    type="number"
                    value={settings.maxUsers}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.maxUsers ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    min="100"
                    step="100"
                  />
                </div>
                {errors.maxUsers && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.maxUsers}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="dataRetentionDays">
                  Data Retention (Days)
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="dataRetentionDays"
                    name="dataRetentionDays"
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.dataRetentionDays ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    min="30"
                    max="3650"
                  />
                </div>
                {errors.dataRetentionDays && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.dataRetentionDays}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <input
                    id="enableNotifications"
                    name="enableNotifications"
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableNotifications" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Email Notifications
                  </label>
                </div>
                <span className="text-sm text-gray-500">Send notifications to users</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <input
                    id="enableAnalytics"
                    name="enableAnalytics"
                    type="checkbox"
                    checked={settings.enableAnalytics}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableAnalytics" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Analytics
                  </label>
                </div>
                <span className="text-sm text-gray-500">Track user behavior and performance</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <input
                    id="enableBackup"
                    name="enableBackup"
                    type="checkbox"
                    checked={settings.enableBackup}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableBackup" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Automatic Backup
                  </label>
                </div>
                <span className="text-sm text-gray-500">Daily automated backups</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center">
            <input
              id="maintenanceMode"
              name="maintenanceMode"
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={handleChange}
                    className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
                  <label htmlFor="maintenanceMode" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
              Enable Maintenance Mode
            </label>
                </div>
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Restrict access to admins only</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            {saved && (
              <div className="flex items-center text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5 mr-2" />
                Settings saved successfully!
              </div>
            )}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </SuperAdminLayout>
  );
};

export default GeneralSettingsPage; 