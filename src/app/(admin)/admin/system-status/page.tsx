'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  WifiOff, 
  Clock, 
  Activity,
  RefreshCw,
  Settings,
  Database,
  Globe,
  Shield,
  Zap,
  HardDrive,
  Network,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  BarChart3,
  Gauge,
  Thermometer,
  Wifi,
  ShieldCheck,
  Lock,
  Unlock
} from 'lucide-react';

interface SystemStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  responseTime?: number;
  uptime?: string;
  lastCheck: Date;
  description: string;
  category: 'core' | 'database' | 'api' | 'storage' | 'security' | 'monitoring';
  version?: string;
  location?: string;
  load?: number;
  memory?: number;
  disk?: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: {
    warning: number;
    critical: number;
  };
}

const mockSystemStatus: SystemStatus[] = [
  {
    id: '1',
    name: 'Web Server',
    status: 'online',
    responseTime: 45,
    uptime: '99.9%',
    lastCheck: new Date(),
    description: 'Main web application server',
    category: 'core',
    version: '2.4.41',
    location: 'US East',
    load: 0.3,
    memory: 65,
    disk: 45
  },
  {
    id: '2',
    name: 'Database Server',
    status: 'online',
    responseTime: 12,
    uptime: '99.8%',
    lastCheck: new Date(),
    description: 'Primary PostgreSQL database',
    category: 'database',
    version: '14.5',
    location: 'US East',
    load: 0.7,
    memory: 78,
    disk: 62
  },
  {
    id: '3',
    name: 'API Gateway',
    status: 'warning',
    responseTime: 180,
    uptime: '98.5%',
    lastCheck: new Date(),
    description: 'API routing and authentication',
    category: 'api',
    version: '1.2.0',
    location: 'US East',
    load: 0.9,
    memory: 82,
    disk: 38
  },
  {
    id: '4',
    name: 'File Storage',
    status: 'online',
    responseTime: 25,
    uptime: '99.7%',
    lastCheck: new Date(),
    description: 'File upload and storage service',
    category: 'storage',
    version: '3.1.2',
    location: 'US East',
    load: 0.2,
    memory: 45,
    disk: 75
  },
  {
    id: '5',
    name: 'Email Service',
    status: 'error',
    responseTime: 5000,
    uptime: '95.2%',
    lastCheck: new Date(),
    description: 'Email delivery service',
    category: 'core',
    version: '2.0.1',
    location: 'US East',
    load: 1.2,
    memory: 90,
    disk: 55
  },
  {
    id: '6',
    name: 'Payment Gateway',
    status: 'online',
    responseTime: 35,
    uptime: '99.9%',
    lastCheck: new Date(),
    description: 'Payment processing service',
    category: 'security',
    version: '1.5.3',
    location: 'US East',
    load: 0.4,
    memory: 58,
    disk: 42
  },
  {
    id: '7',
    name: 'Monitoring System',
    status: 'online',
    responseTime: 15,
    uptime: '99.9%',
    lastCheck: new Date(),
    description: 'System monitoring and alerting',
    category: 'monitoring',
    version: '1.8.0',
    location: 'US East',
    load: 0.1,
    memory: 35,
    disk: 28
  },
  {
    id: '8',
    name: 'CDN',
    status: 'online',
    responseTime: 8,
    uptime: '99.9%',
    lastCheck: new Date(),
    description: 'Content delivery network',
    category: 'core',
    version: '2.1.0',
    location: 'Global',
    load: 0.3,
    memory: 42,
    disk: 15
  }
];

const mockPerformanceMetrics: PerformanceMetric[] = [
  {
    name: 'CPU Usage',
    value: 45,
    unit: '%',
    status: 'normal',
    trend: 'stable',
    threshold: { warning: 70, critical: 90 }
  },
  {
    name: 'Memory Usage',
    value: 78,
    unit: '%',
    status: 'warning',
    trend: 'up',
    threshold: { warning: 75, critical: 90 }
  },
  {
    name: 'Disk Usage',
    value: 62,
    unit: '%',
    status: 'normal',
    trend: 'stable',
    threshold: { warning: 80, critical: 95 }
  },
  {
    name: 'Network In',
    value: 125,
    unit: 'Mbps',
    status: 'normal',
    trend: 'up',
    threshold: { warning: 200, critical: 300 }
  },
  {
    name: 'Network Out',
    value: 89,
    unit: 'Mbps',
    status: 'normal',
    trend: 'down',
    threshold: { warning: 150, critical: 250 }
  },
  {
    name: 'Active Connections',
    value: 1247,
    unit: '',
    status: 'normal',
    trend: 'stable',
    threshold: { warning: 2000, critical: 3000 }
  }
];

export default function SystemStatusPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>(mockSystemStatus);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>(mockPerformanceMetrics);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showIssuesModal, setShowIssuesModal] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setSystemStatus(prev => 
        prev.map(service => ({
          ...service,
          lastCheck: new Date(),
          responseTime: service.status === 'online' 
            ? Math.floor(Math.random() * 100) + 10
            : service.responseTime,
          load: service.status === 'online' 
            ? Math.random() * 1.5
            : service.load,
          memory: service.status === 'online'
            ? Math.floor(Math.random() * 30) + 40
            : service.memory,
          disk: service.status === 'online'
            ? Math.floor(Math.random() * 30) + 30
            : service.disk
        }))
      );
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const refreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSystemStatus(prev => 
        prev.map(service => ({
          ...service,
          lastCheck: new Date(),
          responseTime: service.status === 'online' 
            ? Math.floor(Math.random() * 100) + 10
            : service.responseTime
        }))
      );
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'offline': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'offline': return <WifiOff className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'bg-red-100 dark:bg-red-900/20';
      case 'offline': return 'bg-gray-100 dark:bg-gray-700';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Server className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'api': return <Globe className="w-4 h-4" />;
      case 'storage': return <HardDrive className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'monitoring': return <Activity className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const onlineServices = systemStatus.filter(s => s.status === 'online').length;
  const totalServices = systemStatus.length;
  const hasErrors = systemStatus.some(s => s.status === 'error');
  const hasWarnings = systemStatus.some(s => s.status === 'warning');

  const errorServices = systemStatus.filter(s => s.status === 'error');
  const warningServices = systemStatus.filter(s => s.status === 'warning');

  const filteredServices = selectedCategory === 'all' 
    ? systemStatus 
    : systemStatus.filter(service => service.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All Categories', icon: <Server className="w-4 h-4" /> },
    { value: 'core', label: 'Core Services', icon: <Server className="w-4 h-4" /> },
    { value: 'database', label: 'Database', icon: <Database className="w-4 h-4" /> },
    { value: 'api', label: 'API Services', icon: <Globe className="w-4 h-4" /> },
    { value: 'storage', label: 'Storage', icon: <HardDrive className="w-4 h-4" /> },
    { value: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { value: 'monitoring', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> }
  ];

  const selectedCategoryData = categories.find(cat => cat.value === selectedCategory);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              System Status
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor system health and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh</span>
            </div>
            <button 
              onClick={refreshStatus}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowIssuesModal(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Status</p>
                <p className={`text-2xl font-bold mt-1 ${
                  hasErrors ? 'text-red-600 dark:text-red-400' : 
                  hasWarnings ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-green-600 dark:text-green-400'
                }`}>
                  {hasErrors ? 'Issues Detected' : hasWarnings ? 'Warnings' : 'All Systems Operational'}
                </p>
                {(hasErrors || hasWarnings) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Click to view details
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                hasErrors ? 'bg-red-100 dark:bg-red-900/20' :
                hasWarnings ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                'bg-green-100 dark:bg-green-900/20'
              }`}>
                {hasErrors ? <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" /> :
                 hasWarnings ? <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" /> :
                 <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Services Online</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {onlineServices}/{totalServices}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {((onlineServices / totalServices) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Issues Modal */}
        {showIssuesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    System Issues & Warnings
                  </h3>
                  <button
                    onClick={() => setShowIssuesModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {errorServices.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Critical Issues ({errorServices.length})
                    </h4>
                    <div className="space-y-3">
                      {errorServices.map((service) => (
                        <div key={service.id} className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-red-900 dark:text-red-100">{service.name}</h5>
                              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{service.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-red-600 dark:text-red-400">
                                <span>Response: {service.responseTime}ms</span>
                                <span>Uptime: {service.uptime}</span>
                                <span>Last check: {service.lastCheck.toLocaleTimeString()}</span>
                              </div>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full">
                              ERROR
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {warningServices.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-yellow-600 dark:text-yellow-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Warnings ({warningServices.length})
                    </h4>
                    <div className="space-y-3">
                      {warningServices.map((service) => (
                        <div key={service.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-yellow-900 dark:text-yellow-100">{service.name}</h5>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{service.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                <span>Response: {service.responseTime}ms</span>
                                <span>Uptime: {service.uptime}</span>
                                <span>Last check: {service.lastCheck.toLocaleTimeString()}</span>
                              </div>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">
                              WARNING
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errorServices.length === 0 && warningServices.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-green-600 dark:text-green-400 mb-2">
                      All Systems Operational
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      No issues or warnings detected. All services are running normally.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
              <Gauge className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{metric.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Threshold: {metric.threshold.warning}/{metric.threshold.critical}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${getMetricStatusColor(metric.status)}`}>
                      {metric.value}{metric.unit}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {metric.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${performanceMetrics[0].value}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {performanceMetrics[0].value}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${performanceMetrics[1].value}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {performanceMetrics[1].value}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Disk Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${performanceMetrics[2].value}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {performanceMetrics[2].value}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Service Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Status</h3>
              <div className="flex items-center gap-4">
                {/* Custom Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors min-w-[160px]"
                  >
                    {selectedCategoryData?.icon}
                    <span className="flex-1 text-left">{selectedCategoryData?.label}</span>
                    <svg className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {categoryDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50">
                      <div className="py-1">
                        {categories.map((category) => (
                          <button
                            key={category.value}
                            onClick={() => {
                              setSelectedCategory(category.value);
                              setCategoryDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                              selectedCategory === category.value 
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {category.icon}
                            <span>{category.label}</span>
                            {selectedCategory === category.value && (
                              <CheckCircle className="w-4 h-4 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <span className={`p-2 rounded-full ${getStatusBgColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)} ${getStatusBgColor(service.status)}`}>
                          {service.status.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          {getCategoryIcon(service.category)}
                          <span className="capitalize">{service.category}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {service.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {service.responseTime && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Response Time:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {service.responseTime}ms
                            </span>
                          </div>
                        )}
                        {service.uptime && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {service.uptime}
                            </span>
                          </div>
                        )}
                        {service.version && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Version:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {service.version}
                            </span>
                          </div>
                        )}
                        {service.location && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Location:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {service.location}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {service.load !== undefined && (
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Load:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {service.load.toFixed(2)}
                            </span>
                          </div>
                          {service.memory !== undefined && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Memory:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {service.memory}%
                              </span>
                            </div>
                          )}
                          {service.disk !== undefined && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Disk:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {service.disk}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    <div>Last check:</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {service.lastCheck.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 