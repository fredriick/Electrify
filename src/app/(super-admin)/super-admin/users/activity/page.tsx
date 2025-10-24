'use client';

import { useState, useEffect } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Activity, 
  Users, 
  Eye, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar,
  Clock,
  MapPin,
  Globe,
  Shield,
  Database,
  FileText,
  Settings,
  User,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Lock,
  Unlock,
  Key,
  Bell,
  Star
} from 'lucide-react';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  category: 'login' | 'logout' | 'data_access' | 'system_change' | 'security' | 'profile' | 'admin_action';
  description: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  sessionId: string;
  duration?: number;
  affectedResource?: string;
  metadata?: Record<string, any>;
}

interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  failedLogins: number;
  suspiciousActivities: number;
  activeUsers: number;
  averageSessionDuration: number;
}

export default function UserActivityPage() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalActivities: 0,
    todayActivities: 0,
    failedLogins: 0,
    suspiciousActivities: 0,
    activeUsers: 0,
    averageSessionDuration: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock activity data
  const mockActivities: UserActivity[] = [
    {
      id: '1',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john.smith@company.com',
      action: 'login',
      category: 'login',
      description: 'User logged in successfully',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'New York, NY, US',
      timestamp: '2024-01-15 14:30:25',
      status: 'success',
      severity: 'low',
      sessionId: 'sess_123456789',
      duration: 45,
      metadata: { browser: 'Chrome', os: 'Windows 10' }
    },
    {
      id: '2',
      userId: 'user-2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.johnson@company.com',
      action: 'data_access',
      category: 'data_access',
      description: 'Accessed user management module',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      location: 'Los Angeles, CA, US',
      timestamp: '2024-01-15 14:25:10',
      status: 'success',
      severity: 'low',
      sessionId: 'sess_123456790',
      affectedResource: '/admin/users',
      metadata: { module: 'user_management', action: 'view' }
    },
    {
      id: '3',
      userId: 'user-3',
      userName: 'Michael Brown',
      userEmail: 'michael.brown@company.com',
      action: 'login_failed',
      category: 'login',
      description: 'Failed login attempt - incorrect password',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Chicago, IL, US',
      timestamp: '2024-01-15 14:20:15',
      status: 'failed',
      severity: 'medium',
      sessionId: 'sess_123456791',
      metadata: { attempts: 3, reason: 'incorrect_password' }
    },
    {
      id: '4',
      userId: 'user-4',
      userName: 'Emily Davis',
      userEmail: 'emily.davis@company.com',
      action: 'system_change',
      category: 'system_change',
      description: 'Modified system configuration settings',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      location: 'Houston, TX, US',
      timestamp: '2024-01-15 14:15:30',
      status: 'success',
      severity: 'high',
      sessionId: 'sess_123456792',
      affectedResource: '/admin/settings',
      metadata: { setting: 'email_config', old_value: 'smtp.old.com', new_value: 'smtp.new.com' }
    },
    {
      id: '5',
      userId: 'user-5',
      userName: 'David Wilson',
      userEmail: 'david.wilson@company.com',
      action: 'security_alert',
      category: 'security',
      description: 'Suspicious login attempt from unknown location',
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (Unknown) AppleWebKit/537.36',
      location: 'Unknown Location',
      timestamp: '2024-01-15 14:10:45',
      status: 'warning',
      severity: 'high',
      sessionId: 'sess_123456793',
      metadata: { risk_score: 85, location_mismatch: true }
    },
    {
      id: '6',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john.smith@company.com',
      action: 'logout',
      category: 'logout',
      description: 'User logged out successfully',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'New York, NY, US',
      timestamp: '2024-01-15 14:05:20',
      status: 'success',
      severity: 'low',
      sessionId: 'sess_123456789',
      duration: 1800,
      metadata: { session_duration: '30 minutes' }
    },
    {
      id: '7',
      userId: 'user-6',
      userName: 'Lisa Anderson',
      userEmail: 'lisa.anderson@company.com',
      action: 'profile_update',
      category: 'profile',
      description: 'Updated profile information',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Philadelphia, PA, US',
      timestamp: '2024-01-15 14:00:10',
      status: 'success',
      severity: 'low',
      sessionId: 'sess_123456794',
      affectedResource: '/profile',
      metadata: { fields_updated: ['phone', 'address'] }
    },
    {
      id: '8',
      userId: 'user-2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.johnson@company.com',
      action: 'admin_action',
      category: 'admin_action',
      description: 'Created new user account',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      location: 'Los Angeles, CA, US',
      timestamp: '2024-01-15 13:55:30',
      status: 'success',
      severity: 'medium',
      sessionId: 'sess_123456790',
      affectedResource: '/admin/users/create',
      metadata: { new_user_email: 'newuser@company.com', role: 'user' }
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setActivities(mockActivities);
      setFilteredActivities(mockActivities);
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayActivities = mockActivities.filter(a => 
        new Date(a.timestamp).toDateString() === today
      );
      
      setStats({
        totalActivities: mockActivities.length,
        todayActivities: todayActivities.length,
        failedLogins: mockActivities.filter(a => a.status === 'failed').length,
        suspiciousActivities: mockActivities.filter(a => a.severity === 'high' || a.severity === 'critical').length,
        activeUsers: new Set(mockActivities.map(a => a.userId)).size,
        averageSessionDuration: 25.5
      });
      
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filter activities based on search and filters
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.ipAddress.includes(searchTerm)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(activity => activity.category === categoryFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(activity => activity.severity === severityFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        switch (dateFilter) {
          case 'today':
            return activityDate >= today;
          case 'yesterday':
            return activityDate >= yesterday && activityDate < today;
          case 'last_week':
            return activityDate >= lastWeek;
          default:
            return true;
        }
      });
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, categoryFilter, severityFilter, dateFilter]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'login':
        return <LogIn className="w-4 h-4" />;
      case 'logout':
        return <LogOut className="w-4 h-4" />;
      case 'data_access':
        return <Database className="w-4 h-4" />;
      case 'system_change':
        return <Settings className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'profile':
        return <User className="w-4 h-4" />;
      case 'admin_action':
        return <Star className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'info':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'info':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const exportActivities = () => {
    const csvContent = [
      ['User', 'Action', 'Category', 'Description', 'IP Address', 'Location', 'Timestamp', 'Status', 'Severity'],
      ...filteredActivities.map(activity => [
        activity.userName,
        activity.action,
        activity.category,
        activity.description,
        activity.ipAddress,
        activity.location,
        activity.timestamp,
        activity.status,
        activity.severity
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-activities-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <SuperAdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-purple-600" />
                User Activity
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Monitor and track user activities across the system
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportActivities}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalActivities}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Activities</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayActivities}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Logins</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failedLogins}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search activities by user, action, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="data_access">Data Access</option>
                  <option value="system_change">System Change</option>
                  <option value="security">Security</option>
                  <option value="profile">Profile</option>
                  <option value="admin_action">Admin Action</option>
                </select>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last_week">Last Week</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activities Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                              {activity.userName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.userName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {activity.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white capitalize">
                          {activity.action.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(activity.category)}
                          <span className="text-sm text-gray-900 dark:text-white capitalize">
                            {activity.category.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {activity.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                          {activity.ipAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {activity.location}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {getStatusIcon(activity.status)}
                          <span className="ml-1 capitalize">{activity.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(activity.severity)}`}>
                          <span className="capitalize">{activity.severity}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No activities found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
} 