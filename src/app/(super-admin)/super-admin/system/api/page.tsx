'use client';

import { useState, useEffect } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Globe, 
  Play, 
  Pause, 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Download,
  Upload,
  Edit,
  Eye,
  Wrench,
  Lock,
  Unlock,
  Network,
  Server,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Code,
  Key,
  Database,
  Trash2
} from 'lucide-react';

interface ApiEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  version: string;
  rateLimit: number;
  currentRequests: number;
  responseTime: number;
  errorRate: number;
  uptime: string;
  lastDeploy: string;
  authentication: boolean;
  caching: boolean;
  documentation: boolean;
  environment: 'production' | 'staging' | 'development';
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'expired';
  permissions: string[];
  lastUsed: string;
  createdAt: string;
  expiresAt: string;
  requestsToday: number;
  requestsTotal: number;
}

export default function ApiManagementPage() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Mock API endpoints data
  const mockEndpoints: ApiEndpoint[] = [
    {
      id: 'users-api',
      name: 'Users API',
      path: '/api/v1/users',
      method: 'GET',
      status: 'active',
      version: 'v1.2.0',
      rateLimit: 1000,
      currentRequests: 156,
      responseTime: 45,
      errorRate: 0.02,
      uptime: '99.98%',
      lastDeploy: '2 hours ago',
      authentication: true,
      caching: true,
      documentation: true,
      environment: 'production'
    },
    {
      id: 'products-api',
      name: 'Products API',
      path: '/api/v1/products',
      method: 'GET',
      status: 'active',
      version: 'v1.1.5',
      rateLimit: 2000,
      currentRequests: 342,
      responseTime: 67,
      errorRate: 0.05,
      uptime: '99.95%',
      lastDeploy: '1 day ago',
      authentication: true,
      caching: true,
      documentation: true,
      environment: 'production'
    },
    {
      id: 'orders-api',
      name: 'Orders API',
      path: '/api/v1/orders',
      method: 'POST',
      status: 'active',
      version: 'v1.0.8',
      rateLimit: 500,
      currentRequests: 89,
      responseTime: 123,
      errorRate: 0.08,
      uptime: '99.92%',
      lastDeploy: '3 days ago',
      authentication: true,
      caching: false,
      documentation: true,
      environment: 'production'
    },
    {
      id: 'auth-api',
      name: 'Authentication API',
      path: '/api/v1/auth',
      method: 'POST',
      status: 'active',
      version: 'v1.3.2',
      rateLimit: 300,
      currentRequests: 67,
      responseTime: 89,
      errorRate: 0.01,
      uptime: '99.99%',
      lastDeploy: '1 week ago',
      authentication: false,
      caching: false,
      documentation: true,
      environment: 'production'
    },
    {
      id: 'analytics-api',
      name: 'Analytics API',
      path: '/api/v1/analytics',
      method: 'GET',
      status: 'maintenance',
      version: 'v1.0.3',
      rateLimit: 100,
      currentRequests: 0,
      responseTime: 0,
      errorRate: 0,
      uptime: '0%',
      lastDeploy: '1 hour ago',
      authentication: true,
      caching: true,
      documentation: false,
      environment: 'staging'
    },
    {
      id: 'webhook-api',
      name: 'Webhook API',
      path: '/api/v1/webhooks',
      method: 'POST',
      status: 'inactive',
      version: 'v1.0.1',
      rateLimit: 100,
      currentRequests: 0,
      responseTime: 0,
      errorRate: 0,
      uptime: '0%',
      lastDeploy: '2 weeks ago',
      authentication: true,
      caching: false,
      documentation: true,
      environment: 'development'
    }
  ];

  // Mock API keys data
  const mockApiKeys: ApiKey[] = [
    {
      id: 'key-1',
      name: 'Production API Key',
      key: 'pk_live_1234567890abcdef',
      status: 'active',
      permissions: ['read:users', 'read:products', 'write:orders'],
      lastUsed: '5 minutes ago',
      createdAt: '2024-01-15',
      expiresAt: '2025-01-15',
      requestsToday: 1247,
      requestsTotal: 45678
    },
    {
      id: 'key-2',
      name: 'Development API Key',
      key: 'pk_test_abcdef1234567890',
      status: 'active',
      permissions: ['read:users', 'read:products'],
      lastUsed: '2 hours ago',
      createdAt: '2024-02-01',
      expiresAt: '2024-12-01',
      requestsToday: 89,
      requestsTotal: 1234
    },
    {
      id: 'key-3',
      name: 'Analytics API Key',
      key: 'pk_analytics_9876543210',
      status: 'expired',
      permissions: ['read:analytics'],
      lastUsed: '1 week ago',
      createdAt: '2023-12-01',
      expiresAt: '2024-01-01',
      requestsToday: 0,
      requestsTotal: 5678
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setEndpoints(mockEndpoints);
      setApiKeys(mockApiKeys);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'inactive':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <Pause className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'POST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'PATCH':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleEndpointAction = (endpoint: ApiEndpoint, action: string) => {
    setEndpoints(prev => prev.map(ep => {
      if (ep.id === endpoint.id) {
        switch (action) {
          case 'activate':
            return { ...ep, status: 'active' as const };
          case 'deactivate':
            return { ...ep, status: 'inactive' as const };
          case 'maintenance':
            return { ...ep, status: 'maintenance' as const };
          default:
            return ep;
        }
      }
      return ep;
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Globe className="w-8 h-8 text-purple-600" />
                API Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage API endpoints, keys, and configurations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Globe className="w-4 h-4" />
                Add Endpoint
              </button>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Endpoint Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Code className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {endpoint.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {endpoint.path}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                        {getStatusIcon(endpoint.status)}
                        <span className="ml-1 capitalize">{endpoint.status}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Version:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{endpoint.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Environment:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        endpoint.environment === 'production' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        endpoint.environment === 'staging' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {endpoint.environment}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Rate Limit:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{endpoint.rateLimit}/min</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Current Requests:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{endpoint.currentRequests}</span>
                    </div>
                  </div>
                </div>

                {/* Endpoint Metrics */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Response Time</span>
                        <span className="text-gray-900 dark:text-white">{endpoint.responseTime}ms</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            endpoint.responseTime > 200 ? 'bg-red-500' : 
                            endpoint.responseTime > 100 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(endpoint.responseTime / 2, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Error Rate</span>
                        <span className="text-gray-900 dark:text-white">{endpoint.errorRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            endpoint.errorRate > 5 ? 'bg-red-500' : 
                            endpoint.errorRate > 1 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${endpoint.errorRate * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Uptime</span>
                        <span className="text-gray-900 dark:text-white">{endpoint.uptime}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${parseFloat(endpoint.uptime.replace('%', ''))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Last Deploy:</span>
                      <span className="text-gray-900 dark:text-white">{endpoint.lastDeploy}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {endpoint.authentication && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        <Shield className="w-3 h-3 mr-1" />
                        Auth
                      </span>
                    )}
                    {endpoint.caching && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        <Zap className="w-3 h-3 mr-1" />
                        Cached
                      </span>
                    )}
                    {endpoint.documentation && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                        <FileText className="w-3 h-3 mr-1" />
                        Docs
                      </span>
                    )}
                  </div>
                </div>

                {/* Endpoint Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEndpointAction(endpoint, 'activate')}
                        disabled={endpoint.status === 'active'}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Activate Endpoint"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEndpointAction(endpoint, 'deactivate')}
                        disabled={endpoint.status === 'inactive'}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Deactivate Endpoint"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEndpointAction(endpoint, 'maintenance')}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg"
                        title="Maintenance Mode"
                      >
                        <Wrench className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Edit Endpoint">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="API Settings">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* API Keys */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-600" />
                    API Keys
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage API keys and permissions
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Key className="w-4 h-4" />
                  Generate Key
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {key.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                          {key.key.substring(0, 12)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(key.status)}`}>
                          {getStatusIcon(key.status)}
                          <span className="ml-1 capitalize">{key.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.map((permission) => (
                            <span key={permission} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                              {permission}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {key.requestsToday} today
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {key.requestsTotal} total
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {key.lastUsed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Edit Key">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded" title="Revoke Key">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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