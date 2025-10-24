'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  Eye,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  productGrowth: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  topSuppliers: Array<{ name: string; orders: number; revenue: number }>;
  orderStatusDistribution: Array<{ status: string; count: number; percentage: number }>;
  userRegistrations: Array<{ month: string; customers: number; suppliers: number }>;
  revenueByCategory: Array<{ category: string; revenue: number; percentage: number }>;
  recentActivity: Array<{ type: string; description: string; time: string; user: string }>;
}

const mockAnalyticsData: AnalyticsData = {
  totalRevenue: 1250000,
  totalOrders: 2847,
  totalUsers: 1243,
  totalProducts: 567,
  revenueGrowth: 12.5,
  orderGrowth: 8.3,
  userGrowth: 15.7,
  productGrowth: 6.2,
  monthlyRevenue: [
    { month: 'Jan', revenue: 85000 },
    { month: 'Feb', revenue: 92000 },
    { month: 'Mar', revenue: 105000 },
    { month: 'Apr', revenue: 98000 },
    { month: 'May', revenue: 112000 },
    { month: 'Jun', revenue: 125000 },
    { month: 'Jul', revenue: 118000 },
    { month: 'Aug', revenue: 132000 },
    { month: 'Sep', revenue: 145000 },
    { month: 'Oct', revenue: 138000 },
    { month: 'Nov', revenue: 156000 },
    { month: 'Dec', revenue: 168000 }
  ],
  topProducts: [
    { name: 'Premium Solar Panel 400W', sales: 234, revenue: 70194 },
    { name: 'Smart Inverter 3000W', sales: 189, revenue: 113399 },
    { name: 'Lithium Battery Pack 10kWh', sales: 67, revenue: 167499 },
    { name: 'Solar Mounting Kit', sales: 445, revenue: 40045 },
    { name: 'Solar Cable Set 10m', sales: 312, revenue: 10917 }
  ],
  topSuppliers: [
    { name: 'SolarTech Inc.', orders: 456, revenue: 234000 },
    { name: 'PowerMax Systems', orders: 389, revenue: 198000 },
    { name: 'Tesla Energy', orders: 234, revenue: 156000 },
    { name: 'Energy Store Pro', orders: 567, revenue: 89000 },
    { name: 'LG Energy Solutions', orders: 289, revenue: 67000 }
  ],
  orderStatusDistribution: [
    { status: 'Delivered', count: 1890, percentage: 66.4 },
    { status: 'Processing', count: 456, percentage: 16.0 },
    { status: 'Shipped', count: 234, percentage: 8.2 },
    { status: 'Pending', count: 167, percentage: 5.9 },
    { status: 'Cancelled', count: 100, percentage: 3.5 }
  ],
  userRegistrations: [
    { month: 'Jan', customers: 45, suppliers: 12 },
    { month: 'Feb', customers: 52, suppliers: 15 },
    { month: 'Mar', customers: 67, suppliers: 18 },
    { month: 'Apr', customers: 58, suppliers: 14 },
    { month: 'May', customers: 73, suppliers: 22 },
    { month: 'Jun', customers: 89, suppliers: 25 },
    { month: 'Jul', customers: 76, suppliers: 20 },
    { month: 'Aug', customers: 94, suppliers: 28 },
    { month: 'Sep', customers: 108, suppliers: 32 },
    { month: 'Oct', customers: 95, suppliers: 26 },
    { month: 'Nov', customers: 112, suppliers: 35 },
    { month: 'Dec', customers: 125, suppliers: 38 }
  ],
  revenueByCategory: [
    { category: 'Solar Panels', revenue: 450000, percentage: 36.0 },
    { category: 'Inverters', revenue: 280000, percentage: 22.4 },
    { category: 'Batteries', revenue: 320000, percentage: 25.6 },
    { category: 'Accessories', revenue: 120000, percentage: 9.6 },
    { category: 'Controllers', revenue: 80000, percentage: 6.4 }
  ],
  recentActivity: [
    { type: 'order', description: 'New order placed', time: '2 minutes ago', user: 'John Smith' },
    { type: 'user', description: 'New supplier registered', time: '15 minutes ago', user: 'SolarTech Pro' },
    { type: 'product', description: 'Product approved', time: '1 hour ago', user: 'Admin' },
    { type: 'dispute', description: 'Dispute resolved', time: '2 hours ago', user: 'Emily Wilson' },
    { type: 'order', description: 'Order delivered', time: '3 hours ago', user: 'Mike Davis' }
  ]
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case 'user': return <Users className="w-4 h-4 text-green-500" />;
      case 'product': return <Package className="w-4 h-4 text-purple-500" />;
      case 'dispute': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const exportAnalyticsReport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const timeRangeText = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '3m': 'Last 3 months',
      '6m': 'Last 6 months',
      '12m': 'Last 12 months'
    }[timeRange];

    // Create comprehensive report data
    const reportData = {
      reportInfo: [
        ['Analytics Report', ''],
        ['Generated Date', new Date().toLocaleDateString()],
        ['Time Range', timeRangeText],
        ['', '']
      ],
      keyMetrics: [
        ['Key Metrics', ''],
        ['Total Revenue', formatCurrency(mockAnalyticsData.totalRevenue)],
        ['Total Orders', formatNumber(mockAnalyticsData.totalOrders)],
        ['Total Users', formatNumber(mockAnalyticsData.totalUsers)],
        ['Total Products', formatNumber(mockAnalyticsData.totalProducts)],
        ['Revenue Growth', `${mockAnalyticsData.revenueGrowth}%`],
        ['Order Growth', `${mockAnalyticsData.orderGrowth}%`],
        ['User Growth', `${mockAnalyticsData.userGrowth}%`],
        ['Product Growth', `${mockAnalyticsData.productGrowth}%`],
        ['', '']
      ],
      monthlyRevenue: [
        ['Monthly Revenue Trend', ''],
        ['Month', 'Revenue'],
        ...mockAnalyticsData.monthlyRevenue.map(item => [
          item.month,
          formatCurrency(item.revenue)
        ]),
        ['', '']
      ],
      topProducts: [
        ['Top Products by Revenue', ''],
        ['Rank', 'Product Name', 'Sales Count', 'Revenue'],
        ...mockAnalyticsData.topProducts.map((product, index) => [
          index + 1,
          product.name,
          product.sales,
          formatCurrency(product.revenue)
        ]),
        ['', '', '', '']
      ],
      topSuppliers: [
        ['Top Suppliers by Revenue', ''],
        ['Rank', 'Supplier Name', 'Orders Count', 'Revenue'],
        ...mockAnalyticsData.topSuppliers.map((supplier, index) => [
          index + 1,
          supplier.name,
          supplier.orders,
          formatCurrency(supplier.revenue)
        ]),
        ['', '', '', '']
      ],
      orderStatusDistribution: [
        ['Order Status Distribution', ''],
        ['Status', 'Count', 'Percentage'],
        ...mockAnalyticsData.orderStatusDistribution.map(item => [
          item.status,
          item.count,
          `${item.percentage}%`
        ]),
        ['', '', '']
      ],
      revenueByCategory: [
        ['Revenue by Category', ''],
        ['Category', 'Revenue', 'Percentage'],
        ...mockAnalyticsData.revenueByCategory.map(item => [
          item.category,
          formatCurrency(item.revenue),
          `${item.percentage}%`
        ]),
        ['', '', '']
      ],
      userRegistrations: [
        ['User Registration Trend (Last 6 Months)', ''],
        ['Month', 'Customers', 'Suppliers', 'Total'],
        ...mockAnalyticsData.userRegistrations.slice(-6).map(data => [
          data.month,
          data.customers,
          data.suppliers,
          data.customers + data.suppliers
        ]),
        ['', '', '', '']
      ],
      recentActivity: [
        ['Recent Activity', ''],
        ['Type', 'Description', 'User', 'Time'],
        ...mockAnalyticsData.recentActivity.map(activity => [
          activity.type.charAt(0).toUpperCase() + activity.type.slice(1),
          activity.description,
          activity.user,
          activity.time
        ])
      ]
    };

    // Combine all sections into one CSV
    const allSections = [
      ...reportData.reportInfo,
      ...reportData.keyMetrics,
      ...reportData.monthlyRevenue,
      ...reportData.topProducts,
      ...reportData.topSuppliers,
      ...reportData.orderStatusDistribution,
      ...reportData.revenueByCategory,
      ...reportData.userRegistrations,
      ...reportData.recentActivity
    ];

    // Convert to CSV format
    const csvContent = allSections
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_report_${timeRange}_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive insights into marketplace performance and trends
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="3m">Last 3 months</option>
                <option value="6m">Last 6 months</option>
                <option value="12m">Last 12 months</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <button 
              onClick={exportAnalyticsReport}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(mockAnalyticsData.totalRevenue)}
                </p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(mockAnalyticsData.revenueGrowth)}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(mockAnalyticsData.revenueGrowth)}`}>
                    {mockAnalyticsData.revenueGrowth}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(mockAnalyticsData.totalOrders)}
                </p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(mockAnalyticsData.orderGrowth)}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(mockAnalyticsData.orderGrowth)}`}>
                    {mockAnalyticsData.orderGrowth}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(mockAnalyticsData.totalUsers)}
                </p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(mockAnalyticsData.userGrowth)}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(mockAnalyticsData.userGrowth)}`}>
                    {mockAnalyticsData.userGrowth}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(mockAnalyticsData.totalProducts)}
                </p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(mockAnalyticsData.productGrowth)}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(mockAnalyticsData.productGrowth)}`}>
                    {mockAnalyticsData.productGrowth}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
              <LineChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {mockAnalyticsData.monthlyRevenue.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(item.revenue / 168000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Order Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Status Distribution</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {mockAnalyticsData.orderStatusDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-purple-500' :
                      index === 3 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(item.count)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h3>
              <BarChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {mockAnalyticsData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.sales} sales</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Suppliers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Suppliers</h3>
              <BarChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {mockAnalyticsData.topSuppliers.map((supplier, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{supplier.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{supplier.orders} orders</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(supplier.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Revenue by Category & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue by Category</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {mockAnalyticsData.revenueByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-purple-500' :
                      index === 3 ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{category.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(category.revenue)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({category.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {mockAnalyticsData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{activity.user}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* User Registration Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Registration Trend</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-6 gap-4">
            {mockAnalyticsData.userRegistrations.slice(-6).map((data, index) => (
              <div key={index} className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">{data.month}</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600 dark:text-blue-400">Customers</span>
                    <span className="font-medium">{data.customers}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600 dark:text-green-400">Suppliers</span>
                    <span className="font-medium">{data.suppliers}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
} 