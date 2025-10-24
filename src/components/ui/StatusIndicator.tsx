'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Server, Database, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface SystemStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  responseTime?: number;
  uptime?: string;
  lastCheck: Date;
  description: string;
}

const mockSystemStatus: SystemStatus[] = [
  {
    id: '1',
    name: 'Web Server',
    status: 'online',
    responseTime: 45,
    uptime: '99.9%',
    lastCheck: new Date(),
    description: 'Main application server'
  },
  {
    id: '2',
    name: 'Database',
    status: 'online',
    responseTime: 12,
    uptime: '99.8%',
    lastCheck: new Date(),
    description: 'Primary database server'
  },
  {
    id: '3',
    name: 'API Gateway',
    status: 'warning',
    responseTime: 180,
    uptime: '98.5%',
    lastCheck: new Date(),
    description: 'API routing and authentication'
  },
  {
    id: '4',
    name: 'File Storage',
    status: 'online',
    responseTime: 25,
    uptime: '99.7%',
    lastCheck: new Date(),
    description: 'File upload and storage service'
  },
  {
    id: '5',
    name: 'Email Service',
    status: 'error',
    responseTime: 5000,
    uptime: '95.2%',
    lastCheck: new Date(),
    description: 'Email delivery service'
  },
  {
    id: '6',
    name: 'Payment Gateway',
    status: 'online',
    responseTime: 35,
    uptime: '99.9%',
    lastCheck: new Date(),
    description: 'Payment processing service'
  }
];

export function StatusIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>(mockSystemStatus);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => 
        prev.map(service => ({
          ...service,
          lastCheck: new Date(),
          responseTime: service.status === 'online' 
            ? Math.floor(Math.random() * 100) + 10
            : service.responseTime
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshSystemStatus = async () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update system status with fresh data
    setSystemStatus(prev => 
      prev.map(service => ({
        ...service,
        lastCheck: new Date(),
        responseTime: service.status === 'online' 
          ? Math.floor(Math.random() * 100) + 10
          : service.responseTime,
        // Simulate some status changes
        status: Math.random() > 0.95 ? 
          (service.status === 'online' ? 'warning' : 'online') : 
          service.status
      }))
    );
    
    setIsRefreshing(false);
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
      case 'error': return <AlertTriangle className="w-4 h-4" />;
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

  const onlineServices = systemStatus.filter(s => s.status === 'online').length;
  const totalServices = systemStatus.length;
  const hasErrors = systemStatus.some(s => s.status === 'error');
  const hasWarnings = systemStatus.some(s => s.status === 'warning');

  return (
    <div className="relative">
      {/* Status Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="System Status"
      >
        <Server className="w-5 h-5" />
        {hasErrors && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse z-10"></span>
        )}
        {!hasErrors && hasWarnings && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full z-10"></span>
        )}
      </button>

      {/* Status Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[calc(100vh-8rem)] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                System Status
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="sr-only">Close</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Overall:</span>
                <span className={`text-sm font-medium ${hasErrors ? 'text-red-600 dark:text-red-400' : hasWarnings ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {hasErrors ? 'Issues Detected' : hasWarnings ? 'Warnings' : 'All Systems Operational'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Uptime:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {onlineServices}/{totalServices} Services
                </span>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-16rem)]">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {systemStatus.map((service) => (
                <div key={service.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`p-1 rounded-full ${getStatusBgColor(service.status)}`}>
                          {getStatusIcon(service.status)}
                        </span>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {service.name}
                        </h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(service.status)} ${getStatusBgColor(service.status)}`}>
                          {service.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="grid grid-cols-1 gap-1 text-xs text-gray-600 dark:text-gray-400">
                        {service.responseTime && (
                          <div className="flex items-center justify-between">
                            <span>Response Time:</span>
                            <span className="font-medium">{service.responseTime}ms</span>
                          </div>
                        )}
                        {service.uptime && (
                          <div className="flex items-center justify-between">
                            <span>Uptime:</span>
                            <span className="font-medium">{service.uptime}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>Last Check:</span>
                          <span className="font-medium">{service.lastCheck.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshSystemStatus}
                  disabled={isRefreshing}
                  className={`flex items-center gap-1 font-medium transition-colors ${
                    isRefreshing 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
                  }`}
                >
                  {isRefreshing ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </button>
                <span className="text-gray-400">|</span>
                <Link
                  href="/admin/system-status"
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 