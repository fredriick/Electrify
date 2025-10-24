"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity, 
  Eye, 
  Lock,
  Key,
  Globe,
  Server,
  Database, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Zap, 
  RefreshCw,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Info,
  Wifi,
  WifiOff,
  UserCheck,
  UserX,
  MapPin,
  Calendar,
  BarChart3
} from "lucide-react";

const SecurityOverviewPage = () => {
  const [timeRange, setTimeRange] = useState("24h");
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  // Mock security data
  const securityStatus = {
    overall: "Protected",
    score: 92,
    threats: {
      blocked: 1247,
      attempted: 1342,
      successful: 0
    },
    lastUpdated: "2 minutes ago"
  };

  const securityMetrics = [
    {
      title: "Firewall Status",
      value: "Active",
      status: "success",
      icon: Shield,
      change: "+2.3%",
      trend: "up"
    },
    {
      title: "SSL Certificates",
      value: "Valid",
      status: "success", 
      icon: Lock,
      change: "0%",
      trend: "neutral"
    },
    {
      title: "DDoS Protection",
      value: "Enabled",
      status: "success",
      icon: Zap,
      change: "+5.1%",
      trend: "up"
    },
    {
      title: "Malware Detection",
      value: "Scanning",
      status: "warning",
      icon: AlertTriangle,
      change: "-1.2%",
      trend: "down"
    }
  ];

  const recentThreats = [
    {
      id: 1,
      type: "Brute Force Attack",
      source: "192.168.1.100",
      location: "United States",
      severity: "high",
      status: "Blocked",
      timestamp: "2 minutes ago",
      attempts: 47
    },
    {
      id: 2,
      type: "SQL Injection",
      source: "203.45.67.89",
      location: "China",
      severity: "critical",
      status: "Blocked",
      timestamp: "5 minutes ago",
      attempts: 12
    },
    {
      id: 3,
      type: "XSS Attempt",
      source: "91.234.56.78",
      location: "Russia",
      severity: "medium",
      status: "Blocked",
      timestamp: "8 minutes ago",
      attempts: 3
    },
    {
      id: 4,
      type: "Port Scan",
      source: "45.67.89.123",
      location: "Germany",
      severity: "low",
      status: "Blocked",
      timestamp: "12 minutes ago",
      attempts: 156
    }
  ];

  const securityAlerts = [
    {
      id: 1,
      title: "Unusual Login Pattern Detected",
      description: "Multiple failed login attempts from new IP address",
      severity: "medium",
      timestamp: "10 minutes ago",
      status: "Active"
    },
    {
      id: 2,
      title: "SSL Certificate Expiring Soon",
      description: "Certificate for api.electrify.com expires in 15 days",
      severity: "low",
      timestamp: "1 hour ago",
      status: "Pending"
    },
    {
      id: 3,
      title: "Database Connection Spike",
      description: "Unusual number of database connections detected",
      severity: "high",
      timestamp: "2 hours ago",
      status: "Resolved"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      case "warning": return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "error": return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
      default: return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
      case "high": return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20";
      case "medium": return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "low": return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
      default: return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Simulate API call to refresh security data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the last refresh time
      setLastRefreshTime(new Date());
      
      // In a real application, you would fetch fresh data here
      // For now, we'll just simulate the refresh
      console.log('Security data refreshed successfully');
      
    } catch (error) {
      console.error('Failed to refresh security data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastRefreshTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
          <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Overview</h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor and manage system security</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 border-2 border-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isRefreshing 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Security Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Security</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor("success")}`}>
                {securityStatus.overall}
            </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{securityStatus.score}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">/ 100</div>
              </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${securityStatus.score}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Updated {formatLastRefreshTime(lastRefreshTime)}</p>
                </div>

          {securityMetrics.map((metric, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{metric.title}</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </div>
              </div>
            <div className="flex items-center justify-between">
                <metric.icon className="w-8 h-8 text-blue-600" />
                <div className="flex items-center gap-2">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm font-medium ${
                    metric.trend === "up" ? "text-green-600" : 
                    metric.trend === "down" ? "text-red-600" : "text-gray-600"
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Threat Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Threat Statistics</h3>
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Threats Blocked</span>
                <span className="text-2xl font-bold text-green-600">{securityStatus.threats.blocked}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Attempted Attacks</span>
                <span className="text-2xl font-bold text-orange-600">{securityStatus.threats.attempted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Successful Attacks</span>
                <span className="text-2xl font-bold text-red-600">{securityStatus.threats.successful}</span>
              </div>
              </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Sessions</h3>
              <Users className="w-5 h-5 text-blue-600" />
              </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Sessions</span>
                <span className="text-2xl font-bold text-blue-600">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="text-2xl font-bold text-green-600">892</span>
        </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Suspicious</span>
                <span className="text-2xl font-bold text-yellow-600">3</span>
              </div>
              </div>
            </div>
            
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h3>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                <span className="text-2xl font-bold text-green-600">99.9%</span>
          </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                <span className="text-2xl font-bold text-blue-600">45ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Load Average</span>
                <span className="text-2xl font-bold text-orange-600">0.8</span>
                  </div>
            </div>
          </div>
        </div>

        {/* Recent Threats and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Threats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Threats</h3>
                        <Link href="/super-admin/security/threats" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View All
                        </Link>
              </div>
              <div className="p-6">
              <div className="space-y-4">
                {recentThreats.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        threat.severity === "critical" ? "bg-red-500" :
                        threat.severity === "high" ? "bg-orange-500" :
                        threat.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{threat.type}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{threat.source} • {threat.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{threat.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
                  </div>
                </div>
                
          {/* Security Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Alerts</h3>
                        <Link href="/super-admin/security/alerts" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View All
                        </Link>
                      </div>
            <div className="p-6">
              <div className="space-y-4">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === "high" ? "bg-red-500" :
                      alert.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.status === "Active" ? "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20" :
                          alert.status === "Pending" ? "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20" :
                          "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
                        }`}>
                          {alert.status}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{alert.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
              </div>
              
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Logs</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Globe className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">IP Management</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Key className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">2FA Settings</span>
                  </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Settings className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Security Config</span>
                  </button>
                </div>
              </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SecurityOverviewPage; 