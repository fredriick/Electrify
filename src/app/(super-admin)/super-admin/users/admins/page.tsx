'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Shield, 
  Search, 
  Crown,
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
  X
} from 'lucide-react';

interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'verified' | 'premium';
  joinDate: string;
  lastLogin: string;
  location: string;
  department: string;
  adminLevel: 'junior' | 'senior' | 'lead' | 'principal';
  permissions: string[];
  totalActions: number;
  successRate: number;
  securityLevel: 'basic' | 'enhanced' | 'premium';
  isVerified: boolean;
  twoFactorEnabled: boolean;
  lastSecurityAudit: string;
  accessLevel: 'read' | 'write' | 'admin' | 'super';
  managedUsers: number;
  managedSystems: string[];
  certifications: string[];
  emergencyContact: string;
  backupAdmin: string;
}

const mockAdmins: Admin[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@electrify.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    joinDate: '2025-01-15',
    lastLogin: '2025-07-20',
    location: 'San Francisco, CA',
    department: 'System Administration',
    adminLevel: 'principal',
    permissions: ['user_management', 'system_config', 'security', 'reports', 'database_admin', 'api_management'],
    totalActions: 1247,
    successRate: 99.8,
    securityLevel: 'premium',
    isVerified: true,
    twoFactorEnabled: true,
    lastSecurityAudit: '2025-07-15',
    accessLevel: 'super',
    managedUsers: 1250,
    managedSystems: ['User Management', 'Database', 'API Gateway', 'Security'],
    certifications: ['CISSP', 'AWS Solutions Architect', 'Azure Administrator'],
    emergencyContact: '+1 (555) 999-8888',
    backupAdmin: 'Michael Chen'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@electrify.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    joinDate: '2025-02-20',
    lastLogin: '2025-07-19',
    location: 'New York, NY',
    department: 'Security Operations',
    adminLevel: 'lead',
    permissions: ['security', 'user_management', 'reports', 'system_config'],
    totalActions: 892,
    successRate: 98.5,
    securityLevel: 'enhanced',
    isVerified: true,
    twoFactorEnabled: true,
    lastSecurityAudit: '2025-07-10',
    accessLevel: 'admin',
    managedUsers: 850,
    managedSystems: ['Security', 'User Management', 'Reports'],
    certifications: ['CompTIA Security+', 'CEH', 'CISM'],
    emergencyContact: '+1 (555) 888-7777',
    backupAdmin: 'Sarah Johnson'
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily.davis@electrify.com',
    phone: '+1 (555) 345-6789',
    status: 'active',
    joinDate: '2025-03-10',
    lastLogin: '2025-07-18',
    location: 'Austin, TX',
    department: 'Database Administration',
    adminLevel: 'senior',
    permissions: ['database_admin', 'reports', 'system_config'],
    totalActions: 567,
    successRate: 97.2,
    securityLevel: 'enhanced',
    isVerified: true,
    twoFactorEnabled: true,
    lastSecurityAudit: '2025-07-05',
    accessLevel: 'write',
    managedUsers: 450,
    managedSystems: ['Database', 'Reports', 'Backup Systems'],
    certifications: ['Oracle DBA', 'MongoDB Administrator', 'PostgreSQL'],
    emergencyContact: '+1 (555) 777-6666',
    backupAdmin: 'David Wilson'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@electrify.com',
    phone: '+1 (555) 456-7890',
    status: 'pending',
    joinDate: '2025-07-01',
    lastLogin: '2025-07-01',
    location: 'Seattle, WA',
    department: 'API Management',
    adminLevel: 'junior',
    permissions: ['api_management', 'reports'],
    totalActions: 0,
    successRate: 0,
    securityLevel: 'basic',
    isVerified: false,
    twoFactorEnabled: false,
    lastSecurityAudit: '2025-07-01',
    accessLevel: 'read',
    managedUsers: 0,
    managedSystems: ['API Gateway'],
    certifications: ['AWS Developer', 'REST API Design'],
    emergencyContact: '+1 (555) 666-5555',
    backupAdmin: 'Emily Davis'
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@electrify.com',
    phone: '+1 (555) 567-8901',
    status: 'suspended',
    joinDate: '2025-04-15',
    lastLogin: '2025-07-10',
    location: 'Chicago, IL',
    department: 'User Management',
    adminLevel: 'senior',
    permissions: ['user_management', 'reports'],
    totalActions: 234,
    successRate: 95.8,
    securityLevel: 'basic',
    isVerified: true,
    twoFactorEnabled: false,
    lastSecurityAudit: '2025-07-08',
    accessLevel: 'write',
    managedUsers: 300,
    managedSystems: ['User Management', 'Reports'],
    certifications: ['ITIL Foundation', 'PMP'],
    emergencyContact: '+1 (555) 555-4444',
    backupAdmin: 'Michael Chen'
  },
  {
    id: '6',
    name: 'Robert Taylor',
    email: 'robert.taylor@electrify.com',
    phone: '+1 (555) 678-9012',
    status: 'active',
    joinDate: '2025-05-20',
    lastLogin: '2025-07-20',
    location: 'Denver, CO',
    department: 'Infrastructure',
    adminLevel: 'lead',
    permissions: ['system_config', 'security', 'database_admin', 'api_management'],
    totalActions: 445,
    successRate: 99.1,
    securityLevel: 'premium',
    isVerified: true,
    twoFactorEnabled: true,
    lastSecurityAudit: '2025-07-12',
    accessLevel: 'admin',
    managedUsers: 600,
    managedSystems: ['Infrastructure', 'Security', 'Database', 'API'],
    certifications: ['AWS Solutions Architect', 'Kubernetes Administrator', 'Terraform'],
    emergencyContact: '+1 (555) 444-3333',
    backupAdmin: 'Sarah Johnson'
  },
  {
    id: '7',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@electrify.com',
    phone: '+1 (555) 789-0123',
    status: 'active',
    joinDate: '2025-06-01',
    lastLogin: '2025-07-19',
    location: 'Miami, FL',
    department: 'Compliance',
    adminLevel: 'senior',
    permissions: ['reports', 'security', 'user_management'],
    totalActions: 189,
    successRate: 96.7,
    securityLevel: 'enhanced',
    isVerified: true,
    twoFactorEnabled: true,
    lastSecurityAudit: '2025-07-14',
    accessLevel: 'write',
    managedUsers: 200,
    managedSystems: ['Compliance', 'Reports', 'Security'],
    certifications: ['CISA', 'ISO 27001', 'GDPR Practitioner'],
    emergencyContact: '+1 (555) 333-2222',
    backupAdmin: 'Emily Davis'
  },
  {
    id: '8',
    name: 'James Wilson',
    email: 'james.wilson@electrify.com',
    phone: '+1 (555) 890-1234',
    status: 'inactive',
    joinDate: '2025-01-10',
    lastLogin: '2025-06-15',
    location: 'Phoenix, AZ',
    department: 'System Administration',
    adminLevel: 'junior',
    permissions: ['reports', 'user_management'],
    totalActions: 89,
    successRate: 92.3,
    securityLevel: 'basic',
    isVerified: true,
    twoFactorEnabled: false,
    lastSecurityAudit: '2025-06-10',
    accessLevel: 'read',
    managedUsers: 100,
    managedSystems: ['Reports', 'User Management'],
    certifications: ['CompTIA A+', 'Network+'],
    emergencyContact: '+1 (555) 222-1111',
    backupAdmin: 'David Wilson'
  }
];

export default function SuperAdminAdminsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adminLevelFilter, setAdminLevelFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showAdminDetailModal, setShowAdminDetailModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  // Get all unique departments
  const allDepartments = Array.from(new Set(mockAdmins.map(admin => admin.department)));

  // Filter admins based on search and filters
  const filteredAdmins = mockAdmins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    const matchesAdminLevel = adminLevelFilter === 'all' || admin.adminLevel === adminLevelFilter;
    const matchesDepartment = departmentFilter === 'all' || admin.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesAdminLevel && matchesDepartment;
  });

  // Pagination
  const indexOfLastAdmin = currentPage * usersPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - usersPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(filteredAdmins.length / usersPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAdmins(currentAdmins.map(admin => admin.id));
    } else {
      setSelectedAdmins([]);
    }
  };

  const handleSelectAdmin = (adminId: string, checked: boolean) => {
    if (checked) {
      setSelectedAdmins([...selectedAdmins, adminId]);
    } else {
      setSelectedAdmins(selectedAdmins.filter(id => id !== adminId));
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

  const getAdminLevelIcon = (level: string) => {
    switch (level) {
      case 'principal': return <Crown className="w-4 h-4" />;
      case 'lead': return <Star className="w-4 h-4" />;
      case 'senior': return <Shield className="w-4 h-4" />;
      case 'junior': return <Key className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'premium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'enhanced': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'basic': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const activeAdmins = mockAdmins.filter(a => a.status === 'active').length;
  const verifiedAdmins = mockAdmins.filter(a => a.isVerified).length;
  const totalActions = mockAdmins.reduce((sum, admin) => sum + admin.totalActions, 0);
  const averageSuccessRate = mockAdmins.reduce((sum, admin) => sum + admin.successRate, 0) / mockAdmins.length;

  // Modal handlers
  const handleViewAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowAdminDetailModal(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setShowEditAdminModal(true);
  };

  const handleDeleteAdmin = (admin: Admin) => {
    if (confirm(`Are you sure you want to delete ${admin.name}? This action cannot be undone.`)) {
      // Here you would typically make an API call to delete the admin
      console.log('Deleting admin:', admin.id);
      alert('Admin deleted successfully!');
    }
  };

  const handleSaveAdminEdit = () => {
    if (editingAdmin) {
      // Here you would typically make an API call to update the admin
      console.log('Updating admin:', editingAdmin);
      setShowEditAdminModal(false);
      setEditingAdmin(null);
      alert('Admin updated successfully!');
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
      'Admin Level',
      'Access Level',
      'Total Actions',
      'Success Rate',
      'Security Level',
      'Join Date',
      'Last Login',
      'Last Security Audit',
      'Verified',
      '2FA Enabled',
      'Managed Users',
      'Managed Systems',
      'Certifications',
      'Emergency Contact',
      'Backup Admin'
    ];

    const csvData = filteredAdmins.map(admin => [
      admin.id,
      admin.name,
      admin.email,
      admin.phone,
      admin.status,
      admin.department,
      admin.adminLevel,
      admin.accessLevel,
      admin.totalActions,
      admin.successRate,
      admin.securityLevel,
      new Date(admin.joinDate).toLocaleDateString(),
      new Date(admin.lastLogin).toLocaleDateString(),
      new Date(admin.lastSecurityAudit).toLocaleDateString(),
      admin.isVerified ? 'Yes' : 'No',
      admin.twoFactorEnabled ? 'Yes' : 'No',
      admin.managedUsers,
      admin.managedSystems.join('; '),
      admin.certifications.join('; '),
      admin.emergencyContact,
      admin.backupAdmin
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `super_admin_admins_export_${new Date().toISOString().split('T')[0]}.csv`);
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
              Admin Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Super Admin: Manage system administrators, security levels, and access controls
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{mockAdmins.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeAdmins}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{averageSuccessRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                  placeholder="Search admins by name, email, department, or location..."
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

            {/* Admin Level Filter */}
            <div className="lg:w-48">
              <select
                value={adminLevelFilter}
                onChange={(e) => setAdminLevelFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Levels</option>
                <option value="junior">Junior</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="principal">Principal</option>
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
            {selectedAdmins.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAdmins.length} selected
                </span>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Admins Table or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedAdmins.length === currentAdmins.length && currentAdmins.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
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
                  {currentAdmins.map((admin, index) => (
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
                          checked={selectedAdmins.includes(admin.id)}
                          onChange={(e) => handleSelectAdmin(admin.id, e.target.checked)}
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
                          {getAdminLevelIcon(admin.adminLevel)}
                          <span className="text-sm text-gray-900 dark:text-white capitalize">{admin.adminLevel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{admin.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{admin.totalActions.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{admin.successRate.toFixed(1)}%</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{admin.securityLevel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewAdmin(admin)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditAdmin(admin)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit Admin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAdmin(admin)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete Admin"
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
            {currentAdmins.map((admin, index) => (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Admin Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedAdmins.includes(admin.id)}
                      onChange={(e) => handleSelectAdmin(admin.id, e.target.checked)}
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
                      onClick={() => handleViewAdmin(admin)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditAdmin(admin)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                      title="Edit Admin"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAdmin(admin)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                      title="Delete Admin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Admin Info */}
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
                      {getAdminLevelIcon(admin.adminLevel)}
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{admin.adminLevel}</span>
                    </div>
                  </div>

                  {/* Security Level */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Lock className="w-4 h-4 mr-2" />
                    <span className="capitalize">{admin.securityLevel} Security</span>
                  </div>

                  {/* 2FA Status */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Key className="w-4 h-4 mr-2" />
                    <span>{admin.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}</span>
                  </div>

                  {/* Admin Stats */}
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

        {/* Admin Detail Modal */}
        {showAdminDetailModal && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Details</h2>
                <button
                  onClick={() => setShowAdminDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Admin Avatar and Basic Info */}
                  <div>
                    <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                        {selectedAdmin.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAdmin.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selectedAdmin.email}</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{selectedAdmin.department}</p>
                    </div>
                  </div>

                  {/* Admin Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                        <p className="text-gray-900 dark:text-white">{selectedAdmin.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                        <p className="text-gray-900 dark:text-white">{selectedAdmin.location}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAdmin.status)}`}>
                          {selectedAdmin.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Level</label>
                        <div className="flex items-center gap-1">
                          {getAdminLevelIcon(selectedAdmin.adminLevel)}
                          <span className="text-gray-900 dark:text-white capitalize">{selectedAdmin.adminLevel}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Join Date</label>
                        <p className="text-gray-900 dark:text-white">{selectedAdmin.joinDate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                        <p className="text-gray-900 dark:text-white">{selectedAdmin.lastLogin}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Level</label>
                        <p className="text-gray-900 dark:text-white capitalize">{selectedAdmin.securityLevel}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Access Level</label>
                        <p className="text-gray-900 dark:text-white capitalize">{selectedAdmin.accessLevel}</p>
                      </div>
                    </div>

                    {/* Admin Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAdmin.totalActions.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Actions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAdmin.successRate.toFixed(1)}%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAdmin.managedUsers}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Managed Users</p>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Permissions</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedAdmin.permissions.map((permission, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {permission.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Managed Systems */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Managed Systems</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedAdmin.managedSystems.map((system, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {system}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Certifications</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedAdmin.certifications.map((cert, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
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
                          <p className="text-gray-900 dark:text-white">{selectedAdmin.lastSecurityAudit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Emergency Contact</p>
                          <p className="text-gray-900 dark:text-white">{selectedAdmin.emergencyContact}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Backup Admin</p>
                          <p className="text-gray-900 dark:text-white">{selectedAdmin.backupAdmin}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {selectedAdmin.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                      {selectedAdmin.twoFactorEnabled && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          <Key className="w-3 h-3 mr-1" />
                          2FA Enabled
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSecurityLevelColor(selectedAdmin.securityLevel)}`}>
                        {selectedAdmin.securityLevel} Security
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Admin Modal */}
        {showEditAdminModal && editingAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Admin</h2>
                <button
                  onClick={() => setShowEditAdminModal(false)}
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
                    value={editingAdmin.name}
                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingAdmin.email}
                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingAdmin.phone}
                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={editingAdmin.department}
                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, department: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingAdmin.location}
                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, location: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editingAdmin.status}
                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, status: e.target.value as any } : null)}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Level</label>
                  <select
                    value={editingAdmin.adminLevel}
                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, adminLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Security Level</label>
                  <select
                    value={editingAdmin.securityLevel}
                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, securityLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="basic">Basic</option>
                    <option value="enhanced">Enhanced</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Level</label>
                  <select
                    value={editingAdmin.accessLevel}
                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, accessLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="read">Read</option>
                    <option value="write">Write</option>
                    <option value="admin">Admin</option>
                    <option value="super">Super</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editingAdmin.emergencyContact}
                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, emergencyContact: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backup Admin</label>
                  <input
                    type="text"
                    value={editingAdmin.backupAdmin}
                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, backupAdmin: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveAdminEdit}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditAdminModal(false)}
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