'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Crown, 
  Search, 
  Shield,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  TrendingUp,
  DollarSign,
  LayoutList,
  LayoutGrid,
  Download,
  Key,
  Settings,
  Activity,
  BarChart3,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Database,
  Server,
  ShieldCheck,
  Award,
  Target,
  Cpu,
  Network,
  X
} from 'lucide-react';

interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'verified' | 'premium';
  joinDate: string;
  lastLogin: string;
  location: string;
  department: string;
  superAdminLevel: 'master' | 'senior' | 'principal' | 'executive';
  permissions: string[];
  totalActions: number;
  successRate: number;
  securityLevel: 'premium' | 'enterprise' | 'ultimate';
  isVerified: boolean;
  twoFactorEnabled: boolean;
  lastSecurityAudit: string;
  accessLevel: 'super' | 'master' | 'executive';
  managedUsers: number;
  managedSystems: string[];
  certifications: string[];
  emergencyContact: string;
  backupSuperAdmin: string;
  systemAccess: string[];
  globalPermissions: string[];
  lastSystemBackup: string;
  securityScore: number;
  incidentResponse: number;
  systemUptime: number;
}

const mockSuperAdmins: SuperAdmin[] = [
  {
    id: '1',
    name: 'Alexander Thompson',
    email: 'alexander.thompson@electrify.com',
    phone: '+1 (555) 111-2222',
    status: 'active',
    joinDate: '2024-01-01',
    lastLogin: '2025-07-20',
    location: 'San Francisco, CA',
    department: 'System Architecture',
    superAdminLevel: 'master',
    permissions: ['all', 'system_override', 'emergency_access', 'global_config', 'security_override', 'database_admin', 'api_management', 'infrastructure_control'],
    totalActions: 2847,
    successRate: 99.9,
    securityLevel: 'ultimate',
    isVerified: true,
    twoFactorEnabled: true,
    lastSecurityAudit: '2025-07-18',
    accessLevel: 'master',
    managedUsers: 2500,
    managedSystems: ['All Systems', 'Core Infrastructure', 'Security Framework', 'Database Clusters', 'API Gateway', 'Load Balancers'],
    certifications: ['CISSP', 'CISM', 'CCSP', 'AWS Solutions Architect Pro', 'Azure Solutions Architect Expert', 'GCP Professional Cloud Architect'],
    emergencyContact: '+1 (555) 999-8888',
    backupSuperAdmin: 'Sarah Johnson',
    systemAccess: ['All Systems', 'Emergency Override', 'Global Configuration', 'Security Framework'],
    globalPermissions: ['System Override', 'Emergency Access', 'Global Configuration', 'Security Override'],
    lastSystemBackup: '2025-07-20',
    securityScore: 98,
    incidentResponse: 15,
    systemUptime: 99.99
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@electrify.com',
    phone: '+1 (555) 222-3333',
    status: 'active',
    joinDate: '2024-03-15',
    lastLogin: '2025-07-19',
    location: 'New York, NY',
    department: 'Security Operations',
    superAdminLevel: 'senior',
    permissions: ['all', 'security_override', 'emergency_access', 'global_config', 'database_admin', 'api_management'],
    totalActions: 1892,
    successRate: 99.7,
    securityLevel: 'enterprise',
    isVerified: true,
    twoFactorEnabled: true,
    lastSecurityAudit: '2025-07-15',
    accessLevel: 'super',
    managedUsers: 1800,
    managedSystems: ['Security Framework', 'Database Clusters', 'API Gateway', 'Monitoring Systems', 'Backup Systems'],
    certifications: ['CISSP', 'CISM', 'CEH', 'AWS Security Specialty', 'Azure Security Engineer'],
    emergencyContact: '+1 (555) 888-7777',
    backupSuperAdmin: 'Alexander Thompson',
    systemAccess: ['Security Framework', 'Database Clusters', 'API Gateway', 'Monitoring Systems'],
    globalPermissions: ['Security Override', 'Emergency Access', 'Global Configuration'],
    lastSystemBackup: '2025-07-19',
    securityScore: 96,
    incidentResponse: 22,
    systemUptime: 99.95
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@electrify.com',
    phone: '+1 (555) 333-4444',
    status: 'active',
    joinDate: '2024-06-10',
    lastLogin: '2025-07-18',
    location: 'Austin, TX',
    department: 'Infrastructure Management',
    superAdminLevel: 'principal',
    permissions: ['all', 'infrastructure_control', 'emergency_access', 'database_admin', 'api_management'],
    totalActions: 1245,
    successRate: 99.5,
    securityLevel: 'premium',
    isVerified: true,
    twoFactorEnabled: true,
    lastSecurityAudit: '2025-07-12',
    accessLevel: 'super',
    managedUsers: 1200,
    managedSystems: ['Core Infrastructure', 'Database Clusters', 'Load Balancers', 'CDN Systems', 'Storage Systems'],
    certifications: ['AWS Solutions Architect Pro', 'Azure Solutions Architect Expert', 'Kubernetes Administrator', 'Terraform Associate'],
    emergencyContact: '+1 (555) 777-6666',
    backupSuperAdmin: 'Sarah Johnson',
    systemAccess: ['Core Infrastructure', 'Database Clusters', 'Load Balancers', 'CDN Systems'],
    globalPermissions: ['Infrastructure Control', 'Emergency Access', 'Database Admin'],
    lastSystemBackup: '2025-07-18',
    securityScore: 94,
    incidentResponse: 28,
    systemUptime: 99.92
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.chen@electrify.com',
    phone: '+1 (555) 444-5555',
    status: 'pending',
    joinDate: '2025-07-01',
    lastLogin: '2025-07-01',
    location: 'Seattle, WA',
    department: 'System Development',
    superAdminLevel: 'executive',
    permissions: ['database_admin', 'api_management', 'reports'],
    totalActions: 0,
    successRate: 0,
    securityLevel: 'premium',
    isVerified: false,
    twoFactorEnabled: false,
    lastSecurityAudit: '2025-07-01',
    accessLevel: 'super',
    managedUsers: 0,
    managedSystems: ['Development Systems', 'Testing Environment'],
    certifications: ['AWS Developer Associate', 'Azure Developer Associate', 'Google Cloud Developer'],
    emergencyContact: '+1 (555) 666-5555',
    backupSuperAdmin: 'Michael Rodriguez',
    systemAccess: ['Development Systems', 'Testing Environment'],
    globalPermissions: ['Database Admin', 'API Management'],
    lastSystemBackup: '2025-07-01',
    securityScore: 85,
    incidentResponse: 0,
    systemUptime: 0
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.kim@electrify.com',
    phone: '+1 (555) 555-6666',
    status: 'active',
    joinDate: '2024-09-20',
    lastLogin: '2025-07-17',
    location: 'Denver, CO',
    department: 'Network Operations',
    superAdminLevel: 'senior',
    permissions: ['all', 'network_control', 'emergency_access', 'security_override', 'infrastructure_control'],
    totalActions: 1567,
    successRate: 99.8,
    securityLevel: 'enterprise',
    isVerified: true,
    twoFactorEnabled: true,
    lastSecurityAudit: '2025-07-10',
    accessLevel: 'super',
    managedUsers: 1500,
    managedSystems: ['Network Infrastructure', 'Security Framework', 'Load Balancers', 'VPN Systems', 'Firewall Management'],
    certifications: ['CCNP', 'CCNA Security', 'AWS Advanced Networking', 'Azure Network Engineer', 'Palo Alto Networks'],
    emergencyContact: '+1 (555) 555-4444',
    backupSuperAdmin: 'Alexander Thompson',
    systemAccess: ['Network Infrastructure', 'Security Framework', 'Load Balancers', 'VPN Systems'],
    globalPermissions: ['Network Control', 'Emergency Access', 'Security Override'],
    lastSystemBackup: '2025-07-17',
    securityScore: 97,
    incidentResponse: 18,
    systemUptime: 99.98
  }
];

export default function SuperAdminSuperAdminsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [superAdminLevelFilter, setSuperAdminLevelFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedSuperAdmins, setSelectedSuperAdmins] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedSuperAdmin, setSelectedSuperAdmin] = useState<SuperAdmin | null>(null);
  const [showSuperAdminDetailModal, setShowSuperAdminDetailModal] = useState(false);
  const [showEditSuperAdminModal, setShowEditSuperAdminModal] = useState(false);
  const [editingSuperAdmin, setEditingSuperAdmin] = useState<SuperAdmin | null>(null);

  // Get all unique departments
  const allDepartments = Array.from(new Set(mockSuperAdmins.map(admin => admin.department)));

  // Filter super admins based on search and filters
  const filteredSuperAdmins = mockSuperAdmins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    const matchesSuperAdminLevel = superAdminLevelFilter === 'all' || admin.superAdminLevel === superAdminLevelFilter;
    const matchesDepartment = departmentFilter === 'all' || admin.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesSuperAdminLevel && matchesDepartment;
  });

  // Pagination
  const indexOfLastSuperAdmin = currentPage * usersPerPage;
  const indexOfFirstSuperAdmin = indexOfLastSuperAdmin - usersPerPage;
  const currentSuperAdmins = filteredSuperAdmins.slice(indexOfFirstSuperAdmin, indexOfLastSuperAdmin);
  const totalPages = Math.ceil(filteredSuperAdmins.length / usersPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSuperAdmins(currentSuperAdmins.map(admin => admin.id));
    } else {
      setSelectedSuperAdmins([]);
    }
  };

  const handleSelectSuperAdmin = (adminId: string, checked: boolean) => {
    if (checked) {
      setSelectedSuperAdmins([...selectedSuperAdmins, adminId]);
    } else {
      setSelectedSuperAdmins(selectedSuperAdmins.filter(id => id !== adminId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'verified': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'premium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSuperAdminLevelIcon = (level: string) => {
    switch (level) {
      case 'master': return <Crown className="w-4 h-4" />;
      case 'senior': return <ShieldCheck className="w-4 h-4" />;
      case 'principal': return <Award className="w-4 h-4" />;
      case 'executive': return <Target className="w-4 h-4" />;
      default: return <Crown className="w-4 h-4" />;
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'ultimate': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'enterprise': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'premium': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const activeSuperAdmins = mockSuperAdmins.filter(a => a.status === 'active').length;
  const verifiedSuperAdmins = mockSuperAdmins.filter(a => a.isVerified).length;
  const totalActions = mockSuperAdmins.reduce((sum, admin) => sum + admin.totalActions, 0);
  const averageSuccessRate = mockSuperAdmins.reduce((sum, admin) => sum + admin.successRate, 0) / mockSuperAdmins.length;
  const averageSecurityScore = mockSuperAdmins.reduce((sum, admin) => sum + admin.securityScore, 0) / mockSuperAdmins.length;

  // Modal handlers
  const handleViewSuperAdmin = (admin: SuperAdmin) => {
    setSelectedSuperAdmin(admin);
    setShowSuperAdminDetailModal(true);
  };

  const handleEditSuperAdmin = (admin: SuperAdmin) => {
    setEditingSuperAdmin(admin);
    setShowEditSuperAdminModal(true);
  };

  const handleDeleteSuperAdmin = (admin: SuperAdmin) => {
    if (confirm(`Are you sure you want to delete ${admin.name}? This action cannot be undone.`)) {
      // Here you would typically make an API call to delete the super admin
      console.log('Deleting super admin:', admin.id);
      alert('Super Admin deleted successfully!');
    }
  };

  const handleSaveSuperAdminEdit = () => {
    if (editingSuperAdmin) {
      // Here you would typically make an API call to update the super admin
      console.log('Updating super admin:', editingSuperAdmin);
      setShowEditSuperAdminModal(false);
      setEditingSuperAdmin(null);
      alert('Super Admin updated successfully!');
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Status',
      'Department',
      'Super Admin Level',
      'Access Level',
      'Total Actions',
      'Success Rate',
      'Security Level',
      'Security Score',
      'Join Date',
      'Last Login',
      'Last Security Audit',
      'Verified',
      '2FA Enabled',
      'Managed Users',
      'Managed Systems',
      'Certifications',
      'Emergency Contact',
      'Backup Super Admin',
      'System Access',
      'Global Permissions',
      'Last System Backup',
      'Incident Response (min)',
      'System Uptime (%)'
    ];

    const csvData = filteredSuperAdmins.map(admin => [
      admin.id,
      admin.name,
      admin.email,
      admin.phone,
      admin.status,
      admin.department,
      admin.superAdminLevel,
      admin.accessLevel,
      admin.totalActions,
      admin.successRate,
      admin.securityLevel,
      admin.securityScore,
      new Date(admin.joinDate).toLocaleDateString(),
      new Date(admin.lastLogin).toLocaleDateString(),
      new Date(admin.lastSecurityAudit).toLocaleDateString(),
      admin.isVerified ? 'Yes' : 'No',
      admin.twoFactorEnabled ? 'Yes' : 'No',
      admin.managedUsers,
      admin.managedSystems.join('; '),
      admin.certifications.join('; '),
      admin.emergencyContact,
      admin.backupSuperAdmin,
      admin.systemAccess.join('; '),
      admin.globalPermissions.join('; '),
      new Date(admin.lastSystemBackup).toLocaleDateString(),
      admin.incidentResponse,
      admin.systemUptime
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `super_admin_super_admins_export_${new Date().toISOString().split('T')[0]}.csv`);
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
              Super Admin Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Master Control: Manage system super administrators with ultimate access and security oversight
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Super Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{mockSuperAdmins.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Super Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeSuperAdmins}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalActions.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{averageSecurityScore.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
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
                  placeholder="Search super admins by name, email, department, or location..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="verified">Verified</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {/* Super Admin Level Filter */}
            <div className="lg:w-48">
              <select
                value={superAdminLevelFilter}
                onChange={(e) => setSuperAdminLevelFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Levels</option>
                <option value="executive">Executive</option>
                <option value="principal">Principal</option>
                <option value="senior">Senior</option>
                <option value="master">Master</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="lg:w-48">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Departments</option>
                {allDepartments.map(department => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedSuperAdmins.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedSuperAdmins.length} selected
                </span>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Super Admins Table or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedSuperAdmins.length === currentSuperAdmins.length && currentSuperAdmins.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Super Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Success Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Security</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentSuperAdmins.map((admin, index) => (
                    <motion.tr
                      key={admin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSuperAdmins.includes(admin.id)}
                          onChange={(e) => handleSelectSuperAdmin(admin.id, e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {admin.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{admin.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(admin.status)}`}>{admin.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getSuperAdminLevelIcon(admin.superAdminLevel)}
                          <span className="text-sm text-gray-900 dark:text-white capitalize">{admin.superAdminLevel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{admin.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{admin.totalActions.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{admin.successRate.toFixed(1)}%</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{admin.securityLevel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewSuperAdmin(admin)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditSuperAdmin(admin)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit Super Admin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSuperAdmin(admin)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete Super Admin"
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
            {currentSuperAdmins.map((admin, index) => (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Super Admin Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSuperAdmins.includes(admin.id)}
                      onChange={(e) => handleSelectSuperAdmin(admin.id, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                    />
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {admin.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleViewSuperAdmin(admin)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditSuperAdmin(admin)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                      title="Edit Super Admin"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteSuperAdmin(admin)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                      title="Delete Super Admin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Super Admin Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{admin.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{admin.department}</p>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {admin.phone}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {admin.location}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(admin.status)}`}>
                      {admin.status}
                    </span>
                    <div className="flex items-center gap-1">
                      {getSuperAdminLevelIcon(admin.superAdminLevel)}
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{admin.superAdminLevel}</span>
                    </div>
                  </div>

                  {/* Security Level */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    <span className="capitalize">{admin.securityLevel} Security</span>
                  </div>

                  {/* 2FA Status */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Key className="w-4 h-4 mr-2" />
                    <span>{admin.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}</span>
                  </div>

                  {/* Super Admin Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{admin.totalActions.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Actions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{admin.successRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Success</p>
                    </div>
                  </div>

                  {/* Security Score */}
                  <div className="flex items-center justify-center pt-2">
                    <div className="flex items-center">
                      <ShieldCheck className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                        {admin.securityScore}% Security
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Joined {new Date(admin.joinDate).toLocaleDateString()}
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

        {/* Super Admin Detail Modal */}
        {showSuperAdminDetailModal && selectedSuperAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Super Admin Details</h2>
                <button
                  onClick={() => setShowSuperAdminDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Super Admin Avatar and Basic Info */}
                  <div>
                    <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                        {selectedSuperAdmin.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSuperAdmin.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selectedSuperAdmin.email}</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{selectedSuperAdmin.department}</p>
                    </div>
                  </div>

                  {/* Super Admin Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                        <p className="text-gray-900 dark:text-white">{selectedSuperAdmin.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                        <p className="text-gray-900 dark:text-white">{selectedSuperAdmin.location}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSuperAdmin.status)}`}>
                          {selectedSuperAdmin.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Super Admin Level</label>
                        <div className="flex items-center gap-1">
                          {getSuperAdminLevelIcon(selectedSuperAdmin.superAdminLevel)}
                          <span className="text-gray-900 dark:text-white capitalize">{selectedSuperAdmin.superAdminLevel}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Join Date</label>
                        <p className="text-gray-900 dark:text-white">{selectedSuperAdmin.joinDate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                        <p className="text-gray-900 dark:text-white">{selectedSuperAdmin.lastLogin}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Level</label>
                        <p className="text-gray-900 dark:text-white capitalize">{selectedSuperAdmin.securityLevel}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Access Level</label>
                        <p className="text-gray-900 dark:text-white capitalize">{selectedSuperAdmin.accessLevel}</p>
                      </div>
                    </div>

                    {/* Super Admin Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSuperAdmin.totalActions.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Actions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSuperAdmin.successRate.toFixed(1)}%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSuperAdmin.managedUsers}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Managed Users</p>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSuperAdmin.securityScore}%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Security Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSuperAdmin.incidentResponse}min</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Response Time</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSuperAdmin.systemUptime}%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">System Uptime</p>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Permissions</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSuperAdmin.permissions.map((permission, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {permission.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Global Permissions */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Global Permissions</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSuperAdmin.globalPermissions.map((permission, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            {permission.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Managed Systems */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Managed Systems</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSuperAdmin.managedSystems.map((system, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {system}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* System Access */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">System Access</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSuperAdmin.systemAccess.map((access, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                            {access}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Certifications</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSuperAdmin.certifications.map((cert, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Security Information */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Information</label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Last Security Audit</p>
                          <p className="text-gray-900 dark:text-white">{selectedSuperAdmin.lastSecurityAudit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Last System Backup</p>
                          <p className="text-gray-900 dark:text-white">{selectedSuperAdmin.lastSystemBackup}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Emergency Contact</p>
                          <p className="text-gray-900 dark:text-white">{selectedSuperAdmin.emergencyContact}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Backup Super Admin</p>
                          <p className="text-gray-900 dark:text-white">{selectedSuperAdmin.backupSuperAdmin}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {selectedSuperAdmin.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                      {selectedSuperAdmin.twoFactorEnabled && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          <Key className="w-3 h-3 mr-1" />
                          2FA Enabled
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSecurityLevelColor(selectedSuperAdmin.securityLevel)}`}>
                        {selectedSuperAdmin.securityLevel} Security
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Super Admin Modal */}
        {showEditSuperAdminModal && editingSuperAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Super Admin</h2>
                <button
                  onClick={() => setShowEditSuperAdminModal(false)}
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
                    value={editingSuperAdmin.name}
                    onChange={(e) => setEditingSuperAdmin(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingSuperAdmin.email}
                    onChange={(e) => setEditingSuperAdmin(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingSuperAdmin.phone}
                    onChange={(e) => setEditingSuperAdmin(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={editingSuperAdmin.department}
                    onChange={(e) => setEditingSuperAdmin(prev => prev ? { ...prev, department: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingSuperAdmin.location}
                    onChange={(e) => setEditingSuperAdmin(prev => prev ? { ...prev, location: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editingSuperAdmin.status}
                    onChange={(e) => setEditingSuperAdmin(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="verified">Verified</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Super Admin Level</label>
                  <select
                    value={editingSuperAdmin.superAdminLevel}
                    onChange={(e) => setEditingSuperAdmin(prev => prev ? { ...prev, superAdminLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="master">Master</option>
                    <option value="senior">Senior</option>
                    <option value="principal">Principal</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Security Level</label>
                  <select
                    value={editingSuperAdmin.securityLevel}
                    onChange={(e) => setEditingSuperAdmin(prev => prev ? { ...prev, securityLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="ultimate">Ultimate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Level</label>
                  <select
                    value={editingSuperAdmin.accessLevel}
                    onChange={(e) => setEditingSuperAdmin(prev => prev ? { ...prev, accessLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="super">Super</option>
                    <option value="master">Master</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editingSuperAdmin.emergencyContact}
                    onChange={(e) => setEditingSuperAdmin(prev => prev ? { ...prev, emergencyContact: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backup Super Admin</label>
                  <input
                    type="text"
                    value={editingSuperAdmin.backupSuperAdmin}
                    onChange={(e) => setEditingSuperAdmin(prev => prev ? { ...prev, backupSuperAdmin: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveSuperAdminEdit}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditSuperAdminModal(false)}
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