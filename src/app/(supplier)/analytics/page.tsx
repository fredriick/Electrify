'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { analyticsService, AnalyticsStats, SalesData, ProductPerformance, CustomerSegment, RecentActivity } from '@/lib/analyticsService';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('sales');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const { user, loading: authLoading } = useAuth();
  const { currentCurrency } = useCurrency();
  
  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'NGN': '₦',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$'
    };
    return symbols[currencyCode] || '$';
  };

  // Refresh analytics data
  const refreshAnalytics = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await analyticsService.getAnalytics(user.id, selectedPeriod);
      setAnalyticsData(data);
      setSalesData(data.salesData);
      setProductPerformance(data.productPerformance);
      setCustomerSegments(data.customerSegments);
      setRecentActivity(data.recentActivity);
    } catch (err) {
      console.error('Analytics page - Error refreshing analytics:', err);
      setError('Failed to refresh analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }
      
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }

      setLoading(true);
      try {
        const data = await analyticsService.getAnalytics(user.id, selectedPeriod);
        setAnalyticsData(data);
        setSalesData(data.salesData);
        setProductPerformance(data.productPerformance);
        setCustomerSegments(data.customerSegments);
        setRecentActivity(data.recentActivity);
      } catch (err) {
        console.error('Analytics page - Error fetching analytics:', err);
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user?.id, selectedPeriod, authLoading]);

  // Handle tab visibility changes to refresh data when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only refresh if tab becomes visible and user is authenticated
      if (!document.hidden && user?.id && !authLoading) {
        refreshAnalytics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, authLoading]);

  if (loading && !analyticsData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">No analytics data available.</div>
      </DashboardLayout>
    );
  }

  const totalRevenue = analyticsData.totalRevenue;
  const totalOrders = analyticsData.totalOrders;
  const totalCustomers = analyticsData.totalCustomers;
  const averageOrderValue = analyticsData.averageOrderValue;

  const currentMonth = salesData[salesData.length - 1];
  const previousMonth = salesData[salesData.length - 2];

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const salesGrowth = previousMonth ? calculateGrowth(currentMonth?.sales || 0, previousMonth?.sales || 0) : analyticsData.revenueGrowth;
  const ordersGrowth = previousMonth ? calculateGrowth(currentMonth?.orders || 0, previousMonth?.orders || 0) : analyticsData.ordersGrowth;
  const customersGrowth = previousMonth ? calculateGrowth(currentMonth?.customers || 0, previousMonth?.customers || 0) : analyticsData.customersGrowth;

  const handleExportAll = () => {
    // Key Metrics
    const keyMetricsRows = [
      ['KEY METRICS'],
      ['Total Revenue', totalRevenue],
      ['Total Orders', totalOrders],
      ['Total Customers', totalCustomers],
      ['Average Order Value', totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0'],
      []
    ];

    // Sales Trend
    const salesTrendRows = [
      ['SALES TREND'],
      ['Month', 'Revenue', 'Orders', 'Customers'],
      ...salesData.map(row => [
        row.month,
        `$${row.sales.toFixed(2)}`,
        row.orders,
        row.customers
      ]),
      []
    ];

    // Customer Segments
    const customerSegmentsRows = [
      ['CUSTOMER SEGMENTS'],
      ['Segment', 'Percentage'],
      ...customerSegments.map(seg => [seg.segment, `${seg.percentage}%`]),
      []
    ];

    // Recent Activity section
    const activityRows = [
      ['RECENT ACTIVITY'],
      ['Type', 'Title', 'Description', 'Amount', 'Date', 'Status'],
      ...recentActivity.map(activity => [
        activity.type,
        activity.title,
        activity.description,
        activity.amount ? `$${activity.amount.toFixed(2)}` : '',
        activity.date,
        activity.status
      ]),
      []
    ];

    // Combine all sections
    const csvContent = [
      ...keyMetricsRows,
      ...salesTrendRows,
      ...customerSegmentsRows,
      ...activityRows
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Track your business performance and insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm h-10 min-w-[140px]"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button 
                onClick={refreshAnalytics} 
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 h-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button onClick={handleExportAll} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 h-10">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {getCurrencySymbol(currentCurrency || 'NGN')}{totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {salesGrowth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    salesGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(salesGrowth).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalOrders.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {ordersGrowth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    ordersGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(ordersGrowth).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalCustomers.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {customersGrowth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    customersGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(customersGrowth).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Order Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {getCurrencySymbol(currentCurrency || 'NGN')}{totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : '0'}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium ml-1 text-green-600 dark:text-green-400">
                    8.5%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Trend Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sales Trend
                </h2>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="sales">Revenue</option>
                  <option value="orders">Orders</option>
                  <option value="customers">Customers</option>
                </select>
              </div>
              
              {/* Enhanced Bar Chart with Real Data */}
              <div className="relative h-80 bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                {/* Grid Lines */}
                <div className="absolute inset-4 flex flex-col justify-between pointer-events-none">
                  {[0, 25, 50, 75, 100].map((line) => (
                    <div key={line} className="border-t border-gray-200 dark:border-gray-700" />
                  ))}
                </div>
                {/* Y-axis labels */}
                <div className="absolute left-4 top-4 h-[calc(100%-2rem)] flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-2 pointer-events-none">
                  {(() => {
                    if (salesData.length === 0) {
                      return [100, 75, 50, 25, 0].map((percent) => (
                        <span key={percent} className="transform -translate-y-1 font-medium">
                          {selectedMetric === 'sales' ? `${getCurrencySymbol(currentCurrency || 'NGN')}0k` : '0'}
                        </span>
                      ));
                    }
                    const maxValue = Math.max(...salesData.map(d => d[selectedMetric as keyof typeof d] as number));
                    return [100, 75, 50, 25, 0].map((percent) => {
                      const value = (maxValue * percent) / 100;
                      return (
                        <span key={percent} className="transform -translate-y-1 font-medium">
                          {selectedMetric === 'sales' ? `${getCurrencySymbol(currentCurrency || 'NGN')}${(value / 1000).toFixed(0)}k` : Math.round(value)}
                        </span>
                      );
                    });
                  })()}
                </div>
                {/* Chart Bars - Responsive/Scrollable only if needed */}
                <div className={`ml-16 h-full ${salesData.length > 8 ? 'overflow-x-auto' : ''}`}>
                  <div className={`h-full flex items-end ${salesData.length > 8 ? 'space-x-4 min-w-max px-4' : 'justify-center space-x-8'} w-full`}>
                    {salesData.length === 0 ? (
                      <div className="text-gray-400 text-center w-full">No data available</div>
                    ) : (
                      salesData.map((data, index) => {
                        const maxValue = salesData.length > 0 ? Math.max(...salesData.map(d => d[selectedMetric as keyof typeof d] as number)) : 0;
                        const chartHeight = 260;
                        const value = data[selectedMetric as keyof typeof data] as number;
                        let barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
                        barHeight = Math.max(barHeight, 24); // Minimum 24px
                        const isCurrentMonth = index === salesData.length - 1;
                        return (
                          <div key={index} className="flex flex-col items-center group min-w-[60px]">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-lg">
                              <div className="font-medium">{data.month}</div>
                              <div className="text-gray-300">
                                {selectedMetric === 'sales' ? `${getCurrencySymbol(currentCurrency || 'NGN')}${data.sales.toLocaleString()}` : data[selectedMetric as keyof typeof data]}
                              </div>
                            </div>
                            {/* Bar */}
                            <div 
                              className={`w-8 rounded-t transition-all duration-300 group-hover:shadow-lg ${
                                isCurrentMonth 
                                  ? 'bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 shadow-md' 
                                  : 'bg-gradient-to-t from-gray-400 to-gray-300 hover:from-gray-300 hover:to-gray-200 dark:from-gray-600 dark:to-gray-500 dark:hover:from-gray-500 dark:hover:to-gray-400'
                              }`}
                              style={{ height: `${barHeight}px` }}
                            />
                            {/* X-axis labels */}
                            <div className="mt-3 text-center">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                {data.month}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                {/* Chart Title */}
                <div className="absolute top-4 right-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {selectedMetric === 'sales' ? 'Revenue' : selectedMetric === 'orders' ? 'Orders' : 'Customers'}
                </div>
                {/* Scroll indicator */}
                {salesData.length > 8 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 dark:text-gray-500">
                    ← Scroll to see more →
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Segments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Customer Segments
            </h2>
            
            <div className="space-y-4">
              {customerSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${segment.color} mr-3`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {segment.segment}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {segment.percentage}%
                  </span>
                </div>
              ))}
              {customerSegments.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No customer data available
                </div>
              )}
            </div>

            {/* Simple Pie Chart */}
            <div className="mt-6 relative">
              {customerSegments.length === 1 && customerSegments[0].segment === 'No Orders Yet' ? (
                <div className="w-32 h-32 mx-auto rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">No Data</span>
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)' }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 65%, 50% 65%)' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Products */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Top Performing Products
            </h2>
            
            <div className="space-y-4">
              {productPerformance.length > 0 ? (
                productPerformance.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.sales} units sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {getCurrencySymbol(currentCurrency || 'NGN')}{product.revenue.toLocaleString()}
                      </p>
                      <div className="flex items-center">
                        {product.growth >= 0 ? (
                          <ArrowUpRight className="w-3 h-3 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ml-1 ${
                          product.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {Math.abs(product.growth).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm font-medium">No products sold yet</p>
                  <p className="text-xs mt-1">Start selling to see your top performing products here</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>
            
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/20">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {activity.amount ? `${getCurrencySymbol(currentCurrency || 'NGN')}${activity.amount.toLocaleString()}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm font-medium">No recent activity</p>
                  <p className="text-xs mt-1">Orders and payments will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 