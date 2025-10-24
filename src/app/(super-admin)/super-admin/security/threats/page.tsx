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
  Ban, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Globe, 
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
  ChevronUp
} from "lucide-react";

export default function ThreatsPage() {
  const [selectedThreats, setSelectedThreats] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("24h");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Mock threats data
  const threats = [
    {
      id: 1,
      type: "Brute Force Attack",
      source: "192.168.1.100",
      location: "United States",
      severity: "high",
      status: "blocked",
      timestamp: "2024-01-15T10:30:00Z",
      attempts: 47,
      target: "admin@electrify.com",
      description: "Multiple failed login attempts detected",
      response: "IP blocked automatically"
    },
    {
      id: 2,
      type: "SQL Injection",
      source: "203.45.67.89",
      location: "China",
      severity: "critical",
      status: "blocked",
      timestamp: "2024-01-15T09:15:00Z",
      attempts: 12,
      target: "api.electrify.com",
      description: "SQL injection attempt on login form",
      response: "Request blocked by WAF"
    },
    {
      id: 3,
      type: "XSS Attempt",
      source: "91.234.56.78",
      location: "Russia",
      severity: "medium",
      status: "blocked",
      timestamp: "2024-01-15T08:45:00Z",
      attempts: 3,
      target: "product.electrify.com",
      description: "Cross-site scripting attempt in product reviews",
      response: "Input sanitized and blocked"
    },
    {
      id: 4,
      type: "Port Scan",
      source: "45.67.89.123",
      location: "Germany",
      severity: "low",
      status: "monitoring",
      timestamp: "2024-01-15T07:20:00Z",
      attempts: 156,
      target: "server.electrify.com",
      description: "Port scanning activity detected",
      response: "Under investigation"
    },
    {
      id: 5,
      type: "DDoS Attack",
      source: "Multiple IPs",
      location: "Various",
      severity: "critical",
      status: "mitigated",
      timestamp: "2024-01-15T06:30:00Z",
      attempts: 15000,
      target: "electrify.com",
      description: "Distributed denial of service attack",
      response: "Traffic filtered by CDN"
    },
    {
      id: 6,
      type: "Phishing Attempt",
      source: "78.90.12.34",
      location: "Netherlands",
      severity: "medium",
      status: "blocked",
      timestamp: "2024-01-15T05:45:00Z",
      attempts: 1,
      target: "support@theelectrifystore.com",
      description: "Phishing email attempting to steal credentials",
      response: "Email quarantined"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "blocked": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "mitigated": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "monitoring": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "investigating": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const handleSelectAll = () => {
    if (selectedThreats.length === threats.length) {
      setSelectedThreats([]);
    } else {
      setSelectedThreats(threats.map(t => t.id));
    }
  };

  const handleSelectThreat = (id: number) => {
    if (selectedThreats.includes(id)) {
      setSelectedThreats(selectedThreats.filter(t => t !== id));
    } else {
      setSelectedThreats([...selectedThreats, id]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedThreats.length === 0) {
      setNotification({ type: 'error', message: 'Please select threats to perform bulk actions' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    switch (action) {
      case "block":
        console.log(`Blocking ${selectedThreats.length} threats:`, selectedThreats);
        setNotification({ type: 'success', message: `${selectedThreats.length} threats blocked successfully` });
        setSelectedThreats([]);
        break;
      case "investigate":
        console.log(`Investigating ${selectedThreats.length} threats:`, selectedThreats);
        setNotification({ type: 'success', message: `${selectedThreats.length} threats marked for investigation` });
        setSelectedThreats([]);
        break;
      case "export":
        // Export only selected threats
        setIsExporting(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const selectedThreatsData = threats.filter(threat => selectedThreats.includes(threat.id));
          const csvContent = [
            "ID,Type,Source,Location,Severity,Status,Timestamp,Attempts,Target,Description,Response",
            ...selectedThreatsData.map(threat => 
              `${threat.id},"${threat.type}","${threat.source}","${threat.location}","${threat.severity}","${threat.status}","${threat.timestamp}",${threat.attempts},"${threat.target}","${threat.description}","${threat.response}"`
            )
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `selected_threats_export_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setNotification({ type: 'success', message: `${selectedThreats.length} threats exported successfully` });
          setSelectedThreats([]);
        } catch (error) {
          setNotification({ type: 'error', message: 'Failed to export selected threats' });
        } finally {
          setIsExporting(false);
          setTimeout(() => setNotification(null), 3000);
        }
        break;
      default:
        console.log(`Unknown bulk action: ${action}`);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call to refresh threats data
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastRefreshTime(new Date());
      setNotification({ type: 'success', message: 'Threats data refreshed successfully' });
      console.log("Threats data refreshed successfully");
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to refresh threats data' });
      console.error("Failed to refresh threats data:", error);
    } finally {
      setIsRefreshing(false);
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate API call to export threats data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create CSV content
      const csvContent = [
        "ID,Type,Source,Location,Severity,Status,Timestamp,Attempts,Target,Description,Response",
        ...threats.map(threat => 
          `${threat.id},"${threat.type}","${threat.source}","${threat.location}","${threat.severity}","${threat.status}","${threat.timestamp}",${threat.attempts},"${threat.target}","${threat.description}","${threat.response}"`
        )
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `threats_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setNotification({ type: 'success', message: 'Threats data exported successfully' });
      console.log("Threats data exported successfully");
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to export threats data' });
      console.error("Failed to export threats data:", error);
    } finally {
      setIsExporting(false);
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const formatLastRefreshTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const filteredThreats = threats.filter(threat => {
    const matchesStatus = filterStatus === "all" || threat.status === filterStatus;
    const matchesSeverity = filterSeverity === "all" || threat.severity === filterSeverity;
    const matchesSearch = threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.source.includes(searchTerm) ||
                         threat.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const threatStats = {
    total: threats.length,
    critical: threats.filter(t => t.severity === "critical").length,
    high: threats.filter(t => t.severity === "high").length,
    medium: threats.filter(t => t.severity === "medium").length,
    low: threats.filter(t => t.severity === "low").length,
    blocked: threats.filter(t => t.status === "blocked").length,
    investigating: threats.filter(t => t.status === "monitoring" || t.status === "investigating").length
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Threat Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor and respond to security threats</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isExporting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Last Refresh Time */}
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Last updated: {formatLastRefreshTime(lastRefreshTime)}
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg border ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              {notification.message}
            </div>
          </div>
        )}

        {/* Threat Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Threats</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{threatStats.total}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
                <p className="text-2xl font-bold text-red-600">{threatStats.critical}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Blocked</p>
                <p className="text-2xl font-bold text-green-600">{threatStats.blocked}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Investigating</p>
                <p className="text-2xl font-bold text-yellow-600">{threatStats.investigating}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
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
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="blocked">Blocked</option>
                <option value="mitigated">Mitigated</option>
                <option value="monitoring">Monitoring</option>
                <option value="investigating">Investigating</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
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
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedThreats.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {selectedThreats.length} threat(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction("block")}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Block All
                </button>
                <button
                  onClick={() => handleBulkAction("investigate")}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                >
                  Investigate
                </button>
                <button
                  onClick={() => handleBulkAction("export")}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Export Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Threats Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedThreats.length === threats.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Threat Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
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
                {filteredThreats.map((threat) => (
                  <tr key={threat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedThreats.includes(threat.id)}
                        onChange={() => handleSelectThreat(threat.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{threat.type}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{threat.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{threat.source}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{threat.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(threat.status)}`}>
                        {threat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(threat.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:hover:text-red-400">
                          <Ban className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:hover:text-green-400">
                          <CheckCircle className="w-4 h-4" />
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