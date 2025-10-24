'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { dashboardService, DashboardData, DashboardStats } from '@/lib/dashboardService';
import VerificationStatus from '@/components/auth/VerificationStatus';
import Link from 'next/link';

export default function SupplierDashboard() {
  const { user, profile } = useAuth();
  const { currentCurrency, formatCurrency, getCurrencySymbol } = useCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Cache data for 5 minutes (300000ms)
  const CACHE_DURATION = 5 * 60 * 1000;

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || !profile) {
        setLoading(false);
        return;
      }

      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime;
      
      // Skip loading if data is fresh and not initial load
      if (!isInitialLoad && dashboardData && timeSinceLastFetch < CACHE_DURATION) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const data = await dashboardService.getDashboardData(user.id, selectedPeriod);
        setDashboardData(data);
        setLastFetchTime(now);
        setIsInitialLoad(false);
      } catch (error) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, profile?.id, selectedPeriod]); // Only depend on IDs, not full objects

  // Handle tab visibility changes to prevent unnecessary reloads
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only refresh if tab becomes visible AND data is stale (older than cache duration)
      if (!document.hidden && dashboardData) {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTime;
        
        // Only refresh if data is actually stale
        if (timeSinceLastFetch >= CACHE_DURATION) {
          refreshDashboard();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dashboardData, lastFetchTime]); // Only depend on what we actually need

  // Manual refresh function
  const refreshDashboard = async () => {
    if (!user || !profile) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Force refresh with fresh data
      const data = await dashboardService.forceRefreshDashboardData(user.id, selectedPeriod);
      setDashboardData(data);
      setLastFetchTime(Date.now());
    } catch (error) {
      setError('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format percentage change
  const formatPercentageChange = (change: number | undefined): string => {
    if (change === undefined || change === null) return '+0.0%';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  // Helper function to get currency symbol (using context function)
  // const getCurrencySymbol = (currencyCode: string) => {
  //   const currencySymbols: { [key: string]: string } = {
  //     'USD': '$',
  //     'EUR': '€',
  //     'GBP': '£',
  //     'NGN': '₦'
  //   };
  //   return currencySymbols[currencyCode] || currencyCode;
  // };

  // Export report functionality
  const handleExportReport = async () => {
    if (!dashboardData) {
      alert('No data available to export');
      return;
    }

    setExporting(true);

    try {
      const reportData = {
        period: selectedPeriod,
        generatedAt: new Date().toISOString(),
        stats: dashboardData.stats,
        recentOrders: dashboardData.recentOrders,
        topProducts: dashboardData.topProducts
      };

      // Create CSV content
      const csvContent = generateCSVReport(reportData);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      alert('Report exported successfully!');
    } catch (error) {
      alert('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Generate CSV report
  const generateCSVReport = (data: any) => {
    const periodLabels = {
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days', 
      '90d': 'Last 90 Days',
      '1y': 'Last Year'
    };

    let csv = `Dashboard Report - ${periodLabels[data.period as keyof typeof periodLabels]}\n`;
    csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n\n`;
    
    // Stats section
    csv += 'Key Metrics\n';
    csv += 'Metric,Value,Change\n';
    csv += `Total Sales,${dashboardService.formatCurrency(data.stats.totalSales, currentCurrency)},${formatPercentageChange(data.stats.salesChange)}\n`;
    csv += `Orders,${data.stats.totalOrders},${formatPercentageChange(data.stats.ordersChange)}\n`;
    csv += `Products,${data.stats.totalProducts},${formatPercentageChange(data.stats.productsChange)}\n`;
    csv += `Customers,${data.stats.totalCustomers},${formatPercentageChange(data.stats.customersChange)}\n\n`;
    
    csv += 'Additional Metrics\n';
    csv += 'Metric,Value\n';
    csv += `Conversion Rate,${dashboardService.formatPercentage(data.stats.conversionRate)}\n`;
    csv += `Average Order Value,${dashboardService.formatCurrency(data.stats.averageOrderValue, currentCurrency)}\n`;
    csv += `Refund Rate,${dashboardService.formatPercentage(data.stats.refundRate)}\n`;
    csv += `Repeat Customers,${dashboardService.formatPercentage(data.stats.repeatCustomers)}\n\n`;
    
    csv += 'Recent Orders\n';
    csv += 'Order Number,Customer,Amount,Status,Date\n';
    data.recentOrders.forEach((order: any) => {
      csv += `${order.order_number},${order.customer_name},${dashboardService.formatCurrency(order.total_amount, currentCurrency)},${order.status},${new Date(order.created_at).toLocaleDateString()}\n`;
    });
    csv += '\n';
    
    csv += 'Top Products\n';
    csv += 'Product Name,Sales Count,Revenue,Rating\n';
    data.topProducts.forEach((product: any) => {
      csv += `${product.name},${product.sales_count},${dashboardService.formatCurrency(product.total_revenue, currentCurrency)},${product.rating}\n`;
    });
    
    return csv;
  };

  // Generate stats array from real data
  const getStatsArray = (stats: DashboardStats | null) => {
    // Always return the 4 stats cards, even with 0 values
    return [
      {
        title: 'Total Sales',
        value: stats ? dashboardService.formatCurrency(stats.totalSales, currentCurrency) : `${getCurrencySymbol(currentCurrency)}0.00`,
        change: formatPercentageChange(stats?.salesChange),
        changeType: (stats?.salesChange || 0) >= 0 ? 'increase' as const : 'decrease' as const,
        icon: DollarSign,
        color: 'from-green-500 to-green-600'
      },
      {
        title: 'Orders',
        value: stats ? stats.totalOrders.toString() : '0',
        change: formatPercentageChange(stats?.ordersChange),
        changeType: (stats?.ordersChange || 0) >= 0 ? 'increase' as const : 'decrease' as const,
        icon: ShoppingCart,
        color: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Products',
        value: stats ? stats.totalProducts.toString() : '0',
        change: formatPercentageChange(stats?.productsChange),
        changeType: (stats?.productsChange || 0) >= 0 ? 'increase' as const : 'decrease' as const,
        icon: Package,
        color: 'from-purple-500 to-purple-600'
      },
      {
        title: 'Customers',
        value: stats ? stats.totalCustomers.toString() : '0',
        change: formatPercentageChange(stats?.customersChange),
        changeType: (stats?.customersChange || 0) >= 0 ? 'increase' as const : 'decrease' as const,
        icon: Users,
        color: 'from-orange-500 to-orange-600'
      }
    ];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show welcome message for new suppliers with no data (commented out to show full dashboard)
  // if (dashboardData && 
  //     dashboardData.stats.totalOrders === 0 && 
  //     dashboardData.stats.totalProducts === 0) {
  //   return (
  //     <DashboardLayout>
  //       <div className="p-6">
  //         <div className="max-w-2xl">
  //           {/* Page Header */}
  //           <div className="mb-8">
  //             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
  //               Dashboard
  //             </h1>
  //             <p className="text-gray-600 dark:text-gray-300 mt-1">
  //               Welcome to your seller dashboard! Get started by adding products and receiving orders.
  //             </p>
  //           </div>

  //           {/* Welcome Card */}
  //           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
  //             <div className="text-center">
  //               <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
  //                 <Package className="w-8 h-8 text-primary-600 dark:text-primary-400" />
  //               </div>
  //               <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
  //                 Welcome to Your Seller Dashboard!
  //               </h2>
  //               <p className="text-gray-600 dark:text-gray-400 mb-6">
  //                 You're all set up! Here's what you can do to get started:
  //               </p>
                
  //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  //                 <div className="text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
  //                   <h3 className="font-medium text-gray-900 dark:text-white mb-2">1. Add Products</h3>
  //                   <p className="text-sm text-gray-600 dark:text-gray-400">
  //                     Start by adding your products to your inventory. This will help customers discover your offerings.
  //                   </p>
  //                 </div>
  //                 <div className="text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
  //                   <div className="text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
  //                     <h3 className="font-medium text-gray-900 dark:text-white mb-2">2. Manage Orders</h3>
  //                     <p className="text-sm text-gray-600 dark:text-gray-400">
  //                       Once customers start ordering, you'll see them here and can manage the fulfillment process.
  //                     </p>
  //                   </div>
  //                 </div>

  //                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
  //                   <Link 
  //                     href="/inventory"
  //                     className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
  //                   >
  //                     Add Your First Product
  //                   </Link>
  //                   <Link 
  //                     href="/orders"
  //                     className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
  //                   >
  //                     View Orders
  //                   </Link>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  const stats = getStatsArray(dashboardData?.stats || null);

  return (
    <DashboardLayout>
      <div>
        {/* Verification Status */}
        <VerificationStatus />
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-44">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={refreshDashboard}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={handleExportReport}
              disabled={exporting || !dashboardData}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                exporting || !dashboardData 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {exporting ? 'Exporting...' : 'Export Report'}
          </button>
          </div>
        </div>

                {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
          ))}
        </div>

        {/* Business Metrics Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Business Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-start">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Conversion Rate</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.stats ? dashboardService.formatPercentage(dashboardData.stats.conversionRate) : '0.0%'}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-start">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average Order Value</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.stats ? dashboardService.formatCurrency(dashboardData.stats.averageOrderValue, currentCurrency) : `${getCurrencySymbol(currentCurrency)}0.00`}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-start">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Refund Rate</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.stats ? dashboardService.formatPercentage(dashboardData.stats.refundRate) : '0.0%'}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-start">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Repeat Customers</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.stats ? dashboardService.formatPercentage(dashboardData.stats.repeatCustomers) : '0.0%'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Orders
                </h2>
                <Link href="/orders" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{order.order_number}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {dashboardService.formatCurrency(order.total_amount, currentCurrency)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dashboardService.getStatusColor(order.status)
                        }`}>
                          {dashboardService.getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No recent orders found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Products
              </h2>
              <Link href="/inventory" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
                {dashboardData?.topProducts && dashboardData.topProducts.length > 0 ? (
                  dashboardData.topProducts.map((product) => (
                    <div key={product.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.sales_count} sales • {dashboardService.formatCurrency(product.total_revenue, currentCurrency)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No products found.</p>
                )}
              </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
 
 
 
 
 