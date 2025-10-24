'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Server,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Settings,
  BarChart3,
  Activity,
  Shield,
  Zap,
  Globe,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Key,
  Trash2,
  Archive,
  AlertCircle,
  X,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Lock,
  Unlock,
  Power,
  PowerOff,
  Wrench,
  FileText,
  BarChart,
  UserCheck,
  UserX,
  ServerCog,
  HardDrive,
  Network,
  Wifi,
  WifiOff,
  ChevronDown
} from 'lucide-react';

// Enhanced stats with real-time updates
const useSuperAdminStats = () => {
  const [stats, setStats] = useState([
    {
      title: 'Total Revenue',
      value: '$2,847,580',
      change: '+24.8%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      trend: [65, 72, 68, 75, 82, 89, 94, 91, 87, 92, 96, 98]
    },
    {
      title: 'Active Users',
      value: '45,892',
      change: '+18.3%',
      changeType: 'increase',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      trend: [42, 44, 43, 45, 47, 46, 48, 49, 47, 48, 49, 50]
    },
    {
      title: 'System Load',
      value: '78%',
      change: '+5.2%',
      changeType: 'increase',
      icon: Server,
      color: 'from-orange-500 to-orange-600',
      trend: [72, 75, 73, 76, 78, 77, 79, 80, 78, 79, 80, 81]
    },
    {
      title: 'Security Score',
      value: '98.5%',
      change: '+2.1%',
      changeType: 'increase',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      trend: [96, 97, 96, 97, 98, 97, 98, 99, 98, 99, 99, 99]
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => prevStats.map(stat => ({
        ...stat,
        value: stat.title === 'System Load' 
          ? `${Math.floor(Math.random() * 20) + 70}%`
          : stat.value,
        change: stat.title === 'System Load'
          ? `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 3 + 1).toFixed(1)}%`
          : stat.change
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return stats;
};

// Enhanced system metrics with real-time monitoring
const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState([
    {
      name: 'CPU Usage',
      value: '78%',
      status: 'warning',
      trend: 'up',
      threshold: 80,
      icon: ServerCog
    },
    {
      name: 'Memory Usage',
      value: '65%',
      status: 'good',
      trend: 'stable',
      threshold: 85,
      icon: HardDrive
    },
    {
      name: 'Disk Space',
      value: '42%',
      status: 'excellent',
      trend: 'down',
      threshold: 90,
      icon: Database
    },
    {
      name: 'Network Load',
      value: '89%',
      status: 'critical',
      trend: 'up',
      threshold: 85,
      icon: Network
    },
    {
      name: 'Database Connections',
      value: '156/200',
      status: 'good',
      trend: 'stable',
      threshold: 180,
      icon: Database
    },
    {
      name: 'API Response Time',
      value: '89ms',
      status: 'excellent',
      trend: 'down',
      threshold: 200,
      icon: Activity
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prevMetrics => prevMetrics.map(metric => ({
        ...metric,
        value: metric.name === 'CPU Usage' 
          ? `${Math.floor(Math.random() * 30) + 60}%`
          : metric.name === 'Memory Usage'
          ? `${Math.floor(Math.random() * 20) + 55}%`
          : metric.name === 'Network Load'
          ? `${Math.floor(Math.random() * 15) + 80}%`
          : metric.value
      })));
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
};

// Enhanced security alerts with real-time updates
const useSecurityAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'Multiple failed login attempts detected from IP 192.168.1.100',
      time: '2 minutes ago',
      severity: 'medium',
      resolved: false
    },
    {
      id: 2,
      type: 'info',
      message: 'Database backup completed successfully',
      time: '15 minutes ago',
      severity: 'low',
      resolved: true
    },
    {
      id: 3,
      type: 'error',
      message: 'SSL certificate expires in 7 days',
      time: '1 hour ago',
      severity: 'high',
      resolved: false
    },
    {
      id: 4,
      type: 'success',
      message: 'Security scan completed - no threats found',
      time: '2 hours ago',
      severity: 'low',
      resolved: true
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new security alerts
      if (Math.random() > 0.8) {
        const newAlert = {
          id: Date.now(),
          type: Math.random() > 0.7 ? 'warning' : 'info',
          message: `System check completed at ${new Date().toLocaleTimeString()}`,
          time: 'Just now',
          severity: 'low',
          resolved: false
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 3)]);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return [alerts, setAlerts] as const;
};

// Enhanced quick actions with modal functionality
const quickActions = [
  {
    name: 'System Maintenance',
    icon: Settings,
    color: 'from-blue-500 to-blue-600',
    description: 'Perform system maintenance tasks',
    action: 'maintenance',
    requiresConfirmation: true
  },
  {
    name: 'Security Audit',
    icon: Shield,
    color: 'from-red-500 to-red-600',
    description: 'Run comprehensive security audit',
    action: 'security_audit',
    requiresConfirmation: false
  },
  {
    name: 'Database Backup',
    icon: Database,
    color: 'from-green-500 to-green-600',
    description: 'Create system backup',
    action: 'backup',
    requiresConfirmation: true
  },
  {
    name: 'User Management',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    description: 'Manage all user accounts',
    action: 'user_management',
    requiresConfirmation: false
  },
  {
    name: 'System Monitoring',
    icon: Activity,
    color: 'from-orange-500 to-orange-600',
    description: 'Monitor system performance',
    action: 'monitoring',
    requiresConfirmation: false
  },
  {
    name: 'Emergency Mode',
    icon: AlertTriangle,
    color: 'from-red-600 to-red-700',
    description: 'Activate emergency protocols',
    action: 'emergency',
    requiresConfirmation: true
  }
];

// Modal component for quick actions
const ActionModal = ({ isOpen, onClose, action, onConfirm }: {
  isOpen: boolean;
  onClose: () => void;
  action: any;
  onConfirm: () => void;
}) => {
  if (!isOpen || !action) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirm Action
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {action.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This action will affect system operations. Are you sure you want to proceed?
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState('operational');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  const stats = useSuperAdminStats();
  const metrics = useSystemMetrics();
  const [alerts, setAlerts] = useSecurityAlerts();

  // Click outside handler for period dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (!target.closest('.period-dropdown')) {
        setPeriodDropdownOpen(false);
      }
    }

    if (periodDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [periodDropdownOpen]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'info': return <Eye className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleQuickAction = (action: any) => {
    if (action.requiresConfirmation) {
      setSelectedAction(action);
      setIsModalOpen(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: any) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    switch (action.action) {
      case 'maintenance':
        setMaintenanceMode(true);
        alert('System maintenance mode activated. Users will be notified.');
        break;
      case 'security_audit':
        alert('Security audit initiated. Results will be available in 5 minutes.');
        break;
      case 'backup':
        alert('Database backup started. Estimated completion: 10 minutes.');
        break;
      case 'user_management':
        router.push('/super-admin/users');
        break;
      case 'monitoring':
        router.push('/super-admin/system');
        break;
      case 'emergency':
        setSystemStatus('emergency');
        alert('Emergency mode activated. All non-critical services suspended.');
        break;
    }
    
    setIsLoading(false);
    setIsModalOpen(false);
    setSelectedAction(null);
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create comprehensive report data
      const timestamp = new Date().toISOString().split('T')[0];
      const timeRangeText = {
        '1h': 'Last hour',
        '24h': 'Last 24 hours',
        '7d': 'Last 7 days',
        '30d': 'Last 30 days'
      }[selectedPeriod];

      const reportData = {
        reportInfo: [
          ['Super Admin Dashboard Report', ''],
          ['Generated Date', new Date().toLocaleDateString()],
          ['Time Range', timeRangeText],
          ['', '']
        ],
        systemStats: [
          ['System Statistics', ''],
          ['Total Users', stats.find(s => s.title === 'Total Users')?.value || '0'],
          ['Active Sessions', stats.find(s => s.title === 'Active Sessions')?.value || '0'],
          ['System Load', stats.find(s => s.title === 'System Load')?.value || '0%'],
          ['Security Score', stats.find(s => s.title === 'Security Score')?.value || '0%'],
          ['', '']
        ],
        systemMetrics: [
          ['System Performance Metrics', ''],
          ['Metric', 'Value', 'Status', 'Trend'],
          ...metrics.map(metric => [
            metric.name,
            metric.value,
            metric.status,
            metric.trend
          ]),
          ['', '', '', '']
        ],
        securityAlerts: [
          ['Security Alerts', ''],
          ['Type', 'Message', 'Severity', 'Time'],
          ...alerts.map(alert => [
            alert.type,
            alert.message,
            alert.severity,
            new Date(alert.time).toLocaleString()
          ]),
          ['', '', '', '']
        ]
      };

      // Convert to CSV format
      const csvContent = [
        ...reportData.reportInfo.map(row => row.join(',')),
        ...reportData.systemStats.map(row => row.join(',')),
        ...reportData.systemMetrics.map(row => row.join(',')),
        ...reportData.securityAlerts.map(row => row.join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `super-admin-report-${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      alert('Report generated successfully! Download will start automatically.');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = () => {
    // Trigger data refresh
    window.location.reload();
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Super Admin Control Center
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Ultimate system control and monitoring dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Custom Period Dropdown */}
            <div className="relative period-dropdown">
              <button
                onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors min-w-[160px]"
              >
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="flex-1 text-left">
                  {selectedPeriod === '1h' && 'Last hour'}
                  {selectedPeriod === '24h' && 'Last 24 hours'}
                  {selectedPeriod === '7d' && 'Last 7 days'}
                  {selectedPeriod === '30d' && 'Last 30 days'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${periodDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {periodDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                  <div className="py-1">
                    {[
                      { value: '1h', label: 'Last hour' },
                      { value: '24h', label: 'Last 24 hours' },
                      { value: '7d', label: 'Last 7 days' },
                      { value: '30d', label: 'Last 30 days' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedPeriod(option.value);
                          setPeriodDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                          selectedPeriod === option.value 
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleRefreshData}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button 
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Generate Report
            </button>
          </div>
        </div>

        {/* System Status Banner */}
        {systemStatus === 'emergency' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600 text-white p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <p className="font-semibold">Emergency Mode Active</p>
                <p className="text-red-100 text-sm">All non-critical services are suspended</p>
              </div>
            </div>
            <button
              onClick={() => setSystemStatus('operational')}
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors"
            >
              Deactivate
            </button>
          </motion.div>
        )}

        {maintenanceMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-600 text-white p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Wrench className="w-6 h-6" />
              <div>
                <p className="font-semibold">Maintenance Mode Active</p>
                <p className="text-yellow-100 text-sm">System maintenance in progress</p>
              </div>
            </div>
            <button
              onClick={() => setMaintenanceMode(false)}
              className="bg-yellow-700 hover:bg-yellow-800 px-4 py-2 rounded-lg transition-colors"
            >
              End Maintenance
            </button>
          </motion.div>
        )}

        {/* Super Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/super-admin/analytics?metric=${stat.title.toLowerCase().replace(' ', '_')}`)}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Metrics */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Performance
                </h2>
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-600" />
                  <button
                    onClick={handleRefreshData}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Refresh metrics"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/super-admin/system?metric=${metric.name.toLowerCase().replace(' ', '_')}`)}
                  >
                    <div className="flex items-center gap-3">
                      <metric.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {metric.name}
                        </p>
                        <p className={`text-xs ${getStatusColor(metric.status)}`}>
                          {metric.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {metric.value}
                      </p>
                      <div className={`flex items-center text-xs ${
                        metric.trend === 'up' ? 'text-red-600 dark:text-red-400' :
                        metric.trend === 'down' ? 'text-green-600 dark:text-green-400' :
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
          </div>

          {/* Security Alerts */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Security Alerts
                </h2>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <button
                    onClick={() => router.push('/super-admin/security')}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    View All
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {alerts.slice(0, 4).map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      alert.resolved 
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {alert.time}
                        </p>
                        {alert.resolved && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {action.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Status Overview
                </h2>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    systemStatus === 'operational' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    systemStatus === 'operational' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {systemStatus === 'operational' ? 'All Systems Operational' : 'Emergency Mode Active'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Database
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        Online & Healthy
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        API Services
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        All Endpoints Active
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Security
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        All Systems Secure
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Backup System
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        Last Backup: 2h ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Modal */}
        <ActionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAction(null);
          }}
          action={selectedAction}
          onConfirm={() => executeAction(selectedAction)}
        />
      </div>
    </SuperAdminLayout>
  );
} 