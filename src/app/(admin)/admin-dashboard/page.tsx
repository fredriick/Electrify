'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { adminDashboardService, AdminDashboardStats, RecentActivity, SystemMetric } from '@/lib/adminDashboardService';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Settings,
  BarChart3,
  Activity
} from 'lucide-react';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper function to format numbers
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await adminDashboardService.getDashboardData(selectedPeriod);
        setStats(data.stats);
        setRecentActivities(data.recentActivities);
        setSystemMetrics(data.systemMetrics);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setNotification({ type: 'error', message: 'Failed to load dashboard data' });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedPeriod]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleExport = async () => {
    if (!stats) return;
    
    setIsExporting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      const csvContent = [
        'Title,Value,Change',
        `Total Revenue,${formatCurrency(stats.totalRevenue)},${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}%`,
        `Active Users,${formatNumber(stats.activeUsers)},${stats.usersChange > 0 ? '+' : ''}${stats.usersChange}%`,
        `Products Listed,${formatNumber(stats.productsListed)},${stats.productsChange > 0 ? '+' : ''}${stats.productsChange}%`,
        `Pending Orders,${formatNumber(stats.pendingOrders)},${stats.ordersChange > 0 ? '+' : ''}${stats.ordersChange}%`
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `admin_report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setNotification({ type: 'success', message: 'Report exported successfully!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to export report.' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setNotification(null), 2500);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              System Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor platform performance and user activity
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Custom Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="flex items-center px-5 py-2 bg-white dark:bg-gray-100 border border-gray-200 dark:border-gray-300 rounded-lg shadow-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setDropdownOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
              >
                {periodOptions.find(opt => opt.value === selectedPeriod)?.label}
                <svg className={`ml-2 w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1" role="listbox">
                  {periodOptions.map(option => (
                    <li
                      key={option.value}
                      className={`px-5 py-2 cursor-pointer hover:bg-blue-50 ${selectedPeriod === option.value ? 'bg-blue-100 font-semibold' : ''}`}
                      onClick={() => { setSelectedPeriod(option.value); setDropdownOpen(false); }}
                      role="option"
                      aria-selected={selectedPeriod === option.value}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${isExporting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isExporting ? (
                <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              ) : null}
              Generate Report
            </button>
          </div>
        </div>
        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg border ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))
          ) : stats ? (
            [
              {
                title: 'Total Revenue',
                value: formatCurrency(stats.totalRevenue),
                change: `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}%`,
                changeType: stats.revenueChange >= 0 ? 'increase' : 'decrease',
                icon: DollarSign,
                color: 'from-green-500 to-green-600'
              },
              {
                title: 'Active Users',
                value: formatNumber(stats.activeUsers),
                change: `${stats.usersChange > 0 ? '+' : ''}${stats.usersChange}%`,
                changeType: stats.usersChange >= 0 ? 'increase' : 'decrease',
                icon: Users,
                color: 'from-blue-500 to-blue-600'
              },
              {
                title: 'Products Listed',
                value: formatNumber(stats.productsListed),
                change: `${stats.productsChange > 0 ? '+' : ''}${stats.productsChange}%`,
                changeType: stats.productsChange >= 0 ? 'increase' : 'decrease',
                icon: Package,
                color: 'from-purple-500 to-purple-600'
              },
              {
                title: 'Pending Orders',
                value: formatNumber(stats.pendingOrders),
                change: `${stats.ordersChange > 0 ? '+' : ''}${stats.ordersChange}%`,
                changeType: stats.ordersChange >= 0 ? 'increase' : 'decrease',
                icon: ShoppingCart,
                color: 'from-orange-500 to-orange-600'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'increase' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ml-1 ${
                        stat.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        vs last period
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-4 text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Failed to load dashboard data</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activities
                </h2>
                <button className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'pending' ? 'bg-yellow-500' :
                      activity.status === 'completed' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                System Metrics
              </h2>
              
              <div className="space-y-4">
                {systemMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {metric.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {metric.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {metric.value}
                      </p>
                      <div className={`flex items-center text-xs ${
                        metric.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                        metric.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {metric.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                        {metric.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                        {metric.trend === 'stable' && <span>—</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/users" className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <Users className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">User Management</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Manage users</p>
                </Link>
                
                <Link href="/admin/products" className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <Package className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Products</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Review products</p>
                </Link>
                
                <Link href="/admin/orders" className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <ShoppingCart className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Orders</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Monitor orders</p>
                </Link>
                
                <Link href="/admin/payouts" className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Payouts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Process seller payouts</p>
                </Link>
                
                <Link href="/admin/system/settings" className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <Settings className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">System Settings</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Configure platform</p>
                </Link>
                
                <Link href="/admin/currency" className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Currency Management</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Manage exchange rates</p>
                </Link>
                
                <Link href="/admin/vat-management" className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <Shield className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">VAT Management</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Manage country VAT rates</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security Status
              </h2>
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    All systems secure
                  </span>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    SSL Certificate valid
                  </span>
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    No security threats
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AdminLayout>
    </AdminRoute>
  );
} 
 
 
 
 