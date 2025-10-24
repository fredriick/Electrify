'use client';

import { useState, useEffect } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Shield,
  Database,
  Network,
  Globe,
  Users,
  Package,
  ShoppingCart,
  Bell,
  Settings,
  RefreshCw
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: string;
  change: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

interface ServerStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  lastUpdate: string;
}

export default function SystemOverviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock system metrics
  const systemMetrics: SystemMetric[] = [
    {
      name: 'CPU Usage',
      value: '23%',
      change: -2.1,
      status: 'good',
      icon: <Cpu className="w-5 h-5" />
    },
    {
      name: 'Memory Usage',
      value: '67%',
      change: 1.5,
      status: 'warning',
      icon: <Activity className="w-5 h-5" />
    },
    {
      name: 'Disk Usage',
      value: '45%',
      change: 0.8,
      status: 'good',
      icon: <HardDrive className="w-5 h-5" />
    },
    {
      name: 'Network Load',
      value: '12%',
      change: -0.3,
      status: 'good',
      icon: <Network className="w-5 h-5" />
    },
    {
      name: 'Active Users',
      value: '1,247',
      change: 5.2,
      status: 'good',
      icon: <Users className="w-5 h-5" />
    },
    {
      name: 'Database Connections',
      value: '89',
      change: -1.2,
      status: 'good',
      icon: <Database className="w-5 h-5" />
    }
  ];

  // Mock server status
  const serverStatus: ServerStatus[] = [
    {
      id: 'web-01',
      name: 'Web Server 01',
      status: 'online',
      cpu: 23,
      memory: 67,
      disk: 45,
      uptime: '15d 8h 32m',
      lastUpdate: '2 minutes ago'
    },
    {
      id: 'web-02',
      name: 'Web Server 02',
      status: 'online',
      cpu: 18,
      memory: 54,
      disk: 38,
      uptime: '12d 4h 15m',
      lastUpdate: '1 minute ago'
    },
    {
      id: 'db-01',
      name: 'Database Server 01',
      status: 'online',
      cpu: 45,
      memory: 78,
      disk: 62,
      uptime: '8d 16h 42m',
      lastUpdate: '30 seconds ago'
    },
    {
      id: 'cache-01',
      name: 'Cache Server 01',
      status: 'maintenance',
      cpu: 0,
      memory: 0,
      disk: 0,
      uptime: '0d 0h 0m',
      lastUpdate: '5 minutes ago'
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setLastRefresh(new Date());
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'online':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'online':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
      case 'offline':
        return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance':
        return <Settings className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
                <Server className="w-8 h-8 text-purple-600" />
                System Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Real-time system health and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {systemMetrics.map((metric) => (
              <div key={metric.name} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      {metric.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {metric.name}
                    </h3>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {getStatusIcon(metric.status)}
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Server Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-600" />
                Server Status
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time status of all server instances
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Server
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      CPU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Memory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Disk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Update
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {serverStatus.map((server) => (
                    <tr key={server.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {server.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {server.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
                          {getStatusIcon(server.status)}
                          <span className="ml-1 capitalize">{server.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                server.cpu > 80 ? 'bg-red-500' : 
                                server.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${server.cpu}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{server.cpu}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                server.memory > 80 ? 'bg-red-500' : 
                                server.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${server.memory}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{server.memory}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                server.disk > 80 ? 'bg-red-500' : 
                                server.disk > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${server.disk}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{server.disk}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {server.uptime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {server.lastUpdate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
} 