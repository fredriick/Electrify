'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Key, 
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
  Settings,
  BarChart3,
  Database,
  Network,
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
  CheckCircle,
  Smartphone,
  QrCode,
  RefreshCw,
  Mail
} from 'lucide-react';

interface TwoFactorAuth {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'enabled' | 'disabled' | 'pending' | 'expired' | 'locked';
  method: 'authenticator' | 'sms' | 'email' | 'hardware_key' | 'backup_codes';
  lastUsed: string;
  setupDate: string;
  backupCodesRemaining: number;
  deviceInfo: string;
  ipAddress: string;
  location: string;
  lastBackupCodeUsed?: string;
  failedAttempts: number;
  lockoutUntil?: string;
  recoveryEmail?: string;
  phoneNumber?: string;
  authenticatorSecret?: string;
  qrCodeUrl?: string;
  isEnforced: boolean;
  gracePeriod: number;
  lastSync: string;
  securityLevel: 'standard' | 'enhanced' | 'enterprise';
  autoBackup: boolean;
  notifications: boolean;
}

const mockTwoFactorAuth: TwoFactorAuth[] = [
  {
    id: '1',
    userId: 'user_001',
    userName: 'Alexander Thompson',
    userEmail: 'alexander.thompson@electrify.com',
    status: 'enabled',
    method: 'authenticator',
    lastUsed: '2025-07-20T14:30:00Z',
    setupDate: '2024-01-15',
    backupCodesRemaining: 8,
    deviceInfo: 'iPhone 15 Pro - iOS 17.4',
    ipAddress: '192.168.1.100',
    location: 'New York, NY',
    failedAttempts: 0,
    isEnforced: true,
    gracePeriod: 7,
    lastSync: '2025-07-20T14:30:00Z',
    securityLevel: 'enterprise',
    autoBackup: true,
    notifications: true
  },
  {
    id: '2',
    userId: 'user_002',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@electrify.com',
    status: 'enabled',
    method: 'sms',
    lastUsed: '2025-07-20T13:45:00Z',
    setupDate: '2024-03-20',
    backupCodesRemaining: 5,
    deviceInfo: 'Samsung Galaxy S24 - Android 14',
    ipAddress: '10.0.0.50',
    location: 'San Francisco, CA',
    phoneNumber: '+1 (555) 123-4567',
    failedAttempts: 1,
    isEnforced: true,
    gracePeriod: 7,
    lastSync: '2025-07-20T13:45:00Z',
    securityLevel: 'enhanced',
    autoBackup: true,
    notifications: true
  },
  {
    id: '3',
    userId: 'user_003',
    userName: 'Michael Brown',
    userEmail: 'michael.brown@electrify.com',
    status: 'pending',
    method: 'authenticator',
    lastUsed: '2025-07-20T12:15:00Z',
    setupDate: '2025-07-20',
    backupCodesRemaining: 10,
    deviceInfo: 'MacBook Pro - macOS 14.5',
    ipAddress: '172.16.0.25',
    location: 'Austin, TX',
    failedAttempts: 0,
    isEnforced: false,
    gracePeriod: 3,
    lastSync: '2025-07-20T12:15:00Z',
    securityLevel: 'standard',
    autoBackup: false,
    notifications: true
  },
  {
    id: '4',
    userId: 'user_004',
    userName: 'Emily Davis',
    userEmail: 'emily.davis@electrify.com',
    status: 'disabled',
    method: 'email',
    lastUsed: '2025-07-19T16:20:00Z',
    setupDate: '2024-06-10',
    backupCodesRemaining: 0,
    deviceInfo: 'Windows PC - Windows 11',
    ipAddress: '203.0.113.45',
    location: 'Seattle, WA',
    recoveryEmail: 'emily.backup@email.com',
    failedAttempts: 3,
    lockoutUntil: '2025-07-21T16:20:00Z',
    isEnforced: false,
    gracePeriod: 0,
    lastSync: '2025-07-19T16:20:00Z',
    securityLevel: 'standard',
    autoBackup: false,
    notifications: false
  },
  {
    id: '5',
    userId: 'user_005',
    userName: 'David Wilson',
    userEmail: 'david.wilson@electrify.com',
    status: 'enabled',
    method: 'hardware_key',
    lastUsed: '2025-07-20T11:30:00Z',
    setupDate: '2024-08-15',
    backupCodesRemaining: 6,
    deviceInfo: 'YubiKey 5C NFC',
    ipAddress: '10.0.0.100',
    location: 'Chicago, IL',
    failedAttempts: 0,
    isEnforced: true,
    gracePeriod: 7,
    lastSync: '2025-07-20T11:30:00Z',
    securityLevel: 'enterprise',
    autoBackup: true,
    notifications: true
  },
  {
    id: '6',
    userId: 'user_006',
    userName: 'Lisa Anderson',
    userEmail: 'lisa.anderson@electrify.com',
    status: 'locked',
    method: 'authenticator',
    lastUsed: '2025-07-20T10:45:00Z',
    setupDate: '2024-09-20',
    backupCodesRemaining: 2,
    deviceInfo: 'iPad Pro - iPadOS 17.4',
    ipAddress: '185.220.101.45',
    location: 'Unknown Location',
    failedAttempts: 5,
    lockoutUntil: '2025-07-21T10:45:00Z',
    isEnforced: true,
    gracePeriod: 7,
    lastSync: '2025-07-20T10:45:00Z',
    securityLevel: 'enhanced',
    autoBackup: true,
    notifications: true
  },
  {
    id: '7',
    userId: 'user_007',
    userName: 'Robert Taylor',
    userEmail: 'robert.taylor@electrify.com',
    status: 'enabled',
    method: 'backup_codes',
    lastUsed: '2025-07-20T09:15:00Z',
    setupDate: '2024-11-05',
    backupCodesRemaining: 3,
    deviceInfo: 'Linux Desktop - Ubuntu 22.04',
    ipAddress: '192.168.1.150',
    location: 'Miami, FL',
    lastBackupCodeUsed: '2025-07-20T09:15:00Z',
    failedAttempts: 0,
    isEnforced: false,
    gracePeriod: 7,
    lastSync: '2025-07-20T09:15:00Z',
    securityLevel: 'standard',
    autoBackup: false,
    notifications: false
  },
  {
    id: '8',
    userId: 'user_008',
    userName: 'Jennifer Lee',
    userEmail: 'jennifer.lee@electrify.com',
    status: 'expired',
    method: 'sms',
    lastUsed: '2025-07-18T14:20:00Z',
    setupDate: '2024-12-15',
    backupCodesRemaining: 0,
    deviceInfo: 'Google Pixel 8 - Android 14',
    ipAddress: '10.0.0.75',
    location: 'Denver, CO',
    phoneNumber: '+1 (555) 987-6543',
    failedAttempts: 2,
    isEnforced: true,
    gracePeriod: 0,
    lastSync: '2025-07-18T14:20:00Z',
    securityLevel: 'enhanced',
    autoBackup: true,
    notifications: true
  }
];

export default function TwoFactorAuthPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [securityLevelFilter, setSecurityLevelFilter] = useState<string>('all');
  const [selected2FA, setSelected2FA] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selected2FAItem, setSelected2FAItem] = useState<TwoFactorAuth | null>(null);
  const [show2FADetailModal, setShow2FADetailModal] = useState(false);
  const [showEdit2FAModal, setShowEdit2FAModal] = useState(false);
  const [editing2FA, setEditing2FA] = useState<TwoFactorAuth | null>(null);

  // Filter 2FA based on search and filters
  const filtered2FA = mockTwoFactorAuth.filter(item => {
    const matchesSearch = item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.deviceInfo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || item.method === methodFilter;
    const matchesSecurityLevel = securityLevelFilter === 'all' || item.securityLevel === securityLevelFilter;
    
    return matchesSearch && matchesStatus && matchesMethod && matchesSecurityLevel;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered2FA.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered2FA.length / itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected2FA(currentItems.map(item => item.id));
    } else {
      setSelected2FA([]);
    }
  };

  const handleSelect2FA = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelected2FA([...selected2FA, itemId]);
    } else {
      setSelected2FA(selected2FA.filter(id => id !== itemId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'disabled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'locked': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'authenticator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'sms': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'email': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'hardware_key': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'backup_codes': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'enhanced': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'standard': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'authenticator': return <Smartphone className="w-4 h-4" />;
      case 'sms': return <Bell className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'hardware_key': return <Key className="w-4 h-4" />;
      case 'backup_codes': return <ShieldCheck className="w-4 h-4" />;
      default: return <Key className="w-4 h-4" />;
    }
  };

  const enabled2FA = mockTwoFactorAuth.filter(item => item.status === 'enabled').length;
  const disabled2FA = mockTwoFactorAuth.filter(item => item.status === 'disabled').length;
  const total2FA = mockTwoFactorAuth.length;
  const enforced2FA = mockTwoFactorAuth.filter(item => item.isEnforced).length;

  // Modal handlers
  const handleView2FA = (item: TwoFactorAuth) => {
    setSelected2FAItem(item);
    setShow2FADetailModal(true);
  };

  const handleEdit2FA = (item: TwoFactorAuth) => {
    setEditing2FA(item);
    setShowEdit2FAModal(true);
  };

  const handleDelete2FA = (item: TwoFactorAuth) => {
    if (confirm(`Are you sure you want to delete this 2FA configuration for ${item.userName}? This action cannot be undone.`)) {
      // Here you would typically make an API call to delete the 2FA configuration
      console.log('Deleting 2FA configuration:', item.id);
      alert('2FA configuration deleted successfully!');
    }
  };

  const handleSave2FAEdit = () => {
    if (editing2FA) {
      // Here you would typically make an API call to update the 2FA configuration
      console.log('Updating 2FA configuration:', editing2FA);
      setShowEdit2FAModal(false);
      setEditing2FA(null);
      alert('2FA configuration updated successfully!');
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'ID',
      'User ID',
      'User Name',
      'User Email',
      'Status',
      'Method',
      'Last Used',
      'Setup Date',
      'Backup Codes Remaining',
      'Device Info',
      'IP Address',
      'Location',
      'Phone Number',
      'Recovery Email',
      'Failed Attempts',
      'Lockout Until',
      'Is Enforced',
      'Grace Period',
      'Last Sync',
      'Security Level',
      'Auto Backup',
      'Notifications'
    ];

    const csvData = filtered2FA.map(item => [
      item.id,
      item.userId,
      item.userName,
      item.userEmail,
      item.status,
      item.method,
      new Date(item.lastUsed).toLocaleString(),
      new Date(item.setupDate).toLocaleDateString(),
      item.backupCodesRemaining,
      item.deviceInfo,
      item.ipAddress,
      item.location,
      item.phoneNumber || '',
      item.recoveryEmail || '',
      item.failedAttempts,
      item.lockoutUntil ? new Date(item.lockoutUntil).toLocaleString() : '',
      item.isEnforced ? 'Yes' : 'No',
      item.gracePeriod,
      new Date(item.lastSync).toLocaleString(),
      item.securityLevel,
      item.autoBackup ? 'Yes' : 'No',
      item.notifications ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `2fa_settings_export_${new Date().toISOString().split('T')[0]}.csv`);
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
              Two-Factor Authentication
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage 2FA settings, methods, and security configurations
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
              Add 2FA
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total 2FA</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{total2FA}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enabled</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{enabled2FA}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disabled</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{disabled2FA}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enforced</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{enforced2FA}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                  placeholder="Search 2FA by user name, email, or device info..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="locked">Locked</option>
              </select>
            </div>

            {/* Method Filter */}
            <div className="lg:w-48">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Methods</option>
                <option value="authenticator">Authenticator</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="hardware_key">Hardware Key</option>
                <option value="backup_codes">Backup Codes</option>
              </select>
            </div>

            {/* Security Level Filter */}
            <div className="lg:w-48">
              <select
                value={securityLevelFilter}
                onChange={(e) => setSecurityLevelFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Levels</option>
                <option value="standard">Standard</option>
                <option value="enhanced">Enhanced</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selected2FA.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selected2FA.length} selected
                </span>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2FA Table or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected2FA.length === currentItems.length && currentItems.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Backup Codes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Used</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selected2FA.includes(item.id)}
                          onChange={(e) => handleSelect2FA(item.id, e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {item.userName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.userName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{item.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(item.method)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(item.method)}`}>
                            {item.method.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.deviceInfo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.backupCodesRemaining}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.lastUsed).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleView2FA(item)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit2FA(item)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit 2FA Configuration"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete2FA(item)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete 2FA Configuration"
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
            {currentItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* 2FA Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selected2FA.includes(item.id)}
                      onChange={(e) => handleSelect2FA(item.id, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                    />
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.userName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleView2FA(item)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit2FA(item)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                      title="Edit 2FA Configuration"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete2FA(item)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                      title="Delete 2FA Configuration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2FA Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.userName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.userEmail}</p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{item.deviceInfo}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(item.method)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(item.method)}`}>
                        {item.method.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Backup Codes */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    <span>Backup Codes: {item.backupCodesRemaining}</span>
                  </div>

                  {/* Security Level */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4 mr-2" />
                    <span className="capitalize">Level: {item.securityLevel}</span>
                  </div>

                  {item.isEnforced && (
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <Lock className="w-4 h-4 mr-2" />
                      <span>Enforced</span>
                    </div>
                  )}

                  {item.autoBackup && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      <span>Auto Backup</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Last used: {new Date(item.lastUsed).toLocaleString()}
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

        {/* 2FA Detail Modal */}
        {show2FADetailModal && selected2FAItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication Details</h2>
                <button
                  onClick={() => setShow2FADetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Header and Basic Info */}
                  <div>
                    <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                        {selected2FAItem.userName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selected2FAItem.userName}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selected2FAItem.userEmail}</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{selected2FAItem.deviceInfo}</p>
                    </div>
                  </div>

                  {/* 2FA Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selected2FAItem.status)}`}>
                          {selected2FAItem.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Method</label>
                        <div className="flex items-center gap-1 mt-1">
                          {getMethodIcon(selected2FAItem.method)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(selected2FAItem.method)}`}>
                            {selected2FAItem.method.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Level</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSecurityLevelColor(selected2FAItem.securityLevel)}`}>
                          {selected2FAItem.securityLevel}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Backup Codes</label>
                        <p className="text-gray-900 dark:text-white">{selected2FAItem.backupCodesRemaining} remaining</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Setup Date</label>
                        <p className="text-gray-900 dark:text-white">{selected2FAItem.setupDate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Used</label>
                        <p className="text-gray-900 dark:text-white">{new Date(selected2FAItem.lastUsed).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* 2FA Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selected2FAItem.failedAttempts}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Failed Attempts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selected2FAItem.gracePeriod}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Grace Period (days)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selected2FAItem.backupCodesRemaining}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Backup Codes</p>
                      </div>
                    </div>

                    {/* Device and Location Information */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Device and Location</label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Device Info</p>
                          <p className="text-gray-900 dark:text-white">{selected2FAItem.deviceInfo}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">IP Address</p>
                          <p className="text-gray-900 dark:text-white">{selected2FAItem.ipAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                          <p className="text-gray-900 dark:text-white">{selected2FAItem.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Last Sync</p>
                          <p className="text-gray-900 dark:text-white">{new Date(selected2FAItem.lastSync).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    {(selected2FAItem.recoveryEmail || selected2FAItem.phoneNumber) && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Information</label>
                        <div className="grid grid-cols-2 gap-4 mt-1">
                          {selected2FAItem.recoveryEmail && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Recovery Email</p>
                              <p className="text-gray-900 dark:text-white">{selected2FAItem.recoveryEmail}</p>
                            </div>
                          )}
                          {selected2FAItem.phoneNumber && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                              <p className="text-gray-900 dark:text-white">{selected2FAItem.phoneNumber}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Security Information */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Information</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selected2FAItem.isEnforced && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            <Lock className="w-3 h-3 mr-1" />
                            Enforced
                          </span>
                        )}
                        {selected2FAItem.autoBackup && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Auto Backup
                          </span>
                        )}
                        {selected2FAItem.notifications && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            <Bell className="w-3 h-3 mr-1" />
                            Notifications
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lockout Information */}
                    {selected2FAItem.lockoutUntil && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Lockout Information</label>
                        <p className="text-gray-900 dark:text-white">Locked until: {new Date(selected2FAItem.lockoutUntil).toLocaleString()}</p>
                      </div>
                    )}

                    {/* Last Backup Code Used */}
                    {selected2FAItem.lastBackupCodeUsed && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Backup Code Used</label>
                        <p className="text-gray-900 dark:text-white">{selected2FAItem.lastBackupCodeUsed}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit 2FA Modal */}
        {showEdit2FAModal && editing2FA && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit 2FA Configuration</h2>
                <button
                  onClick={() => setShowEdit2FAModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Name</label>
                  <input
                    type="text"
                    value={editing2FA.userName}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, userName: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Email</label>
                  <input
                    type="email"
                    value={editing2FA.userEmail}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, userEmail: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editing2FA.status}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                    <option value="locked">Locked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
                  <select
                    value={editing2FA.method}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, method: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="authenticator">Authenticator</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="hardware_key">Hardware Key</option>
                    <option value="backup_codes">Backup Codes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Security Level</label>
                  <select
                    value={editing2FA.securityLevel}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, securityLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="enhanced">Enhanced</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Info</label>
                  <input
                    type="text"
                    value={editing2FA.deviceInfo}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, deviceInfo: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
                  <input
                    type="text"
                    value={editing2FA.ipAddress}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, ipAddress: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editing2FA.location}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, location: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backup Codes Remaining</label>
                  <input
                    type="number"
                    min="0"
                    value={editing2FA.backupCodesRemaining}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, backupCodesRemaining: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Failed Attempts</label>
                  <input
                    type="number"
                    min="0"
                    value={editing2FA.failedAttempts}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, failedAttempts: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grace Period (days)</label>
                  <input
                    type="number"
                    min="0"
                    value={editing2FA.gracePeriod}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, gracePeriod: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recovery Email</label>
                  <input
                    type="email"
                    value={editing2FA.recoveryEmail || ''}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, recoveryEmail: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editing2FA.phoneNumber || ''}
                    onChange={(e) => setEditing2FA(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSave2FAEdit}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEdit2FAModal(false)}
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