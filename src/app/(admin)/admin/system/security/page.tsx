'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  Activity,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Server,
  Database,
  Key,
  Fingerprint,
  ShieldCheck,
  AlertCircle,
  X,
  Plus,
  Edit,
  Trash2,
  Ban,
  Check,
  XCircle,
  TrendingUp,
  TrendingDown,
  LogOut,
  Calendar,
  Globe as GlobeIcon
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user?: string;
  ip: string;
  location: string;
  userAgent: string;
  timestamp: Date;
  description: string;
  status: 'investigating' | 'resolved' | 'false_positive' | 'open';
  device?: string;
  browser?: string;
}

interface SecurityMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'failed_login',
    severity: 'high',
    user: 'admin@electrify.com',
    ip: '192.168.1.100',
    location: 'Lagos, Nigeria',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    description: 'Multiple failed login attempts detected',
    status: 'investigating',
    device: 'Desktop',
    browser: 'Chrome'
  },
  {
    id: '2',
    type: 'login',
    severity: 'low',
    user: 'john.doe@electrify.com',
    ip: '203.45.67.89',
    location: 'Nairobi, Kenya',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    description: 'Successful login from new device',
    status: 'resolved',
    device: 'Mobile',
    browser: 'Safari'
  },
  {
    id: '3',
    type: 'suspicious_activity',
    severity: 'critical',
    user: 'unknown',
    ip: '45.67.89.123',
    location: 'Unknown',
    userAgent: 'Python-requests/2.28.1',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    description: 'Automated scanning detected',
    status: 'open',
    device: 'Bot',
    browser: 'Python'
  },
  {
    id: '4',
    type: 'data_access',
    severity: 'medium',
    user: 'admin@electrify.com',
    ip: '192.168.1.50',
    location: 'Lagos, Nigeria',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: 'Bulk data export initiated',
    status: 'resolved',
    device: 'Desktop',
    browser: 'Firefox'
  },
  {
    id: '5',
    type: 'system_change',
    severity: 'high',
    user: 'admin@electrify.com',
    ip: '192.168.1.50',
    location: 'Lagos, Nigeria',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    description: 'Security settings modified',
    status: 'resolved',
    device: 'Desktop',
    browser: 'Firefox'
  },
  {
    id: '6',
    type: 'failed_login',
    severity: 'medium',
    user: 'supplier@example.com',
    ip: '78.90.123.45',
    location: 'Cairo, Egypt',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    description: 'Invalid password attempt',
    status: 'false_positive',
    device: 'Desktop',
    browser: 'Chrome'
  }
];

const mockSecurityMetrics: SecurityMetric[] = [
  {
    name: 'Failed Login Attempts',
    value: 12,
    change: -25,
    trend: 'down',
    status: 'good'
  },
  {
    name: 'Suspicious Activities',
    value: 3,
    change: 50,
    trend: 'up',
    status: 'warning'
  },
  {
    name: 'Active Sessions',
    value: 45,
    change: 12,
    trend: 'up',
    status: 'good'
  },
  {
    name: 'Blocked IPs',
    value: 8,
    change: -10,
    trend: 'down',
    status: 'good'
  },
  {
    name: 'Security Alerts',
    value: 2,
    change: 0,
    trend: 'stable',
    status: 'warning'
  },
  {
    name: '2FA Enabled Users',
    value: 89,
    change: 5,
    trend: 'up',
    status: 'good'
  }
];

export default function SecurityPage() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>(mockSecurityMetrics);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [severityDropdownOpen, setSeverityDropdownOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const handleViewEvent = (event: SecurityEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleResolveEvent = (eventId: string) => {
    setSecurityEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, status: 'resolved' as const }
          : event
      )
    );
    console.log('Resolved event:', eventId);
  };

  const handleBlockIP = (eventId: string) => {
    const event = securityEvents.find(e => e.id === eventId);
    if (event) {
      // Here you would typically make an API call to block the IP
      console.log('Blocking IP:', event.ip);
      alert(`IP ${event.ip} has been blocked.`);
    }
  };

  const exportSecurityLogs = () => {
    // Create CSV content
    const headers = [
      'ID',
      'Type',
      'Severity',
      'User',
      'IP Address',
      'Location',
      'Device',
      'Browser',
      'Description',
      'Status',
      'Timestamp'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredEvents.map(event => [
        event.id,
        event.type.replace('_', ' ').toUpperCase(),
        event.severity.toUpperCase(),
        event.user || 'Unknown',
        event.ip,
        event.location,
        event.device || 'Unknown',
        event.browser || 'Unknown',
        `"${event.description.replace(/"/g, '""')}"`,
        event.status.replace('_', ' ').toUpperCase(),
        event.timestamp.toISOString()
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `security_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <CheckCircle className="w-4 h-4" />;
      case 'logout': return <LogOut className="w-4 h-4" />;
      case 'failed_login': return <AlertTriangle className="w-4 h-4" />;
      case 'suspicious_activity': return <AlertCircle className="w-4 h-4" />;
      case 'data_access': return <Database className="w-4 h-4" />;
      case 'system_change': return <Settings className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 dark:text-red-400';
      case 'investigating': return 'text-yellow-600 dark:text-yellow-400';
      case 'resolved': return 'text-green-600 dark:text-green-400';
      case 'false_positive': return 'text-gray-600 dark:text-gray-400';
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

  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const selectedSeverity = severityOptions.find(option => option.value === selectedFilter);

  const filteredEvents = securityEvents.filter(event => {
    const matchesFilter = selectedFilter === 'all' || event.severity === selectedFilter;
    const matchesSearch = searchTerm === '' || 
      event.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length;
  const highEvents = securityEvents.filter(e => e.severity === 'high').length;
  const openEvents = securityEvents.filter(e => e.status === 'open').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Security Monitoring
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor system security, access logs, and threat detection
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={refreshData}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={exportSecurityLogs}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Logs
            </button>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Alerts</p>
                <p className="text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {criticalEvents}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
                <p className="text-xl lg:text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {highEvents}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Issues</p>
                <p className="text-xl lg:text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {openEvents}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Security Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Metrics</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityMetrics.map((metric, index) => (
              <div key={index} className="p-3 lg:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{metric.name}</h4>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</span>
                  <span className={`text-sm font-medium ${
                    metric.change > 0 ? 'text-green-600 dark:text-green-400' : 
                    metric.change < 0 ? 'text-red-600 dark:text-red-400' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
                <div className={`mt-2 w-full h-2 rounded-full ${
                  metric.status === 'good' ? 'bg-green-200 dark:bg-green-800' :
                  metric.status === 'warning' ? 'bg-yellow-200 dark:bg-yellow-800' :
                  'bg-red-200 dark:bg-red-800'
                }`}>
                  <div className={`h-2 rounded-full ${
                    metric.status === 'good' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} style={{ width: `${Math.min(metric.value, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Events</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full sm:w-64"
                  />
                </div>
                
                {/* Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSeverityDropdownOpen(!severityDropdownOpen)}
                    className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="flex-1 text-left">{selectedSeverity?.label}</span>
                    <svg className={`w-4 h-4 transition-transform ${severityDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {severityDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50">
                      <div className="py-1">
                        {severityOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedFilter(option.value);
                              setSeverityDropdownOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                              selectedFilter === option.value 
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            <span>{option.label}</span>
                            {selectedFilter === option.value && (
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

          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="w-1/4 px-2 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="w-1/6 px-2 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User/IP
                  </th>
                  <th className="hidden md:table-cell w-1/6 px-2 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="w-1/8 px-2 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="hidden lg:table-cell w-1/8 px-2 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden sm:table-cell w-1/8 px-2 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="w-1/8 px-2 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-2 lg:px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded-full flex-shrink-0 ${getSeverityColor(event.severity)}`}>
                          {getEventIcon(event.type)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {event.type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {event.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 lg:px-4 py-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {event.user || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {event.ip}
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-2 lg:px-4 py-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-900 dark:text-white truncate">
                          {event.location}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 lg:px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-2 lg:px-4 py-4">
                      <span className={`text-sm font-medium ${getStatusColor(event.status)}`}>
                        {event.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-2 lg:px-4 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {event.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="px-2 lg:px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleViewEvent(event)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {event.status !== 'resolved' && (
                          <button 
                            onClick={() => handleResolveEvent(event.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-1"
                            title="Mark as Resolved"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleBlockIP(event.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                          title="Block IP"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Event Details Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Security Event Details
                  </h3>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {/* Event Header */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className={`p-2 rounded-full ${getSeverityColor(selectedEvent.severity)}`}>
                      {getEventIcon(selectedEvent.type)}
                    </span>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEvent.type.replace('_', ' ').toUpperCase()}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedEvent.description}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSeverityColor(selectedEvent.severity)}`}>
                        {selectedEvent.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Information */}
                    <div className="space-y-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="w-4 h-4" />
                        User Information
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">User</label>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedEvent.user || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">IP Address</label>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedEvent.ip}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Location</label>
                          <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {selectedEvent.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Device Information */}
                    <div className="space-y-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Device Information
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Device Type</label>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedEvent.device || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Browser</label>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedEvent.browser || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">User Agent</label>
                          <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                            {selectedEvent.userAgent}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Timestamp</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {selectedEvent.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Status</label>
                      <p className={`text-sm font-medium ${getStatusColor(selectedEvent.status)}`}>
                        {selectedEvent.status.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        if (selectedEvent.status !== 'resolved') {
                          handleResolveEvent(selectedEvent.id);
                        }
                        setShowEventModal(false);
                      }}
                      disabled={selectedEvent.status === 'resolved'}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        selectedEvent.status === 'resolved'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      Mark as Resolved
                    </button>
                    <button
                      onClick={() => {
                        handleBlockIP(selectedEvent.id);
                        setShowEventModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      Block IP
                    </button>
                    <button
                      onClick={() => setShowEventModal(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 