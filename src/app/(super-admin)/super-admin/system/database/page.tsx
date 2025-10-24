'use client';

import { useState, useEffect } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Database, 
  Play, 
  Pause, 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  HardDrive,
  Cpu,
  Network,
  Shield,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  Wrench,
  Lock,
  Unlock,
  BarChart3,
  FileText,
  Zap,
  Server
} from 'lucide-react';

interface DatabaseInstance {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch';
  status: 'running' | 'stopped' | 'maintenance' | 'error';
  host: string;
  port: number;
  version: string;
  size: string;
  connections: number;
  maxConnections: number;
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  lastBackup: string;
  lastOptimization: string;
  encryption: boolean;
  replication: boolean;
  environment: 'production' | 'staging' | 'development';
}

interface DatabaseQuery {
  id: string;
  query: string;
  duration: number;
  status: 'running' | 'completed' | 'error';
  timestamp: string;
  user: string;
  database: string;
}

export default function DatabaseControlPage() {
  const [databases, setDatabases] = useState<DatabaseInstance[]>([]);
  const [queries, setQueries] = useState<DatabaseQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseInstance | null>(null);
  const [showQueryModal, setShowQueryModal] = useState(false);

  // Mock database data
  const mockDatabases: DatabaseInstance[] = [
    {
      id: 'db-01',
      name: 'Primary PostgreSQL',
      type: 'postgresql',
      status: 'running',
      host: '192.168.1.20',
      port: 5432,
      version: 'PostgreSQL 14.5',
      size: '2.4 GB',
      connections: 89,
      maxConnections: 200,
      cpu: 45,
      memory: 78,
      disk: 62,
      uptime: '8d 16h 42m',
      lastBackup: '30 minutes ago',
      lastOptimization: '2 days ago',
      encryption: true,
      replication: true,
      environment: 'production'
    },
    {
      id: 'db-02',
      name: 'PostgreSQL Replica',
      type: 'postgresql',
      status: 'running',
      host: '192.168.1.21',
      port: 5432,
      version: 'PostgreSQL 14.5',
      size: '2.4 GB',
      connections: 45,
      maxConnections: 200,
      cpu: 32,
      memory: 65,
      disk: 58,
      uptime: '6d 12h 28m',
      lastBackup: '45 minutes ago',
      lastOptimization: '3 days ago',
      encryption: true,
      replication: true,
      environment: 'production'
    },
    {
      id: 'redis-01',
      name: 'Redis Cache',
      type: 'redis',
      status: 'running',
      host: '192.168.1.30',
      port: 6379,
      version: 'Redis 6.2',
      size: '512 MB',
      connections: 156,
      maxConnections: 1000,
      cpu: 15,
      memory: 45,
      disk: 25,
      uptime: '12d 8h 15m',
      lastBackup: '1 hour ago',
      lastOptimization: '1 day ago',
      encryption: false,
      replication: true,
      environment: 'production'
    },
    {
      id: 'mysql-01',
      name: 'MySQL Analytics',
      type: 'mysql',
      status: 'maintenance',
      host: '192.168.1.40',
      port: 3306,
      version: 'MySQL 8.0',
      size: '1.8 GB',
      connections: 0,
      maxConnections: 150,
      cpu: 0,
      memory: 0,
      disk: 0,
      uptime: '0d 0h 0m',
      lastBackup: '2 hours ago',
      lastOptimization: 'Never',
      encryption: true,
      replication: false,
      environment: 'staging'
    }
  ];

  // Mock query data
  const mockQueries: DatabaseQuery[] = [
    {
      id: 'q1',
      query: 'SELECT * FROM users WHERE status = "active"',
      duration: 45,
      status: 'completed',
      timestamp: '2 minutes ago',
      user: 'admin',
      database: 'Primary PostgreSQL'
    },
    {
      id: 'q2',
      query: 'UPDATE products SET stock = stock - 1 WHERE id = 123',
      duration: 12,
      status: 'completed',
      timestamp: '5 minutes ago',
      user: 'app_user',
      database: 'Primary PostgreSQL'
    },
    {
      id: 'q3',
      query: 'SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL "24 hours"',
      duration: 234,
      status: 'running',
      timestamp: '1 minute ago',
      user: 'analytics',
      database: 'Primary PostgreSQL'
    },
    {
      id: 'q4',
      query: 'INSERT INTO logs (message, level) VALUES ("Error occurred", "error")',
      duration: 8,
      status: 'completed',
      timestamp: '10 minutes ago',
      user: 'system',
      database: 'Primary PostgreSQL'
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setDatabases(mockDatabases);
      setQueries(mockQueries);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'completed':
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
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'stopped':
        return <Pause className="w-4 h-4" />;
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
      case 'postgresql':
        return <Database className="w-4 h-4" />;
      case 'mysql':
        return <Database className="w-4 h-4" />;
      case 'mongodb':
        return <Database className="w-4 h-4" />;
      case 'redis':
        return <Zap className="w-4 h-4" />;
      case 'elasticsearch':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const handleDatabaseAction = (database: DatabaseInstance, action: string) => {
    setDatabases(prev => prev.map(db => {
      if (db.id === database.id) {
        switch (action) {
          case 'start':
            return { ...db, status: 'running' as const };
          case 'stop':
            return { ...db, status: 'stopped' as const };
          case 'restart':
            return { ...db, status: 'maintenance' as const };
          default:
            return db;
        }
      }
      return db;
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Database className="w-8 h-8 text-purple-600" />
                Database Control
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and monitor database instances
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Database className="w-4 h-4" />
                Add Database
              </button>
            </div>
          </div>

          {/* Database Instances */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {databases.map((database) => (
              <div key={database.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Database Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        {getTypeIcon(database.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {database.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {database.host}:{database.port}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(database.status)}`}>
                      {getStatusIcon(database.status)}
                      <span className="ml-1 capitalize">{database.status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Version:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{database.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Size:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{database.size}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Environment:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        database.environment === 'production' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        database.environment === 'staging' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {database.environment}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Connections:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{database.connections}/{database.maxConnections}</span>
                    </div>
                  </div>
                </div>

                {/* Database Metrics */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">CPU</span>
                        <span className="text-gray-900 dark:text-white">{database.cpu}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            database.cpu > 80 ? 'bg-red-500' : 
                            database.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${database.cpu}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Memory</span>
                        <span className="text-gray-900 dark:text-white">{database.memory}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            database.memory > 80 ? 'bg-red-500' : 
                            database.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${database.memory}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Disk</span>
                        <span className="text-gray-900 dark:text-white">{database.disk}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            database.disk > 80 ? 'bg-red-500' : 
                            database.disk > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${database.disk}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
                      <span className="text-gray-900 dark:text-white">{database.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Last Backup:</span>
                      <span className="text-gray-900 dark:text-white">{database.lastBackup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Last Optimization:</span>
                      <span className="text-gray-900 dark:text-white">{database.lastOptimization}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {database.encryption && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        <Lock className="w-3 h-3 mr-1" />
                        Encrypted
                      </span>
                    )}
                    {database.replication && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        <Server className="w-3 h-3 mr-1" />
                        Replicated
                      </span>
                    )}
                  </div>
                </div>

                {/* Database Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDatabaseAction(database, 'start')}
                        disabled={database.status === 'running'}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Start Database"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDatabaseAction(database, 'stop')}
                        disabled={database.status === 'stopped'}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Stop Database"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDatabaseAction(database, 'restart')}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg"
                        title="Restart Database"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Backup">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Optimize">
                        <Wrench className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Database Settings">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Queries */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Active Queries
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor currently running database queries
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Query
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Database
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {queries.map((query) => (
                    <tr key={query.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                          {query.query.length > 50 ? `${query.query.substring(0, 50)}...` : query.query}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {query.duration}ms
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                          {getStatusIcon(query.status)}
                          <span className="ml-1 capitalize">{query.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {query.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {query.database}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {query.timestamp}
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