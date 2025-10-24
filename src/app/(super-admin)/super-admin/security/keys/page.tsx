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
  FileText,
  RotateCcw
} from 'lucide-react';

interface EncryptionKey {
  id: string;
  name: string;
  type: 'symmetric' | 'asymmetric' | 'certificate' | 'api_key' | 'jwt_secret' | 'database_key';
  status: 'active' | 'inactive' | 'expired' | 'compromised' | 'rotating';
  algorithm: string;
  keySize: number;
  createdDate: string;
  expiryDate?: string;
  lastRotated: string;
  nextRotation: string;
  createdBy: string;
  description: string;
  usage: string[];
  environment: 'production' | 'staging' | 'development' | 'testing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoRotation: boolean;
  rotationInterval: number;
  keyVersion: string;
  fingerprint: string;
  encryptionLevel: '128' | '256' | '512' | '2048' | '4096';
  compliance: string[];
  lastUsed: string;
  accessCount: number;
  backupStatus: 'backed_up' | 'pending' | 'failed' | 'not_required';
  notes: string;
}

const mockEncryptionKeys: EncryptionKey[] = [
  {
    id: '1',
    name: 'Database Encryption Key',
    type: 'symmetric',
    status: 'active',
    algorithm: 'AES-256-GCM',
    keySize: 256,
    createdDate: '2024-01-01',
    lastRotated: '2025-01-01',
    nextRotation: '2026-01-01',
    createdBy: 'Alexander Thompson',
    description: 'Primary database encryption key for sensitive data',
    usage: ['Database Encryption', 'Backup Encryption', 'Data at Rest'],
    environment: 'production',
    priority: 'critical',
    autoRotation: true,
    rotationInterval: 365,
    keyVersion: 'v2.1',
    fingerprint: 'a1b2c3d4e5f6789012345678901234567890abcd',
    encryptionLevel: '256',
    compliance: ['GDPR', 'SOC2', 'PCI-DSS'],
    lastUsed: '2025-07-20T14:30:00Z',
    accessCount: 1247,
    backupStatus: 'backed_up',
    notes: 'Critical production key - handle with extreme care'
  },
  {
    id: '2',
    name: 'API Authentication Key',
    type: 'api_key',
    status: 'active',
    algorithm: 'HMAC-SHA256',
    keySize: 256,
    createdDate: '2024-03-15',
    lastRotated: '2025-03-15',
    nextRotation: '2026-03-15',
    createdBy: 'Sarah Johnson',
    description: 'API authentication and signature verification',
    usage: ['API Authentication', 'Request Signing', 'Webhook Verification'],
    environment: 'production',
    priority: 'high',
    autoRotation: true,
    rotationInterval: 365,
    keyVersion: 'v1.5',
    fingerprint: 'b2c3d4e5f6789012345678901234567890abcde1',
    encryptionLevel: '256',
    compliance: ['SOC2', 'OAuth2'],
    lastUsed: '2025-07-20T13:45:00Z',
    accessCount: 892,
    backupStatus: 'backed_up',
    notes: 'Used for all external API communications'
  },
  {
    id: '3',
    name: 'SSL Certificate Key',
    type: 'certificate',
    status: 'active',
    algorithm: 'RSA',
    keySize: 2048,
    createdDate: '2024-06-10',
    expiryDate: '2025-06-10',
    lastRotated: '2024-06-10',
    nextRotation: '2025-06-10',
    createdBy: 'Michael Chen',
    description: 'SSL/TLS certificate private key',
    usage: ['HTTPS Encryption', 'TLS Handshake', 'Certificate Authority'],
    environment: 'production',
    priority: 'critical',
    autoRotation: false,
    rotationInterval: 365,
    keyVersion: 'v1.0',
    fingerprint: 'c3d4e5f6789012345678901234567890abcdef2',
    encryptionLevel: '2048',
    compliance: ['SSL/TLS', 'HTTPS'],
    lastUsed: '2025-07-20T12:15:00Z',
    accessCount: 1567,
    backupStatus: 'backed_up',
    notes: 'Wildcard certificate for all subdomains'
  },
  {
    id: '4',
    name: 'JWT Secret Key',
    type: 'jwt_secret',
    status: 'active',
    algorithm: 'HMAC-SHA512',
    keySize: 512,
    createdDate: '2024-09-20',
    lastRotated: '2025-03-20',
    nextRotation: '2025-09-20',
    createdBy: 'David Wilson',
    description: 'JWT token signing and verification',
    usage: ['JWT Signing', 'Session Tokens', 'Authentication'],
    environment: 'production',
    priority: 'high',
    autoRotation: true,
    rotationInterval: 180,
    keyVersion: 'v3.2',
    fingerprint: 'd4e5f6789012345678901234567890abcdef3',
    encryptionLevel: '512',
    compliance: ['JWT RFC', 'OAuth2'],
    lastUsed: '2025-07-20T11:30:00Z',
    accessCount: 2341,
    backupStatus: 'backed_up',
    notes: 'Rotated every 6 months for security'
  },
  {
    id: '5',
    name: 'File Encryption Key',
    type: 'symmetric',
    status: 'active',
    algorithm: 'AES-256-CBC',
    keySize: 256,
    createdDate: '2024-12-01',
    lastRotated: '2025-06-01',
    nextRotation: '2025-12-01',
    createdBy: 'Emily Davis',
    description: 'File and document encryption',
    usage: ['File Encryption', 'Document Security', 'Upload Encryption'],
    environment: 'production',
    priority: 'medium',
    autoRotation: true,
    rotationInterval: 180,
    keyVersion: 'v2.0',
    fingerprint: 'e5f6789012345678901234567890abcdef4',
    encryptionLevel: '256',
    compliance: ['GDPR', 'Data Protection'],
    lastUsed: '2025-07-20T10:45:00Z',
    accessCount: 567,
    backupStatus: 'backed_up',
    notes: 'Used for encrypting uploaded files and documents'
  },
  {
    id: '6',
    name: 'Backup Encryption Key',
    type: 'symmetric',
    status: 'active',
    algorithm: 'AES-256-GCM',
    keySize: 256,
    createdDate: '2024-02-15',
    lastRotated: '2025-02-15',
    nextRotation: '2026-02-15',
    createdBy: 'Lisa Anderson',
    description: 'Backup and archive encryption',
    usage: ['Backup Encryption', 'Archive Security', 'Offsite Storage'],
    environment: 'production',
    priority: 'high',
    autoRotation: true,
    rotationInterval: 365,
    keyVersion: 'v1.8',
    fingerprint: 'f6789012345678901234567890abcdef5',
    encryptionLevel: '256',
    compliance: ['Backup Security', 'Data Retention'],
    lastUsed: '2025-07-20T09:15:00Z',
    accessCount: 123,
    backupStatus: 'backed_up',
    notes: 'Critical for backup security and compliance'
  },
  {
    id: '7',
    name: 'Development API Key',
    type: 'api_key',
    status: 'inactive',
    algorithm: 'HMAC-SHA256',
    keySize: 256,
    createdDate: '2024-11-10',
    lastRotated: '2025-01-10',
    nextRotation: '2025-07-10',
    createdBy: 'Robert Taylor',
    description: 'Development environment API key',
    usage: ['Development API', 'Testing', 'Staging Environment'],
    environment: 'development',
    priority: 'low',
    autoRotation: false,
    rotationInterval: 180,
    keyVersion: 'v1.2',
    fingerprint: '6789012345678901234567890abcdef6',
    encryptionLevel: '256',
    compliance: ['Development Standards'],
    lastUsed: '2025-07-19T16:20:00Z',
    accessCount: 89,
    backupStatus: 'not_required',
    notes: 'Development environment only - not for production'
  },
  {
    id: '8',
    name: 'Session Encryption Key',
    type: 'symmetric',
    status: 'rotating',
    algorithm: 'AES-256-GCM',
    keySize: 256,
    createdDate: '2024-08-20',
    lastRotated: '2025-07-20',
    nextRotation: '2025-08-20',
    createdBy: 'Jennifer Lee',
    description: 'Session data encryption',
    usage: ['Session Encryption', 'Cookie Security', 'User Sessions'],
    environment: 'production',
    priority: 'medium',
    autoRotation: true,
    rotationInterval: 30,
    keyVersion: 'v4.1',
    fingerprint: '789012345678901234567890abcdef7',
    encryptionLevel: '256',
    compliance: ['Session Security', 'Privacy'],
    lastUsed: '2025-07-20T08:30:00Z',
    accessCount: 3456,
    backupStatus: 'pending',
    notes: 'Currently rotating - new key being deployed'
  }
];

export default function EncryptionKeysPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [keysPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedKey, setSelectedKey] = useState<EncryptionKey | null>(null);
  const [showKeyDetailModal, setShowKeyDetailModal] = useState(false);
  const [showEditKeyModal, setShowEditKeyModal] = useState(false);
  const [editingKey, setEditingKey] = useState<EncryptionKey | null>(null);

  // Filter keys based on search and filters
  const filteredKeys = mockEncryptionKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.algorithm.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || key.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || key.status === statusFilter;
    const matchesEnvironment = environmentFilter === 'all' || key.environment === environmentFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesEnvironment;
  });

  // Pagination
  const indexOfLastKey = currentPage * keysPerPage;
  const indexOfFirstKey = indexOfLastKey - keysPerPage;
  const currentKeys = filteredKeys.slice(indexOfFirstKey, indexOfLastKey);
  const totalPages = Math.ceil(filteredKeys.length / keysPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(currentKeys.map(key => key.id));
    } else {
      setSelectedKeys([]);
    }
  };

  const handleSelectKey = (keyId: string, checked: boolean) => {
    if (checked) {
      setSelectedKeys([...selectedKeys, keyId]);
    } else {
      setSelectedKeys(selectedKeys.filter(id => id !== keyId));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'symmetric': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'asymmetric': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'certificate': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'api_key': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'jwt_secret': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'database_key': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'compromised': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'rotating': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'symmetric': return <Lock className="w-4 h-4" />;
      case 'asymmetric': return <Key className="w-4 h-4" />;
      case 'certificate': return <FileText className="w-4 h-4" />;
      case 'api_key': return <Globe className="w-4 h-4" />;
      case 'jwt_secret': return <Shield className="w-4 h-4" />;
      case 'database_key': return <Database className="w-4 h-4" />;
      default: return <Key className="w-4 h-4" />;
    }
  };

  const activeKeys = mockEncryptionKeys.filter(key => key.status === 'active').length;
  const criticalKeys = mockEncryptionKeys.filter(key => key.priority === 'critical').length;
  const totalKeys = mockEncryptionKeys.length;
  const autoRotationKeys = mockEncryptionKeys.filter(key => key.autoRotation).length;

  // Modal handlers
  const handleViewKey = (key: EncryptionKey) => {
    setSelectedKey(key);
    setShowKeyDetailModal(true);
  };

  const handleEditKey = (key: EncryptionKey) => {
    setEditingKey(key);
    setShowEditKeyModal(true);
  };

  const handleDeleteKey = (key: EncryptionKey) => {
    if (confirm(`Are you sure you want to delete this encryption key "${key.name}"? This action cannot be undone.`)) {
      // Here you would typically make an API call to delete the encryption key
      console.log('Deleting encryption key:', key.id);
      alert('Encryption key deleted successfully!');
    }
  };

  const handleSaveKeyEdit = () => {
    if (editingKey) {
      // Here you would typically make an API call to update the encryption key
      console.log('Updating encryption key:', editingKey);
      setShowEditKeyModal(false);
      setEditingKey(null);
      alert('Encryption key updated successfully!');
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Type',
      'Status',
      'Algorithm',
      'Key Size',
      'Created Date',
      'Expiry Date',
      'Last Rotated',
      'Next Rotation',
      'Created By',
      'Description',
      'Usage',
      'Environment',
      'Priority',
      'Auto Rotation',
      'Rotation Interval',
      'Key Version',
      'Fingerprint',
      'Encryption Level',
      'Compliance',
      'Last Used',
      'Access Count',
      'Backup Status',
      'Notes'
    ];

    const csvData = filteredKeys.map(key => [
      key.id,
      key.name,
      key.type,
      key.status,
      key.algorithm,
      key.keySize,
      new Date(key.createdDate).toLocaleDateString(),
      key.expiryDate ? new Date(key.expiryDate).toLocaleDateString() : '',
      new Date(key.lastRotated).toLocaleDateString(),
      new Date(key.nextRotation).toLocaleDateString(),
      key.createdBy,
      key.description,
      key.usage.join('; '),
      key.environment,
      key.priority,
      key.autoRotation ? 'Yes' : 'No',
      key.rotationInterval,
      key.keyVersion,
      key.fingerprint,
      key.encryptionLevel,
      key.compliance.join('; '),
      new Date(key.lastUsed).toLocaleString(),
      key.accessCount,
      key.backupStatus,
      key.notes
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `encryption_keys_export_${new Date().toISOString().split('T')[0]}.csv`);
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
              Encryption Keys
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage encryption keys, certificates, and security credentials
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
              Add Key
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Keys</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalKeys}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Keys</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{activeKeys}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Keys</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{criticalKeys}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Auto Rotation</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{autoRotationKeys}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                  placeholder="Search keys by name, description, or algorithm..."
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
                <option value="symmetric">Symmetric</option>
                <option value="asymmetric">Asymmetric</option>
                <option value="certificate">Certificate</option>
                <option value="api_key">API Key</option>
                <option value="jwt_secret">JWT Secret</option>
                <option value="database_key">Database Key</option>
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
                <option value="compromised">Compromised</option>
                <option value="rotating">Rotating</option>
              </select>
            </div>

            {/* Environment Filter */}
            <div className="lg:w-48">
              <select
                value={environmentFilter}
                onChange={(e) => setEnvironmentFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Environments</option>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
                <option value="testing">Testing</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedKeys.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedKeys.length} selected
                </span>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Encryption Keys Table or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedKeys.length === currentKeys.length && currentKeys.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Algorithm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Rotation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentKeys.map((key, index) => (
                    <motion.tr
                      key={key.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedKeys.includes(key.id)}
                          onChange={(e) => handleSelectKey(key.id, e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            {getTypeIcon(key.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{key.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{key.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(key.type)}`}>
                          {key.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(key.status)}`}>
                          {key.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{key.algorithm}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(key.priority)}`}>
                          {key.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(key.nextRotation).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewKey(key)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditKey(key)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit Encryption Key"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteKey(key)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete Encryption Key"
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
            {currentKeys.map((key, index) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Key Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(key.id)}
                      onChange={(e) => handleSelectKey(key.id, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                    />
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      {getTypeIcon(key.type)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleViewKey(key)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditKey(key)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                      title="Edit Encryption Key"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteKey(key)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                      title="Delete Encryption Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Key Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{key.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{key.description}</p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{key.algorithm}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(key.type)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(key.type)}`}>
                        {key.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(key.status)}`}>
                      {key.status}
                    </span>
                  </div>

                  {/* Key Size */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4 mr-2" />
                    <span>{key.keySize} bits</span>
                  </div>

                  {/* Priority */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Target className="w-4 h-4 mr-2" />
                    <span className="capitalize">Priority: {key.priority}</span>
                  </div>

                  {key.autoRotation && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      <span>Auto Rotation</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Next rotation: {new Date(key.nextRotation).toLocaleDateString()}
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

        {/* Encryption Key Detail Modal */}
        {showKeyDetailModal && selectedKey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Encryption Key Details</h2>
                <button
                  onClick={() => setShowKeyDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Key Header and Basic Info */}
                  <div>
                    <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      {getTypeIcon(selectedKey.type)}
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedKey.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selectedKey.description}</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{selectedKey.algorithm}</p>
                    </div>
                  </div>

                  {/* Key Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                        <div className="flex items-center gap-1 mt-1">
                          {getTypeIcon(selectedKey.type)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedKey.type)}`}>
                            {selectedKey.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedKey.status)}`}>
                          {selectedKey.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedKey.priority)}`}>
                          {selectedKey.priority}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Environment</label>
                        <span className="text-gray-900 dark:text-white capitalize">{selectedKey.environment}</span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</label>
                        <p className="text-gray-900 dark:text-white">{selectedKey.createdBy}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</label>
                        <p className="text-gray-900 dark:text-white">{selectedKey.createdDate}</p>
                      </div>
                      {selectedKey.expiryDate && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Expiry Date</label>
                          <p className="text-gray-900 dark:text-white">{selectedKey.expiryDate}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Used</label>
                        <p className="text-gray-900 dark:text-white">{new Date(selectedKey.lastUsed).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedKey.keySize}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Key Size (bits)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedKey.accessCount}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Access Count</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedKey.rotationInterval}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Rotation Interval (days)</p>
                      </div>
                    </div>

                    {/* Key Details */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Key Details</label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Key Version</p>
                          <p className="text-gray-900 dark:text-white">{selectedKey.keyVersion}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Encryption Level</p>
                          <p className="text-gray-900 dark:text-white">{selectedKey.encryptionLevel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Last Rotated</p>
                          <p className="text-gray-900 dark:text-white">{new Date(selectedKey.lastRotated).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Next Rotation</p>
                          <p className="text-gray-900 dark:text-white">{new Date(selectedKey.nextRotation).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Fingerprint */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fingerprint</label>
                      <p className="text-gray-900 dark:text-white font-mono text-sm break-all">{selectedKey.fingerprint}</p>
                    </div>

                    {/* Usage */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Usage</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedKey.usage.map((use, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Compliance */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Compliance</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedKey.compliance.map((comp, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="flex gap-2">
                      {selectedKey.autoRotation && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Auto Rotation
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedKey.backupStatus === 'backed_up' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        selectedKey.backupStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        selectedKey.backupStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        {selectedKey.backupStatus.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Notes */}
                    {selectedKey.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                        <p className="text-gray-900 dark:text-white">{selectedKey.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Encryption Key Modal */}
        {showEditKeyModal && editingKey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Encryption Key</h2>
                <button
                  onClick={() => setShowEditKeyModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingKey.name}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={editingKey.description}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={editingKey.type}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="symmetric">Symmetric</option>
                    <option value="asymmetric">Asymmetric</option>
                    <option value="certificate">Certificate</option>
                    <option value="api_key">API Key</option>
                    <option value="jwt_secret">JWT Secret</option>
                    <option value="database_key">Database Key</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editingKey.status}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                    <option value="compromised">Compromised</option>
                    <option value="rotating">Rotating</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Algorithm</label>
                  <input
                    type="text"
                    value={editingKey.algorithm}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, algorithm: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Size (bits)</label>
                  <input
                    type="number"
                    min="128"
                    value={editingKey.keySize}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, keySize: parseInt(e.target.value) || 256 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={editingKey.priority}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Environment</label>
                  <select
                    value={editingKey.environment}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, environment: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Encryption Level</label>
                  <select
                    value={editingKey.encryptionLevel}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, encryptionLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="128">128</option>
                    <option value="256">256</option>
                    <option value="512">512</option>
                    <option value="2048">2048</option>
                    <option value="4096">4096</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rotation Interval (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingKey.rotationInterval}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, rotationInterval: parseInt(e.target.value) || 365 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Version</label>
                  <input
                    type="text"
                    value={editingKey.keyVersion}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, keyVersion: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backup Status</label>
                  <select
                    value={editingKey.backupStatus}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, backupStatus: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="backed_up">Backed Up</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="not_required">Not Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={editingKey.notes}
                    onChange={(e) => setEditingKey(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveKeyEdit}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditKeyModal(false)}
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