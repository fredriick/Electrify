"use client";

import React, { useState } from "react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { 
  Shield, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Settings,
  ExternalLink,
  FileText,
  Users,
  Activity,
  Zap,
  Lock,
  Unlock,
  Flag,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Bell,
  MessageSquare,
  Star,
  StarOff,
  Archive,
  Send,
  UserCheck,
  UserX,
  Database,
  CreditCard
} from "lucide-react";

export default function AlertsPage() {
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("24h");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

  // Mock alerts data
  const alerts = [
    {
      id: 1,
      title: "Unusual Login Pattern Detected",
      description: "Multiple failed login attempts from new IP address detected",
      priority: "high",
      status: "active",
      timestamp: "2024-01-15T10:30:00Z",
      category: "authentication",
      source: "security-monitor",
      assignedTo: "admin@electrify.com",
      response: "Under investigation",
      tags: ["login", "security", "investigation"]
    },
    {
      id: 2,
      title: "SSL Certificate Expiring Soon",
      description: "SSL certificate for api.electrify.com expires in 15 days",
      priority: "medium",
      status: "pending",
      timestamp: "2024-01-15T09:15:00Z",
      category: "certificate",
      source: "certificate-monitor",
      assignedTo: "system",
      response: "Scheduled for renewal",
      tags: ["ssl", "certificate", "maintenance"]
    },
    {
      id: 3,
      title: "Database Connection Spike",
      description: "Unusual number of database connections detected",
      priority: "critical",
      status: "resolved",
      timestamp: "2024-01-15T08:45:00Z",
      category: "database",
      source: "db-monitor",
      assignedTo: "admin@electrify.com",
      response: "Connection pool optimized",
      tags: ["database", "performance", "resolved"]
    },
    {
      id: 4,
      title: "Suspicious File Upload",
      description: "Potential malicious file uploaded to product images",
      priority: "high",
      status: "investigating",
      timestamp: "2024-01-15T07:20:00Z",
      category: "malware",
      source: "file-scanner",
      assignedTo: "security@electrify.com",
      response: "File quarantined for analysis",
      tags: ["malware", "upload", "quarantine"]
    },
    {
      id: 5,
      title: "Payment Gateway Error",
      description: "Payment processing service experiencing delays",
      priority: "medium",
      status: "active",
      timestamp: "2024-01-15T06:30:00Z",
      category: "payment",
      source: "payment-monitor",
      assignedTo: "support@theelectrifystore.com",
      response: "Working with payment provider",
      tags: ["payment", "gateway", "delay"]
    },
    {
      id: 6,
      title: "Server Resource Usage High",
      description: "CPU usage exceeded 90% for more than 10 minutes",
      priority: "medium",
      status: "resolved",
      timestamp: "2024-01-15T05:15:00Z",
      category: "performance",
      source: "server-monitor",
      assignedTo: "admin@electrify.com",
      response: "Load balanced and optimized",
      tags: ["performance", "cpu", "resolved"]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
      case "high": return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20";
      case "medium": return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "low": return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
      default: return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
      case "pending": return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "investigating": return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20";
      case "resolved": return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      default: return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "authentication": return <Lock className="w-4 h-4" />;
      case "certificate": return <Shield className="w-4 h-4" />;
      case "database": return <Database className="w-4 h-4" />;
      case "malware": return <AlertTriangle className="w-4 h-4" />;
      case "payment": return <CreditCard className="w-4 h-4" />;
      case "performance": return <Activity className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleSelectAll = () => {
    if (selectedAlerts.length === alerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(alerts.map(a => a.id));
    }
  };

  const handleSelectAlert = (id: number) => {
    if (selectedAlerts.includes(id)) {
      setSelectedAlerts(selectedAlerts.filter(a => a !== id));
    } else {
      setSelectedAlerts([...selectedAlerts, id]);
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on alerts:`, selectedAlerts);
    // In a real app, this would make API calls
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesPriority = filterPriority === "all" || alert.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus;
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPriority && matchesStatus && matchesSearch;
  });

  const alertStats = {
    total: alerts.length,
    critical: alerts.filter(a => a.priority === "critical").length,
    high: alerts.filter(a => a.priority === "high").length,
    medium: alerts.filter(a => a.priority === "medium").length,
    low: alerts.filter(a => a.priority === "low").length,
    active: alerts.filter(a => a.status === "active").length,
    resolved: alerts.filter(a => a.status === "resolved").length
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Alerts</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage and respond to security alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{alertStats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
                <p className="text-2xl font-bold text-red-600">{alertStats.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-orange-600">{alertStats.active}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{alertStats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAlerts.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {selectedAlerts.length} alert(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction("acknowledge")}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Acknowledge
                </button>
                <button
                  onClick={() => handleBulkAction("resolve")}
                  className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Resolve
                </button>
                <button
                  onClick={() => handleBulkAction("assign")}
                  className="flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Assign
                </button>
                <button
                  onClick={() => handleBulkAction("export")}
                  className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedAlerts.length === alerts.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Alert
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.includes(alert.id)}
                        onChange={() => handleSelectAlert(alert.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{alert.description}</div>
                        <div className="flex items-center mt-1">
                          {alert.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getCategoryIcon(alert.category)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">{alert.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {alert.assignedTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:hover:text-green-400" title="Resolve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900 dark:hover:text-purple-400" title="Assign">
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 dark:hover:text-gray-400" title="Archive">
                          <Archive className="w-4 h-4" />
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
    </SuperAdminLayout>
  );
} 