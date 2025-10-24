'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Users, 
  Search, 
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
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
  Shield,
  Crown,
  Zap,
  X
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'verified' | 'premium' | 'enterprise';
  joinDate: string;
  lastLogin: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  averageRating: number;
  lastOrderDate?: string;
  preferredPaymentMethod: string;
  isVerified: boolean;
  isPremium: boolean;
  userType: 'regular' | 'premium' | 'enterprise';
  securityLevel: 'basic' | 'enhanced' | 'premium';
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    joinDate: '2025-07-15',
    lastLogin: '2025-07-20',
    location: 'New York, NY',
    totalOrders: 12,
    totalSpent: 2847.50,
    averageRating: 4.8,
    lastOrderDate: '2025-07-18',
    preferredPaymentMethod: 'Credit Card',
    isVerified: true,
    isPremium: false,
    userType: 'regular',
    securityLevel: 'basic'
  },
  {
    id: '2',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 234-5678',
    status: 'premium',
    joinDate: '2025-07-18',
    lastLogin: '2025-07-20',
    location: 'Los Angeles, CA',
    totalOrders: 45,
    totalSpent: 12500.75,
    averageRating: 4.9,
    lastOrderDate: '2025-07-19',
    preferredPaymentMethod: 'PayPal',
    isVerified: true,
    isPremium: true,
    userType: 'premium',
    securityLevel: 'enhanced'
  },
  {
    id: '3',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+1 (555) 345-6789',
    status: 'inactive',
    joinDate: '2023-09-12',
    lastLogin: '2023-12-28',
    location: 'Chicago, IL',
    totalOrders: 8,
    totalSpent: 1245.75,
    averageRating: 4.2,
    lastOrderDate: '2025-07-15',
    preferredPaymentMethod: 'Credit Card',
    isVerified: true,
    isPremium: false,
    userType: 'regular',
    securityLevel: 'basic'
  },
  {
    id: '4',
    name: 'Michael Johnson',
    email: 'michael.johnson@email.com',
    phone: '+1 (555) 456-7890',
    status: 'enterprise',
    joinDate: '2023-11-20',
    lastLogin: '2025-07-19',
    location: 'Houston, TX',
    totalOrders: 125,
    totalSpent: 56780.90,
    averageRating: 4.9,
    lastOrderDate: '2025-07-17',
    preferredPaymentMethod: 'Credit Card',
    isVerified: true,
    isPremium: true,
    userType: 'enterprise',
    securityLevel: 'premium'
  },
  {
    id: '5',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    phone: '+1 (555) 567-8901',
    status: 'active',
    joinDate: '2023-10-05',
    lastLogin: '2025-07-20',
    location: 'Phoenix, AZ',
    totalOrders: 18,
    totalSpent: 3421.25,
    averageRating: 4.6,
    lastOrderDate: '2025-07-19',
    preferredPaymentMethod: 'PayPal',
    isVerified: true,
    isPremium: false,
    userType: 'regular',
    securityLevel: 'basic'
  },
  {
    id: '6',
    name: 'David Brown',
    email: 'david.brown@email.com',
    phone: '+1 (555) 678-9012',
    status: 'suspended',
    joinDate: '2023-08-15',
    lastLogin: '2025-07-10',
    location: 'Philadelphia, PA',
    totalOrders: 5,
    totalSpent: 890.50,
    averageRating: 3.8,
    lastOrderDate: '2025-07-05',
    preferredPaymentMethod: 'Credit Card',
    isVerified: true,
    isPremium: false,
    userType: 'regular',
    securityLevel: 'basic'
  },
  {
    id: '7',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@email.com',
    phone: '+1 (555) 789-0123',
    status: 'premium',
    joinDate: '2023-12-01',
    lastLogin: '2025-07-20',
    location: 'San Antonio, TX',
    totalOrders: 67,
    totalSpent: 18987.30,
    averageRating: 4.7,
    lastOrderDate: '2025-07-16',
    preferredPaymentMethod: 'Credit Card',
    isVerified: true,
    isPremium: true,
    userType: 'premium',
    securityLevel: 'enhanced'
  },
  {
    id: '8',
    name: 'Robert Taylor',
    email: 'robert.taylor@email.com',
    phone: '+1 (555) 890-1234',
    status: 'enterprise',
    joinDate: '2023-07-22',
    lastLogin: '2025-07-19',
    location: 'San Diego, CA',
    totalOrders: 232,
    totalSpent: 789045.45,
    averageRating: 4.9,
    lastOrderDate: '2025-07-18',
    preferredPaymentMethod: 'PayPal',
    isVerified: true,
    isPremium: true,
    userType: 'enterprise',
    securityLevel: 'premium'
  }
];

export default function SuperAdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetailModal, setShowCustomerDetailModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Filter customers based on search and filters
  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesUserType = userTypeFilter === 'all' || customer.userType === userTypeFilter;
    
    return matchesSearch && matchesStatus && matchesUserType;
  });

  // Pagination
  const indexOfLastCustomer = currentPage * usersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - usersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / usersPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(currentCustomers.map(customer => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'premium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'enterprise': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'premium': return <Crown className="w-4 h-4" />;
      case 'enterprise': return <Zap className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const totalRevenue = mockCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const activeCustomers = mockCustomers.filter(c => c.status === 'active' || c.status === 'premium' || c.status === 'enterprise').length;
  const premiumCustomers = mockCustomers.filter(c => c.isPremium).length;
  const averageOrderValue = totalRevenue / mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0);

  // Modal handlers
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetailModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditCustomerModal(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    if (confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
      // Here you would typically make an API call to delete the customer
      console.log('Deleting customer:', customer.id);
      alert('Customer deleted successfully!');
    }
  };

  const handleSaveCustomerEdit = () => {
    if (editingCustomer) {
      // Here you would typically make an API call to update the customer
      console.log('Updating customer:', editingCustomer);
      setShowEditCustomerModal(false);
      setEditingCustomer(null);
      alert('Customer updated successfully!');
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
      'User Type',
      'Location',
      'Total Orders',
      'Total Spent',
      'Average Rating',
      'Join Date',
      'Last Login',
      'Last Order Date',
      'Preferred Payment Method',
      'Verified',
      'Premium',
      'Security Level'
    ];

    const csvData = filteredCustomers.map(customer => [
      customer.id,
      customer.name,
      customer.email,
      customer.phone,
      customer.status,
      customer.userType,
      customer.location,
      customer.totalOrders,
      customer.totalSpent,
      customer.averageRating,
      new Date(customer.joinDate).toLocaleDateString(),
      new Date(customer.lastLogin).toLocaleDateString(),
      customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : '',
      customer.preferredPaymentMethod,
      customer.isVerified ? 'Yes' : 'No',
      customer.isPremium ? 'Yes' : 'No',
      customer.securityLevel
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `super_admin_customers_export_${new Date().toISOString().split('T')[0]}.csv`);
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
              Customer Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Super Admin: Manage all customer accounts, security levels, and system access
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{mockCustomers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeCustomers}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{premiumCustomers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                  placeholder="Search customers by name, email, or location..."
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
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* User Type Filter */}
            <div className="lg:w-48">
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All User Types</option>
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedCustomers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedCustomers.length} selected
                </span>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customers Table or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.length === currentCustomers.length && currentCustomers.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Security</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentCustomers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={(e) => handleSelectCustomer(customer.id, e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>{customer.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getUserTypeIcon(customer.userType)}
                          <span className="text-sm text-gray-900 dark:text-white capitalize">{customer.userType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{customer.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{customer.totalOrders}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${customer.totalSpent.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{customer.securityLevel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewCustomer(customer)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCustomer(customer)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit Customer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete Customer"
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
            {currentCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Customer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={(e) => handleSelectCustomer(customer.id, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                    />
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleViewCustomer(customer)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditCustomer(customer)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                      title="Edit Customer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCustomer(customer)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {customer.phone}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {customer.location}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                    <div className="flex items-center gap-1">
                      {getUserTypeIcon(customer.userType)}
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{customer.userType}</span>
                    </div>
                  </div>

                  {/* Security Level */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4 mr-2" />
                    <span className="capitalize">{customer.securityLevel} Security</span>
                  </div>

                  {/* Customer Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{customer.totalOrders}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">${customer.totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Spent</p>
                    </div>
                  </div>

                  {customer.averageRating > 0 && (
                    <div className="flex items-center justify-center pt-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          {customer.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Joined {new Date(customer.joinDate).toLocaleDateString()}
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

        {/* Customer Detail Modal */}
        {showCustomerDetailModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Details</h2>
                <button
                  onClick={() => setShowCustomerDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Avatar and Basic Info */}
                  <div>
                    <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                        {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCustomer.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selectedCustomer.email}</p>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                        <p className="text-gray-900 dark:text-white">{selectedCustomer.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                        <p className="text-gray-900 dark:text-white">{selectedCustomer.location}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status)}`}>
                          {selectedCustomer.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">User Type</label>
                        <div className="flex items-center gap-1">
                          {getUserTypeIcon(selectedCustomer.userType)}
                          <span className="text-gray-900 dark:text-white capitalize">{selectedCustomer.userType}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Join Date</label>
                        <p className="text-gray-900 dark:text-white">{selectedCustomer.joinDate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                        <p className="text-gray-900 dark:text-white">{selectedCustomer.lastLogin}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Level</label>
                        <p className="text-gray-900 dark:text-white capitalize">{selectedCustomer.securityLevel}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</label>
                        <p className="text-gray-900 dark:text-white">{selectedCustomer.preferredPaymentMethod}</p>
                      </div>
                    </div>

                    {/* Customer Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCustomer.totalOrders}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">${selectedCustomer.totalSpent.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCustomer.averageRating.toFixed(1)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                      </div>
                    </div>

                    {selectedCustomer.lastOrderDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Order Date</label>
                        <p className="text-gray-900 dark:text-white">{selectedCustomer.lastOrderDate}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {selectedCustomer.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                      {selectedCustomer.isPremium && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditCustomerModal && editingCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Customer</h2>
                <button
                  onClick={() => setShowEditCustomerModal(false)}
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
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingCustomer.location}
                    onChange={(e) => setEditingCustomer(prev => prev ? { ...prev, location: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editingCustomer.status}
                    onChange={(e) => setEditingCustomer(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="verified">Verified</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Type</label>
                  <select
                    value={editingCustomer.userType}
                    onChange={(e) => setEditingCustomer(prev => prev ? { ...prev, userType: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="regular">Regular</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Security Level</label>
                  <select
                    value={editingCustomer.securityLevel}
                    onChange={(e) => setEditingCustomer(prev => prev ? { ...prev, securityLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="basic">Basic</option>
                    <option value="enhanced">Enhanced</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveCustomerEdit}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditCustomerModal(false)}
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