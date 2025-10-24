'use client';

import { useState, useEffect } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Shield, 
  Crown, 
  Star, 
  Users, 
  UserPlus, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Lock,
  Unlock,
  Key,
  Activity,
  BarChart3,
  FileText,
  Database,
  Network,
  Globe,
  Server,
  Zap,
  Bell,
  Calendar,
  MapPin
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  userCount: number;
  isDefault: boolean;
  isSystem: boolean;
  createdAt: string;
  lastModified: string;
  color: string;
  icon: React.ReactNode;
}

interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  isSystem: boolean;
  isEnabled: boolean;
}

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Mock roles data
  const mockRoles: Role[] = [
    {
      id: 'super_admin',
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: ['all'],
      userCount: 1,
      isDefault: false,
      isSystem: true,
      createdAt: '2023-01-01',
      lastModified: '2023-12-01',
      color: 'purple',
      icon: <Crown className="w-4 h-4" />
    },
    {
      id: 'admin',
      name: 'admin',
      displayName: 'Administrator',
      description: 'System administration with user management',
      permissions: ['user_management', 'system_config', 'reports', 'security'],
      userCount: 3,
      isDefault: false,
      isSystem: true,
      createdAt: '2023-01-15',
      lastModified: '2023-11-15',
      color: 'red',
      icon: <Shield className="w-4 h-4" />
    },
    {
      id: 'manager',
      name: 'manager',
      displayName: 'Manager',
      description: 'Team management and reporting access',
      permissions: ['team_management', 'reports', 'basic_config'],
      userCount: 8,
      isDefault: false,
      isSystem: true,
      createdAt: '2023-02-01',
      lastModified: '2023-10-20',
      color: 'blue',
      icon: <Star className="w-4 h-4" />
    },
    {
      id: 'user',
      name: 'user',
      displayName: 'User',
      description: 'Standard user with basic access',
      permissions: ['basic_access', 'profile_management'],
      userCount: 45,
      isDefault: true,
      isSystem: true,
      createdAt: '2023-01-01',
      lastModified: '2023-09-10',
      color: 'green',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'guest',
      name: 'guest',
      displayName: 'Guest',
      description: 'Limited read-only access',
      permissions: ['read_only'],
      userCount: 12,
      isDefault: false,
      isSystem: true,
      createdAt: '2023-03-01',
      lastModified: '2023-08-15',
      color: 'gray',
      icon: <UserPlus className="w-4 h-4" />
    },
    {
      id: 'support',
      name: 'support',
      displayName: 'Support Team',
      description: 'Customer support and ticket management',
      permissions: ['support_tickets', 'user_view', 'basic_reports'],
      userCount: 5,
      isDefault: false,
      isSystem: false,
      createdAt: '2023-06-01',
      lastModified: '2023-12-10',
      color: 'yellow',
      icon: <Activity className="w-4 h-4" />
    }
  ];

  // Mock permissions data
  const mockPermissions: Permission[] = [
    // User Management
    {
      id: 'user_management',
      name: 'user_management',
      displayName: 'User Management',
      description: 'Create, edit, and delete users',
      category: 'User Management',
      isSystem: true,
      isEnabled: true
    },
    {
      id: 'role_management',
      name: 'role_management',
      displayName: 'Role Management',
      description: 'Create, edit, and delete roles',
      category: 'User Management',
      isSystem: true,
      isEnabled: true
    },
    {
      id: 'permission_management',
      name: 'permission_management',
      displayName: 'Permission Management',
      description: 'Manage system permissions',
      category: 'User Management',
      isSystem: true,
      isEnabled: true
    },
    // System Configuration
    {
      id: 'system_config',
      name: 'system_config',
      displayName: 'System Configuration',
      description: 'Modify system settings',
      category: 'System Configuration',
      isSystem: true,
      isEnabled: true
    },
    {
      id: 'security_config',
      name: 'security_config',
      displayName: 'Security Configuration',
      description: 'Configure security settings',
      category: 'System Configuration',
      isSystem: true,
      isEnabled: true
    },
    // Reports & Analytics
    {
      id: 'reports',
      name: 'reports',
      displayName: 'Reports Access',
      description: 'View system reports',
      category: 'Reports & Analytics',
      isSystem: true,
      isEnabled: true
    },
    {
      id: 'analytics',
      name: 'analytics',
      displayName: 'Analytics Access',
      description: 'Access analytics dashboard',
      category: 'Reports & Analytics',
      isSystem: true,
      isEnabled: true
    },
    // Team Management
    {
      id: 'team_management',
      name: 'team_management',
      displayName: 'Team Management',
      description: 'Manage team members',
      category: 'Team Management',
      isSystem: true,
      isEnabled: true
    },
    {
      id: 'basic_config',
      name: 'basic_config',
      displayName: 'Basic Configuration',
      description: 'Basic system configuration',
      category: 'Team Management',
      isSystem: true,
      isEnabled: true
    },
    // Support
    {
      id: 'support_tickets',
      name: 'support_tickets',
      displayName: 'Support Tickets',
      description: 'Manage support tickets',
      category: 'Support',
      isSystem: false,
      isEnabled: true
    },
    {
      id: 'user_view',
      name: 'user_view',
      displayName: 'User View',
      description: 'View user information',
      category: 'Support',
      isSystem: false,
      isEnabled: true
    },
    {
      id: 'basic_reports',
      name: 'basic_reports',
      displayName: 'Basic Reports',
      description: 'Access basic reports',
      category: 'Support',
      isSystem: false,
      isEnabled: true
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setRoles(mockRoles);
      setPermissions(mockPermissions);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getRoleColor = (color: string) => {
    switch (color) {
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'red':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'green':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'gray':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'User Management':
        return <Users className="w-4 h-4" />;
      case 'System Configuration':
        return <Settings className="w-4 h-4" />;
      case 'Reports & Analytics':
        return <BarChart3 className="w-4 h-4" />;
      case 'Team Management':
        return <Star className="w-4 h-4" />;
      case 'Support':
        return <Activity className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

  const handleRoleAction = (role: Role, action: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id === role.id) {
        switch (action) {
          case 'edit':
            setSelectedRole(r);
            setShowRoleModal(true);
            return r;
          case 'delete':
            if (r.isSystem) return r; // Prevent deletion of system roles
            return { ...r, userCount: 0 };
          default:
            return r;
        }
      }
      return r;
    }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setPermissions(prev => prev.map(p => {
      if (p.id === permissionId) {
        return { ...p, isEnabled: !p.isEnabled };
      }
      return p;
    }));
  };

  const exportRoles = () => {
    const csvContent = [
      ['Role Name', 'Display Name', 'Description', 'User Count', 'Permissions'],
      ...roles.map(role => [
        role.name,
        role.displayName,
        role.description,
        role.userCount.toString(),
        role.permissions.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roles-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <SuperAdminLayout>
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
      </SuperAdminLayout>
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
                <Shield className="w-8 h-8 text-purple-600" />
                Roles & Permissions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage user roles and system permissions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportRoles}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add Role
              </button>
            </div>
          </div>

          {/* Roles Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              User Roles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div key={role.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  {/* Role Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                          {role.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {role.displayName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {role.name}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role.color)}`}>
                        {role.userCount} users
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {role.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Created:</span>
                        <span className="text-gray-900 dark:text-white ml-1">{role.createdAt}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Modified:</span>
                        <span className="text-gray-900 dark:text-white ml-1">{role.lastModified}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role Details */}
                  <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                      {role.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Default
                        </span>
                      )}
                      {role.isSystem && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          <Shield className="w-3 h-3 mr-1" />
                          System
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Permissions:</h4>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission) => (
                          <span key={permission} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            {permission.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Role Actions */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRoleAction(role, 'edit')}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleRoleAction(role, 'delete')}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                            title="Delete Role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Role Settings">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                System Permissions
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add Permission
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Permission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {permissions.map((permission) => (
                      <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {permission.displayName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {permission.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(permission.category)}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {permission.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {permission.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            permission.isEnabled 
                              ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                              : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
                          }`}>
                            {permission.isEnabled ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {permission.isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePermissionToggle(permission.id)}
                              className={`p-2 rounded-lg ${
                                permission.isEnabled
                                  ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
                                  : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                              }`}
                              title={permission.isEnabled ? 'Disable Permission' : 'Enable Permission'}
                            >
                              {permission.isEnabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Edit Permission">
                              <Edit className="w-4 h-4" />
                            </button>
                            {!permission.isSystem && (
                              <button className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg" title="Delete Permission">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
} 