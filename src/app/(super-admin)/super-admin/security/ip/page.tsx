'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Network, 
  Search, 
  Shield,
  Eye,
  Edit,
  Trash2,
  LayoutList,
  LayoutGrid,
  Download,
  Activity,
  Lock,
  Unlock,
  Key,
  Settings,
  BarChart3,
  Database,
  Globe,
  Server,
  Zap,
  Bell,
  Clock,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Cpu,
  HardDrive,
  MapPin,
  Monitor,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';

interface IPRestriction {
  id: string;
  ipAddress: string;
  type: 'whitelist' | 'blacklist';
  status: 'active' | 'inactive' | 'expired';
  description: string;
  addedBy: string;
  addedDate: string;
  expiryDate?: string;
  reason: string;
  location: string;
  isp: string;
  country: string;
  city: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastActivity: string;
  hitCount: number;
  category: 'security' | 'compliance' | 'maintenance' | 'testing' | 'emergency';
  notes: string;
  autoExpire: boolean;
  notificationEnabled: boolean;
  affectedServices: string[];
}

const mockIPRestrictions: IPRestriction[] = [
  {
    id: '1',
    ipAddress: '192.168.1.100',
    type: 'whitelist',
    status: 'active',
    description: 'Office Network - Main Building',
    addedBy: 'Alexander Thompson',
    addedDate: '2025-01-15',
    reason: 'Internal office network access',
    location: 'New York, NY',
    isp: 'Comcast',
    country: 'United States',
    city: 'New York',
    riskLevel: 'low',
    lastActivity: '2025-07-20T14:30:00Z',
    hitCount: 1247,
    category: 'security',
    notes: 'Primary office network segment',
    autoExpire: false,
    notificationEnabled: true,
    affectedServices: ['Admin Panel', 'API Gateway', 'Database']
  },
  {
    id: '2',
    ipAddress: '185.220.101.45',
    type: 'blacklist',
    status: 'active',
    description: 'Suspicious Activity - Multiple Failed Logins',
    addedBy: 'Security System',
    addedDate: '2025-07-20',
    reason: 'Multiple failed login attempts detected',
    location: 'Unknown Location',
    isp: 'Unknown',
    country: 'Unknown',
    city: 'Unknown',
    riskLevel: 'critical',
    lastActivity: '2025-07-20T14:00:00Z',
    hitCount: 23,
    category: 'security',
    notes: 'Automatically blocked due to suspicious activity',
    autoExpire: true,
    notificationEnabled: true,
    affectedServices: ['All Services']
  },
  {
    id: '3',
    ipAddress: '10.0.0.50',
    type: 'whitelist',
    status: 'active',
    description: 'Development Server',
    addedBy: 'Sarah Johnson',
    addedDate: '2025-02-20',
    reason: 'Development environment access',
    location: 'San Francisco, CA',
    isp: 'AT&T',
    country: 'United States',
    city: 'San Francisco',
    riskLevel: 'low',
    lastActivity: '2025-07-20T13:15:00Z',
    hitCount: 892,
    category: 'testing',
    notes: 'Development team access only',
    autoExpire: false,
    notificationEnabled: false,
    affectedServices: ['Development API', 'Test Database']
  },
  {
    id: '4',
    ipAddress: '203.0.113.45',
    type: 'blacklist',
    status: 'active',
    description: 'Known Malicious IP',
    addedBy: 'Security Team',
    addedDate: '2025-07-15',
    reason: 'Known malware distribution source',
    location: 'Unknown Location',
    isp: 'Unknown',
    country: 'Unknown',
    city: 'Unknown',
    riskLevel: 'critical',
    lastActivity: '2025-07-20T12:00:00Z',
    hitCount: 5,
    category: 'security',
    notes: 'Blocked based on threat intelligence',
    autoExpire: false,
    notificationEnabled: true,
    affectedServices: ['All Services']
  },
  {
    id: '5',
    ipAddress: '172.16.0.25',
    type: 'whitelist',
    status: 'active',
    description: 'Branch Office Network',
    addedBy: 'Michael Chen',
    addedDate: '2025-03-10',
    reason: 'Branch office network access',
    location: 'Austin, TX',
    isp: 'Spectrum',
    country: 'United States',
    city: 'Austin',
    riskLevel: 'low',
    lastActivity: '2025-07-20T11:45:00Z',
    hitCount: 567,
    category: 'security',
    notes: 'Austin branch office network',
    autoExpire: false,
    notificationEnabled: true,
    affectedServices: ['Admin Panel', 'API Gateway']
  },
  {
    id: '6',
    ipAddress: '198.51.100.100',
    type: 'blacklist',
    status: 'expired',
    description: 'Temporary Block - Maintenance',
    addedBy: 'System Admin',
    addedDate: '2025-07-19',
    expiryDate: '2025-07-20',
    reason: 'Temporary block during system maintenance',
    location: 'Chicago, IL',
    isp: 'Comcast',
    country: 'United States',
    city: 'Chicago',
    riskLevel: 'medium',
    lastActivity: '2025-07-19T23:00:00Z',
    hitCount: 12,
    category: 'maintenance',
    notes: 'Temporary block during maintenance window',
    autoExpire: true,
    notificationEnabled: false,
    affectedServices: ['Admin Panel']
  },
  {
    id: '7',
    ipAddress: '10.0.0.100',
    type: 'whitelist',
    status: 'active',
    description: 'IT Department Network',
    addedBy: 'David Wilson',
    addedDate: '2025-04-15',
    reason: 'IT department full access',
    location: 'Seattle, WA',
    isp: 'CenturyLink',
    country: 'United States',
    city: 'Seattle',
    riskLevel: 'low',
    lastActivity: '2025-07-20T10:30:00Z',
    hitCount: 445,
    category: 'security',
    notes: 'IT department has full system access',
    autoExpire: false,
    notificationEnabled: true,
    affectedServices: ['All Services']
  },
  {
    id: '8',
    ipAddress: '192.0.2.50',
    type: 'blacklist',
    status: 'active',
    description: 'Suspicious Scanning Activity',
    addedBy: 'Security System',
    addedDate: '2025-07-18',
    reason: 'Port scanning and reconnaissance detected',
    location: 'Unknown Location',
    isp: 'Unknown',
    country: 'Unknown',
    city: 'Unknown',
    riskLevel: 'high',
    lastActivity: '2025-07-20T09:15:00Z',
    hitCount: 89,
    category: 'security',
    notes: 'Automatically blocked due to scanning activity',
    autoExpire: true,
    notificationEnabled: true,
    affectedServices: ['All Services']
  }
];

export default function IPRestrictionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIPs, setSelectedIPs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ipsPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedIP, setSelectedIP] = useState<IPRestriction | null>(null);
  const [showIPDetailModal, setShowIPDetailModal] = useState(false);
  const [showEditIPModal, setShowEditIPModal] = useState(false);
  const [editingIP, setEditingIP] = useState<IPRestriction | null>(null);

  // Filter IPs based on search and filters
  const filteredIPs = mockIPRestrictions.filter(ip => {
    const matchesSearch = ip.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ip.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || ip.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || ip.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ip.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  // Pagination
  const indexOfLastIP = currentPage * ipsPerPage;
  const indexOfFirstIP = indexOfLastIP - ipsPerPage;
  const currentIPs = filteredIPs.slice(indexOfFirstIP, indexOfLastIP);
  const totalPages = Math.ceil(filteredIPs.length / ipsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIPs(currentIPs.map(ip => ip.id));
    } else {
      setSelectedIPs([]);
    }
  };

  const handleSelectIP = (ipId: string, checked: boolean) => {
    if (checked) {
      setSelectedIPs([...selectedIPs, ipId]);
    } else {
      setSelectedIPs(selectedIPs.filter(id => id !== ipId));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'whitelist': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'blacklist': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'expired': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whitelist': return <CheckCircle className="w-4 h-4" />;
      case 'blacklist': return <X className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const whitelistIPs = mockIPRestrictions.filter(ip => ip.type === 'whitelist').length;
  const blacklistIPs = mockIPRestrictions.filter(ip => ip.type === 'blacklist').length;
  const activeIPs = mockIPRestrictions.filter(ip => ip.status === 'active').length;
  const totalIPs = mockIPRestrictions.length;

  // Modal handlers
  const handleViewIP = (ip: IPRestriction) => {
    setSelectedIP(ip);
    setShowIPDetailModal(true);
  };

  const handleEditIP = (ip: IPRestriction) => {
    setEditingIP(ip);
    setShowEditIPModal(true);
  };

  const handleDeleteIP = (ip: IPRestriction) => {
    if (confirm(`Are you sure you want to delete this IP restriction for ${ip.ipAddress}? This action cannot be undone.`)) {
      // Here you would typically make an API call to delete the IP restriction
      console.log('Deleting IP restriction:', ip.id);
      alert('IP restriction deleted successfully!');
    }
  };

  const handleSaveIPEdit = () => {
    if (editingIP) {
      // Here you would typically make an API call to update the IP restriction
      console.log('Updating IP restriction:', editingIP);
      setShowEditIPModal(false);
      setEditingIP(null);
      alert('IP restriction updated successfully!');
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'ID',
      'IP Address',
      'Type',
      'Status',
      'Description',
      'Added By',
      'Added Date',
      'Expiry Date',
      'Reason',
      'Location',
      'ISP',
      'Country',
      'City',
      'Risk Level',
      'Last Activity',
      'Hit Count',
      'Category',
      'Notes',
      'Auto Expire',
      'Notification Enabled',
      'Affected Services'
    ];

    const csvData = filteredIPs.map(ip => [
      ip.id,
      ip.ipAddress,
      ip.type,
      ip.status,
      ip.description,
      ip.addedBy,
      new Date(ip.addedDate).toLocaleDateString(),
      ip.expiryDate ? new Date(ip.expiryDate).toLocaleDateString() : '',
      ip.reason,
      ip.location,
      ip.isp,
      ip.country,
      ip.city,
      ip.riskLevel,
      new Date(ip.lastActivity).toLocaleString(),
      ip.hitCount,
      ip.category,
      ip.notes,
      ip.autoExpire ? 'Yes' : 'No',
      ip.notificationEnabled ? 'Yes' : 'No',
      ip.affectedServices.join('; ')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ip_restrictions_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              IP Restrictions
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage IP whitelist and blacklist for network security
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow text-purple-600' : 'text-gray-500 dark:text-gray-300'}`}
                title="List View"
              >
                <LayoutList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow text-purple-600' : 'text-gray-500 dark:text-gray-300'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add IP
            </button>
            <button 
              onClick={exportToCSV}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total IPs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalIPs}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Network className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Whitelist</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{whitelistIPs}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blacklist</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{blacklistIPs}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <X className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{activeIPs}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search IPs by address, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="lg:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Types</option>
                <option value="whitelist">Whitelist</option>
                <option value="blacklist">Blacklist</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="security">Security</option>
                <option value="compliance">Compliance</option>
                <option value="maintenance">Maintenance</option>
                <option value="testing">Testing</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedIPs.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedIPs.length} selected
                </span>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* IP Restrictions Table or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIPs.length === currentIPs.length && currentIPs.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hit Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentIPs.map((ip, index) => (
                    <motion.tr
                      key={ip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIPs.includes(ip.id)}
                          onChange={(e) => handleSelectIP(ip.id, e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <Network className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{ip.ipAddress}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{ip.isp}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(ip.type)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(ip.type)}`}>
                            {ip.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ip.status)}`}>
                          {ip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{ip.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{ip.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{ip.hitCount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewIP(ip)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditIP(ip)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit IP Restriction"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteIP(ip)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete IP Restriction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentIPs.map((ip, index) => (
              <motion.div
                key={ip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* IP Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIPs.includes(ip.id)}
                      onChange={(e) => handleSelectIP(ip.id, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                    />
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <Network className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleViewIP(ip)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditIP(ip)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                      title="Edit IP Restriction"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteIP(ip)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                      title="Delete IP Restriction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* IP Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{ip.ipAddress}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ip.description}</p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{ip.isp}</p>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {ip.location}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(ip.type)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(ip.type)}`}>
                        {ip.type}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ip.status)}`}>
                      {ip.status}
                    </span>
                  </div>

                  {/* Hit Count */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Activity className="w-4 h-4 mr-2" />
                    <span>Hits: {ip.hitCount}</span>
                  </div>

                  {/* Category */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Category:</span> {ip.category}
                  </div>

                  {ip.autoExpire && (
                    <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Auto Expire</span>
                    </div>
                  )}

                  {ip.notificationEnabled && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <Bell className="w-4 h-4 mr-2" />
                      <span>Notifications Enabled</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Added by {ip.addedBy}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* IP Restriction Detail Modal */}
        {showIPDetailModal && selectedIP && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">IP Restriction Details</h2>
                <button
                  onClick={() => setShowIPDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* IP Header and Basic Info */}
                  <div>
                    <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Network className="w-12 h-12 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedIP.ipAddress}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selectedIP.description}</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{selectedIP.isp}</p>
                    </div>
                  </div>

                  {/* IP Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                        <div className="flex items-center gap-1 mt-1">
                          {getTypeIcon(selectedIP.type)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedIP.type)}`}>
                            {selectedIP.type}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedIP.status)}`}>
                          {selectedIP.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Level</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(selectedIP.riskLevel)}`}>
                          {selectedIP.riskLevel}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                        <span className="text-gray-900 dark:text-white capitalize">{selectedIP.category}</span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Added By</label>
                        <p className="text-gray-900 dark:text-white">{selectedIP.addedBy}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Added Date</label>
                        <p className="text-gray-900 dark:text-white">{selectedIP.addedDate}</p>
                      </div>
                      {selectedIP.expiryDate && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Expiry Date</label>
                          <p className="text-gray-900 dark:text-white">{selectedIP.expiryDate}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Activity</label>
                        <p className="text-gray-900 dark:text-white">{new Date(selectedIP.lastActivity).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* IP Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedIP.hitCount}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Hit Count</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedIP.affectedServices.length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Affected Services</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedIP.autoExpire ? 'Yes' : 'No'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Auto Expire</p>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location Information</label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                          <p className="text-gray-900 dark:text-white">{selectedIP.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Country</p>
                          <p className="text-gray-900 dark:text-white">{selectedIP.country}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">City</p>
                          <p className="text-gray-900 dark:text-white">{selectedIP.city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">ISP</p>
                          <p className="text-gray-900 dark:text-white">{selectedIP.isp}</p>
                        </div>
                      </div>
                    </div>

                    {/* Affected Services */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Affected Services</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedIP.affectedServices.map((service, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Reason and Notes */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason</label>
                      <p className="text-gray-900 dark:text-white">{selectedIP.reason}</p>
                    </div>

                    {selectedIP.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                        <p className="text-gray-900 dark:text-white">{selectedIP.notes}</p>
                      </div>
                    )}

                    {/* Settings */}
                    <div className="flex gap-2">
                      {selectedIP.autoExpire && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          <Clock className="w-3 h-3 mr-1" />
                          Auto Expire
                        </span>
                      )}
                      {selectedIP.notificationEnabled && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <Bell className="w-3 h-3 mr-1" />
                          Notifications Enabled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit IP Restriction Modal */}
        {showEditIPModal && editingIP && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit IP Restriction</h2>
                <button
                  onClick={() => setShowEditIPModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
                  <input
                    type="text"
                    value={editingIP.ipAddress}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, ipAddress: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <input
                    type="text"
                    value={editingIP.description}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={editingIP.type}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="whitelist">Whitelist</option>
                    <option value="blacklist">Blacklist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editingIP.status}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risk Level</label>
                  <select
                    value={editingIP.riskLevel}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, riskLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={editingIP.category}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, category: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="security">Security</option>
                    <option value="compliance">Compliance</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="testing">Testing</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingIP.location}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, location: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ISP</label>
                  <input
                    type="text"
                    value={editingIP.isp}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, isp: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={editingIP.country}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, country: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    value={editingIP.city}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, city: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                  <textarea
                    value={editingIP.reason}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, reason: e.target.value } : null)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={editingIP.notes}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editingIP.expiryDate || ''}
                    onChange={(e) => setEditingIP(prev => prev ? { ...prev, expiryDate: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveIPEdit}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditIPModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
} 