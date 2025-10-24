'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { ExchangeRateManager } from '@/components/admin/ExchangeRateManager';
import { DollarSign, TrendingUp, RefreshCw } from 'lucide-react';

export default function CurrencyManagementPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Currency Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage exchange rates, currency settings, and conversion policies
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              <span>Multi-Currency System</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Currencies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Exchange Rates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">6</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <RefreshCw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Management */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Exchange Rate Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Update exchange rates, set markup percentages, and manage currency conversion policies
            </p>
          </div>
          <div className="p-6">
            <ExchangeRateManager />
          </div>
        </div>

        {/* Information */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">How It Works</h3>
          <div className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
            <p>• <strong>Base Currency:</strong> NGN (Nigerian Naira) - All internal reporting and calculations use this currency</p>
            <p>• <strong>Supported Currencies:</strong> NGN, USD, EUR, GBP - Users can view prices in their preferred currency</p>
            <p>• <strong>Automatic Detection:</strong> Nigerian users see prices in NGN, international users see USD by default</p>
            <p>• <strong>Real-time Conversion:</strong> Product prices convert automatically based on current exchange rates</p>
            <p>• <strong>Markup Management:</strong> Add percentage markup to cover conversion fees and processing costs</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
