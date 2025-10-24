'use client';

import { useState, useEffect } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Network, 
  Wifi, 
  WifiOff, 
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
  Server,
  Globe,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Code,
  Key,
  Database,
  Router,
  Cable,
  Signal
} from 'lucide-react';

interface NetworkDevice {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'firewall' | 'load-balancer' | 'access-point';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  ip: string;
  mac: string;
  location: string;
  bandwidth: number;
  currentTraffic: number;
  latency: number;
  packetLoss: number;
  uptime: string;
  lastUpdate: string;
  firmware: string;
  security: boolean;
  monitoring: boolean;
  environment: 'production' | 'staging' | 'development';
}

interface NetworkTraffic {
  id: string;
  source: string;
  destination: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS';
  port: number;
  bytes: number;
  packets: number;
  timestamp: string;
  status: 'active' | 'blocked' | 'monitored';
}

export default function NetworkControlPage() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [traffic, setTraffic] = useState<NetworkTraffic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [showTrafficModal, setShowTrafficModal] = useState(false);

  // Mock network devices data
  const mockDevices: NetworkDevice[] = [
    {
      id: 'router-01',
      name: 'Core Router 01',
      type: 'router',
      status: 'online',
      ip: '192.168.1.1',
      mac: '00:1B:44:11:3A:B7',
      location: 'Data Center A',
      bandwidth: 1000,
      currentTraffic: 456,
      latency: 2,
      packetLoss: 0.01,
      uptime: '45d 12h 33m',
      lastUpdate: '30 seconds ago',
      firmware: 'v2.1.4',
      security: true,
      monitoring: true,
      environment: 'production'
    },
    {
      id: 'switch-01',
      name: 'Access Switch 01',
      type: 'switch',
      status: 'online',
      ip: '192.168.1.10',
      mac: '00:1B:44:11:3A:B8',
      location: 'Floor 1',
      bandwidth: 100,
      currentTraffic: 78,
      latency: 1,
      packetLoss: 0.005,
      uptime: '30d 8h 15m',
      lastUpdate: '1 minute ago',
      firmware: 'v1.8.2',
      security: true,
      monitoring: true,
      environment: 'production'
    },
    {
      id: 'firewall-01',
      name: 'Perimeter Firewall',
      type: 'firewall',
      status: 'online',
      ip: '192.168.1.100',
      mac: '00:1B:44:11:3A:B9',
      location: 'DMZ',
      bandwidth: 500,
      currentTraffic: 234,
      latency: 5,
      packetLoss: 0.02,
      uptime: '60d 4h 22m',
      lastUpdate: '2 minutes ago',
      firmware: 'v3.2.1',
      security: true,
      monitoring: true,
      environment: 'production'
    },
    {
      id: 'lb-01',
      name: 'Load Balancer 01',
      type: 'load-balancer',
      status: 'online',
      ip: '192.168.1.50',
      mac: '00:1B:44:11:3A:BA',
      location: 'Data Center A',
      bandwidth: 200,
      currentTraffic: 123,
      latency: 3,
      packetLoss: 0.008,
      uptime: '25d 16h 45m',
      lastUpdate: '45 seconds ago',
      firmware: 'v2.0.8',
      security: true,
      monitoring: true,
      environment: 'production'
    },
    {
      id: 'ap-01',
      name: 'WiFi Access Point 01',
      type: 'access-point',
      status: 'maintenance',
      ip: '192.168.1.200',
      mac: '00:1B:44:11:3A:BB',
      location: 'Conference Room',
      bandwidth: 50,
      currentTraffic: 0,
      latency: 0,
      packetLoss: 0,
      uptime: '0d 0h 0m',
      lastUpdate: '5 minutes ago',
      firmware: 'v1.5.3',
      security: true,
      monitoring: false,
      environment: 'staging'
    },
    {
      id: 'switch-02',
      name: 'Test Switch 01',
      type: 'switch',
      status: 'offline',
      ip: '192.168.1.20',
      mac: '00:1B:44:11:3A:BC',
      location: 'Lab',
      bandwidth: 10,
      currentTraffic: 0,
      latency: 0,
      packetLoss: 0,
      uptime: '0d 0h 0m',
      lastUpdate: '1 hour ago',
      firmware: 'v1.7.1',
      security: false,
      monitoring: false,
      environment: 'development'
    }
  ];

  // Mock network traffic data
  const mockTraffic: NetworkTraffic[] = [
    {
      id: 't1',
      source: '192.168.1.100',
      destination: '10.0.0.50',
      protocol: 'HTTPS',
      port: 443,
      bytes: 1024000,
      packets: 1500,
      timestamp: '2 minutes ago',
      status: 'active'
    },
    {
      id: 't2',
      source: '192.168.1.101',
      destination: '8.8.8.8',
      protocol: 'DNS',
      port: 53,
      bytes: 512,
      packets: 1,
      timestamp: '5 minutes ago',
      status: 'active'
    },
    {
      id: 't3',
      source: '192.168.1.102',
      destination: '192.168.1.1',
      protocol: 'ICMP',
      port: 0,
      bytes: 64,
      packets: 1,
      timestamp: '1 minute ago',
      status: 'monitored'
    },
    {
      id: 't4',
      source: '10.0.0.100',
      destination: '192.168.1.50',
      protocol: 'HTTP',
      port: 80,
      bytes: 2048000,
      packets: 3000,
      timestamp: '3 minutes ago',
      status: 'blocked'
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setDevices(mockDevices);
      setTraffic(mockTraffic);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'offline':
      case 'blocked':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
      case 'maintenance':
      case 'monitored':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'offline':
      case 'blocked':
        return <WifiOff className="w-4 h-4" />;
      case 'maintenance':
      case 'monitored':
        return <Wrench className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'router':
        return <Router className="w-4 h-4" />;
      case 'switch':
        return <Cable className="w-4 h-4" />;
      case 'firewall':
        return <Shield className="w-4 h-4" />;
      case 'load-balancer':
        return <Network className="w-4 h-4" />;
      case 'access-point':
        return <Wifi className="w-4 h-4" />;
      default:
        return <Network className="w-4 h-4" />;
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'HTTPS':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'HTTP':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'TCP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'UDP':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'ICMP':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleDeviceAction = (device: NetworkDevice, action: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === device.id) {
        switch (action) {
          case 'restart':
            return { ...d, status: 'maintenance' as const };
          case 'enable':
            return { ...d, status: 'online' as const };
          case 'disable':
            return { ...d, status: 'offline' as const };
          default:
            return d;
        }
      }
      return d;
    }));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                <Network className="w-8 h-8 text-purple-600" />
                Network Control
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage network infrastructure and monitor traffic
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Network className="w-4 h-4" />
                Add Device
              </button>
            </div>
          </div>

          {/* Network Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {devices.map((device) => (
              <div key={device.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Device Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        {getTypeIcon(device.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {device.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {device.ip} • {device.location}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                      {getStatusIcon(device.status)}
                      <span className="ml-1 capitalize">{device.status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Type:</span>
                      <span className="text-gray-900 dark:text-white ml-2 capitalize">{device.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Environment:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        device.environment === 'production' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        device.environment === 'staging' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {device.environment}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Bandwidth:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{device.bandwidth} Mbps</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Firmware:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{device.firmware}</span>
                    </div>
                  </div>
                </div>

                {/* Device Metrics */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Traffic</span>
                        <span className="text-gray-900 dark:text-white">{device.currentTraffic} Mbps</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            device.currentTraffic > device.bandwidth * 0.8 ? 'bg-red-500' : 
                            device.currentTraffic > device.bandwidth * 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(device.currentTraffic / device.bandwidth) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Latency</span>
                        <span className="text-gray-900 dark:text-white">{device.latency}ms</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            device.latency > 10 ? 'bg-red-500' : 
                            device.latency > 5 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(device.latency * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Packet Loss</span>
                        <span className="text-gray-900 dark:text-white">{device.packetLoss}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            device.packetLoss > 1 ? 'bg-red-500' : 
                            device.packetLoss > 0.1 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${device.packetLoss * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
                      <span className="text-gray-900 dark:text-white">{device.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Last Update:</span>
                      <span className="text-gray-900 dark:text-white">{device.lastUpdate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {device.security && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        <Shield className="w-3 h-3 mr-1" />
                        Secured
                      </span>
                    )}
                    {device.monitoring && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        <Activity className="w-3 h-3 mr-1" />
                        Monitored
                      </span>
                    )}
                  </div>
                </div>

                {/* Device Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeviceAction(device, 'enable')}
                        disabled={device.status === 'online'}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Enable Device"
                      >
                        <Wifi className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeviceAction(device, 'disable')}
                        disabled={device.status === 'offline'}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Disable Device"
                      >
                        <WifiOff className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeviceAction(device, 'restart')}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg"
                        title="Restart Device"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Edit Device">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Device Settings">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Network Traffic */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Network Traffic
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor active network connections and traffic flow
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Protocol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Port
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {traffic.map((flow) => (
                    <tr key={flow.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                          {flow.source}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                          {flow.destination}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProtocolColor(flow.protocol)}`}>
                          {flow.protocol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {flow.port}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatBytes(flow.bytes)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {flow.packets} packets
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flow.status)}`}>
                          {getStatusIcon(flow.status)}
                          <span className="ml-1 capitalize">{flow.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {flow.timestamp}
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