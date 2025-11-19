'use client';

import { useState, useEffect } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Server, 
  Play, 
  Pause, 
  Power, 
  PowerOff, 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  HardDrive,
  Cpu,
  Network,
  Globe,
  Shield,
  Database,
  Zap,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
  Wrench
} from 'lucide-react';

interface ServerInstance {
  id: string;
  name: string;
  type: 'web' | 'database' | 'cache' | 'load-balancer' | 'storage';
  status: 'running' | 'stopped' | 'maintenance' | 'error';
  ip: string;
  location: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  lastBackup: string;
  version: string;
  environment: 'production' | 'staging' | 'development';
  tags: string[];
}

export default function ServerManagementPage() {
  const [servers, setServers] = useState<ServerInstance[]>([]);
  const [selectedServer, setSelectedServer] = useState<ServerInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock server data
  const mockServers: ServerInstance[] = [
    {
      id: 'web-01',
      name: 'Web Server 01',
      type: 'web',
      status: 'running',
      ip: '192.168.1.10',
      location: 'US East',
      cpu: 23,
      memory: 67,
      disk: 45,
      network: 12,
      uptime: '15d 8h 32m',
      lastBackup: '2 hours ago',
      version: '2.1.4',
      environment: 'production',
      tags: ['nginx', 'ssl', 'load-balanced']
    },
    {
      id: 'web-02',
      name: 'Web Server 02',
      type: 'web',
      status: 'running',
      ip: '192.168.1.11',
      location: 'US East',
      cpu: 18,
      memory: 54,
      disk: 38,
      network: 8,
      uptime: '12d 4h 15m',
      lastBackup: '1 hour ago',
      version: '2.1.4',
      environment: 'production',
      tags: ['nginx', 'ssl', 'load-balanced']
    },
    {
      id: 'db-01',
      name: 'Database Server 01',
      type: 'database',
      status: 'running',
      ip: '192.168.1.20',
      location: 'US East',
      cpu: 45,
      memory: 78,
      disk: 62,
      network: 5,
      uptime: '8d 16h 42m',
      lastBackup: '30 minutes ago',
      version: 'PostgreSQL 14.5',
      environment: 'production',
      tags: ['postgresql', 'primary', 'encrypted']
    },
    {
      id: 'db-02',
      name: 'Database Server 02',
      type: 'database',
      status: 'running',
      ip: '192.168.1.21',
      location: 'US East',
      cpu: 32,
      memory: 65,
      disk: 58,
      network: 3,
      uptime: '6d 12h 28m',
      lastBackup: '45 minutes ago',
      version: 'PostgreSQL 14.5',
      environment: 'production',
      tags: ['postgresql', 'replica', 'encrypted']
    },
    {
      id: 'cache-01',
      name: 'Cache Server 01',
      type: 'cache',
      status: 'maintenance',
      ip: '192.168.1.30',
      location: 'US East',
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
      uptime: '0d 0h 0m',
      lastBackup: 'Never',
      version: 'Redis 6.2',
      environment: 'production',
      tags: ['redis', 'cluster']
    },
    {
      id: 'lb-01',
      name: 'Load Balancer 01',
      type: 'load-balancer',
      status: 'running',
      ip: '192.168.1.40',
      location: 'US East',
      cpu: 15,
      memory: 42,
      disk: 25,
      network: 35,
      uptime: '20d 3h 15m',
      lastBackup: '4 hours ago',
      version: 'HAProxy 2.4',
      environment: 'production',
      tags: ['haproxy', 'ssl-termination']
    },
    {
      id: 'storage-01',
      name: 'Storage Server 01',
      type: 'storage',
      status: 'running',
      ip: '192.168.1.50',
      location: 'US East',
      cpu: 28,
      memory: 55,
      disk: 85,
      network: 18,
      uptime: '25d 7h 33m',
      lastBackup: '6 hours ago',
      version: 'NFS 4.2',
      environment: 'production',
      tags: ['nfs', 'backup', 'redundant']
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setServers(mockServers);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredServers = servers.filter(server => {
    const matchesFilter = filter === 'all' || server.status === filter;
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         server.ip.includes(searchTerm) ||
                         server.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'stopped':
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
      case 'running':
        return <CheckCircle className="w-4 h-4" />;
      case 'stopped':
        return <PowerOff className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web':
        return <Globe className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'cache':
        return <Zap className="w-4 h-4" />;
      case 'load-balancer':
        return <Network className="w-4 h-4" />;
      case 'storage':
        return <HardDrive className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const handleServerAction = (server: ServerInstance, action: string) => {
    // Simulate server action
    setServers(prev => prev.map(s => {
      if (s.id === server.id) {
        switch (action) {
          case 'start':
            return { ...s, status: 'running' as const };
          case 'stop':
            return { ...s, status: 'stopped' as const };
          case 'restart':
            return { ...s, status: 'maintenance' as const };
          default:
            return s;
        }
      }
      return s;
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                Server Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and monitor server instances
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Server className="w-4 h-4" />
                Add Server
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search servers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="running">Running</option>
                  <option value="stopped">Stopped</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="error">Error</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Server Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServers.map((server) => (
              <div key={server.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Server Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        {getTypeIcon(server.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {server.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {server.ip}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
                      {getStatusIcon(server.status)}
                      <span className="ml-1 capitalize">{server.status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Location:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{server.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Environment:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        server.environment === 'production' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        server.environment === 'staging' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {server.environment}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Server Metrics */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">CPU</span>
                        <span className="text-gray-900 dark:text-white">{server.cpu}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            server.cpu > 80 ? 'bg-red-500' : 
                            server.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${server.cpu}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Memory</span>
                        <span className="text-gray-900 dark:text-white">{server.memory}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            server.memory > 80 ? 'bg-red-500' : 
                            server.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${server.memory}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Disk</span>
                        <span className="text-gray-900 dark:text-white">{server.disk}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            server.disk > 80 ? 'bg-red-500' : 
                            server.disk > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${server.disk}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Network</span>
                        <span className="text-gray-900 dark:text-white">{server.network}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            server.network > 80 ? 'bg-red-500' : 
                            server.network > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${server.network}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
                      <span className="text-gray-900 dark:text-white">{server.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Version:</span>
                      <span className="text-gray-900 dark:text-white">{server.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Last Backup:</span>
                      <span className="text-gray-900 dark:text-white">{server.lastBackup}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {server.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Server Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleServerAction(server, 'start')}
                        disabled={server.status === 'running'}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Start Server"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleServerAction(server, 'stop')}
                        disabled={server.status === 'stopped'}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Stop Server"
                      >
                        <PowerOff className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleServerAction(server, 'restart')}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg"
                        title="Restart Server"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Edit Server">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Server Settings">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredServers.length === 0 && (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No servers found
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
