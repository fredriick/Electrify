'use client';

import { useState, useEffect } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
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
  MapPin,
  Star,
  Crown,
  Shield,
  Search
} from 'lucide-react';

interface UserGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  status: 'active' | 'inactive' | 'archived';
  type: 'department' | 'project' | 'team' | 'role_based' | 'custom';
  permissions: string[];
  createdBy: string;
  createdAt: string;
  lastModified: string;
  color: string;
  icon: React.ReactNode;
  members: GroupMember[];
}

interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  joinDate: string;
  status: 'active' | 'inactive';
  avatar: string;
}

export default function UserGroupsPage() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock user groups data
  const mockGroups: UserGroup[] = [
    {
      id: 'it-department',
      name: 'IT Department',
      description: 'Information Technology department members',
      memberCount: 12,
      maxMembers: 20,
      status: 'active',
      type: 'department',
      permissions: ['system_access', 'technical_support', 'development'],
      createdBy: 'John Smith',
      createdAt: '2023-01-15',
      lastModified: '2023-12-01',
      color: 'blue',
      icon: <Server className="w-4 h-4" />,
      members: [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@company.com',
          role: 'admin',
          joinDate: '2023-01-15',
          status: 'active',
          avatar: '/api/placeholder/40/40'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          role: 'moderator',
          joinDate: '2023-02-01',
          status: 'active',
          avatar: '/api/placeholder/40/40'
        }
      ]
    },
    {
      id: 'sales-team',
      name: 'Sales Team',
      description: 'Sales and business development team',
      memberCount: 8,
      maxMembers: 15,
      status: 'active',
      type: 'team',
      permissions: ['sales_data', 'customer_management', 'reports'],
      createdBy: 'Michael Brown',
      createdAt: '2023-03-20',
      lastModified: '2023-11-15',
      color: 'green',
      icon: <BarChart3 className="w-4 h-4" />,
      members: [
        {
          id: '3',
          name: 'Michael Brown',
          email: 'michael.brown@company.com',
          role: 'admin',
          joinDate: '2023-03-20',
          status: 'active',
          avatar: '/api/placeholder/40/40'
        }
      ]
    },
    {
      id: 'marketing-department',
      name: 'Marketing Department',
      description: 'Marketing and communications team',
      memberCount: 6,
      maxMembers: 12,
      status: 'active',
      type: 'department',
      permissions: ['marketing_tools', 'content_management', 'analytics'],
      createdBy: 'Emily Davis',
      createdAt: '2023-04-10',
      lastModified: '2023-10-20',
      color: 'purple',
      icon: <Globe className="w-4 h-4" />,
      members: [
        {
          id: '4',
          name: 'Emily Davis',
          email: 'emily.davis@company.com',
          role: 'admin',
          joinDate: '2023-04-10',
          status: 'active',
          avatar: '/api/placeholder/40/40'
        }
      ]
    },
    {
      id: 'project-alpha',
      name: 'Project Alpha',
      description: 'Development team for Project Alpha',
      memberCount: 5,
      maxMembers: 8,
      status: 'active',
      type: 'project',
      permissions: ['project_access', 'development_tools', 'testing'],
      createdBy: 'David Wilson',
      createdAt: '2023-06-01',
      lastModified: '2023-09-15',
      color: 'orange',
      icon: <Zap className="w-4 h-4" />,
      members: [
        {
          id: '5',
          name: 'David Wilson',
          email: 'david.wilson@company.com',
          role: 'admin',
          joinDate: '2023-06-01',
          status: 'active',
          avatar: '/api/placeholder/40/40'
        }
      ]
    },
    {
      id: 'support-team',
      name: 'Support Team',
      description: 'Customer support and help desk team',
      memberCount: 4,
      maxMembers: 10,
      status: 'active',
      type: 'team',
      permissions: ['support_tools', 'customer_access', 'ticket_management'],
      createdBy: 'Lisa Anderson',
      createdAt: '2023-07-15',
      lastModified: '2023-08-30',
      color: 'yellow',
      icon: <Activity className="w-4 h-4" />,
      members: [
        {
          id: '6',
          name: 'Lisa Anderson',
          email: 'lisa.anderson@company.com',
          role: 'admin',
          joinDate: '2023-07-15',
          status: 'active',
          avatar: '/api/placeholder/40/40'
        }
      ]
    },
    {
      id: 'admin-group',
      name: 'Administrators',
      description: 'System administrators and managers',
      memberCount: 3,
      maxMembers: 5,
      status: 'active',
      type: 'role_based',
      permissions: ['all'],
      createdBy: 'John Smith',
      createdAt: '2023-01-01',
      lastModified: '2023-12-01',
      color: 'red',
      icon: <Shield className="w-4 h-4" />,
      members: [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@company.com',
          role: 'admin',
          joinDate: '2023-01-01',
          status: 'active',
          avatar: '/api/placeholder/40/40'
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setGroups(mockGroups);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || group.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getGroupColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'green':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'orange':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'red':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'inactive':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
      case 'archived':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <Clock className="w-4 h-4" />;
      case 'archived':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'department':
        return <Users className="w-4 h-4" />;
      case 'project':
        return <FileText className="w-4 h-4" />;
      case 'team':
        return <Star className="w-4 h-4" />;
      case 'role_based':
        return <Shield className="w-4 h-4" />;
      case 'custom':
        return <UserPlus className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const handleGroupAction = (group: UserGroup, action: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === group.id) {
        switch (action) {
          case 'activate':
            return { ...g, status: 'active' as const };
          case 'deactivate':
            return { ...g, status: 'inactive' as const };
          case 'archive':
            return { ...g, status: 'archived' as const };
          case 'edit':
            setSelectedGroup(g);
            setShowGroupModal(true);
            return g;
          case 'delete':
            return { ...g, status: 'archived' as const };
          default:
            return g;
        }
      }
      return g;
    }));
  };

  const exportGroups = () => {
    const csvContent = [
      ['Group Name', 'Type', 'Member Count', 'Status', 'Created By', 'Created Date'],
      ...filteredGroups.map(group => [
        group.name,
        group.type,
        group.memberCount.toString(),
        group.status,
        group.createdBy,
        group.createdAt
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-groups-export.csv';
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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                <Users className="w-8 h-8 text-purple-600" />
                User Groups
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage user groups and team organization
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportGroups}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="w-4 h-4" />
                Create Group
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search groups by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="department">Department</option>
                  <option value="project">Project</option>
                  <option value="team">Team</option>
                  <option value="role_based">Role Based</option>
                  <option value="custom">Custom</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Group Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        {group.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {group.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGroupColor(group.color)}`}>
                        {group.memberCount}/{group.maxMembers}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                        {getStatusIcon(group.status)}
                        <span className="ml-1 capitalize">{group.status}</span>
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {group.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created by:</span>
                      <span className="text-gray-900 dark:text-white ml-1">{group.createdBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="text-gray-900 dark:text-white ml-1">{group.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Group Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Members:</span>
                      <span className="text-gray-900 dark:text-white">{group.memberCount}/{group.maxMembers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Last Modified:</span>
                      <span className="text-gray-900 dark:text-white">{group.lastModified}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Permissions:</h4>
                    <div className="flex flex-wrap gap-1">
                      {group.permissions.map((permission) => (
                        <span key={permission} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                          {permission.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recent Members:</h4>
                    <div className="space-y-2">
                      {group.members.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-900 dark:text-white">
                                {member.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {member.role}
                              </div>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${
                            member.status === 'active' 
                              ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                              : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
                          }`}>
                            {member.status}
                          </span>
                        </div>
                      ))}
                      {group.members.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{group.members.length - 3} more members
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Group Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {group.status === 'inactive' && (
                        <button
                          onClick={() => handleGroupAction(group, 'activate')}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                          title="Activate Group"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {group.status === 'active' && (
                        <button
                          onClick={() => handleGroupAction(group, 'deactivate')}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg"
                          title="Deactivate Group"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {group.status !== 'archived' && (
                        <button
                          onClick={() => handleGroupAction(group, 'archive')}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                          title="Archive Group"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleGroupAction(group, 'edit')}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" 
                        title="Edit Group"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Group Settings">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No groups found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
} 