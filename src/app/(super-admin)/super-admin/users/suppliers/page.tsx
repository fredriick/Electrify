'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Store, 
  Search, 
  Package,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Star,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  TrendingUp,
  DollarSign,
  Award,
  CheckCircle,
  AlertTriangle,
  LayoutList,
  LayoutGrid,
  Download,
  Shield,
  Crown,
  Zap,
  Globe,
  CreditCard,
  BarChart3,
  X
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'verified' | 'premium' | 'enterprise';
  joinDate: string;
  lastLogin: string;
  location: string;
  company: string;
  totalProducts: number;
  totalSales: number;
  averageRating: number;
  commissionRate: number;
  isVerified: boolean;
  isPremium: boolean;
  categories: string[];
  lastOrderDate?: string;
  userType: 'regular' | 'premium' | 'enterprise';
  securityLevel: 'basic' | 'enhanced' | 'premium';
  globalReach: boolean;
  certificationLevel: 'none' | 'basic' | 'advanced' | 'premium';
  paymentMethods: string[];
  shippingRegions: string[];
}

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@solartech.com',
    phone: '+1 (555) 123-4567',
    status: 'enterprise',
    joinDate: '2025-07-10',
    lastLogin: '2025-07-19',
    location: 'San Francisco, CA',
    company: 'SolarTech Inc.',
    totalProducts: 145,
    totalSales: 1250000,
    averageRating: 4.8,
    commissionRate: 8.5,
    isVerified: true,
    isPremium: true,
    categories: ['Solar Panels', 'Inverters', 'Batteries', 'Accessories'],
    lastOrderDate: '2025-07-18',
    userType: 'enterprise',
    securityLevel: 'premium',
    globalReach: true,
    certificationLevel: 'premium',
    paymentMethods: ['Credit Card', 'Wire Transfer', 'PayPal'],
    shippingRegions: ['North America', 'Europe', 'Asia']
  },
  {
    id: '2',
    name: 'David Brown',
    email: 'david.brown@greenenergy.com',
    phone: '+1 (555) 234-5678',
    status: 'suspended',
    joinDate: '2025-07-20',
    lastLogin: '2025-07-15',
    location: 'Austin, TX',
    company: 'GreenEnergy Solutions',
    totalProducts: 23,
    totalSales: 45000,
    averageRating: 3.2,
    commissionRate: 7.0,
    isVerified: true,
    isPremium: false,
    categories: ['Solar Panels', 'Accessories'],
    lastOrderDate: '2025-07-10',
    userType: 'regular',
    securityLevel: 'basic',
    globalReach: false,
    certificationLevel: 'basic',
    paymentMethods: ['Credit Card', 'PayPal'],
    shippingRegions: ['North America']
  },
  {
    id: '3',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@powermax.com',
    phone: '+1 (555) 345-6789',
    status: 'premium',
    joinDate: '2025-07-22',
    lastLogin: '2025-07-20',
    location: 'Denver, CO',
    company: 'PowerMax Systems',
    totalProducts: 67,
    totalSales: 890000,
    averageRating: 4.6,
    commissionRate: 9.0,
    isVerified: true,
    isPremium: true,
    categories: ['Batteries', 'Inverters', 'Solar Panels'],
    lastOrderDate: '2025-07-19',
    userType: 'premium',
    securityLevel: 'enhanced',
    globalReach: true,
    certificationLevel: 'advanced',
    paymentMethods: ['Credit Card', 'Wire Transfer', 'PayPal'],
    shippingRegions: ['North America', 'Europe']
  },
  {
    id: '4',
    name: 'Michael Chen',
    email: 'michael.chen@sunpower.com',
    phone: '+1 (555) 456-7890',
    status: 'pending',
    joinDate: '2025-07-15',
    lastLogin: '2025-07-15',
    location: 'Seattle, WA',
    company: 'SunPower Solutions',
    totalProducts: 0,
    totalSales: 0,
    averageRating: 0,
    commissionRate: 8.0,
    isVerified: false,
    isPremium: false,
    categories: ['Solar Panels'],
    userType: 'regular',
    securityLevel: 'basic',
    globalReach: false,
    certificationLevel: 'none',
    paymentMethods: ['Credit Card'],
    shippingRegions: ['North America']
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@renewable.com',
    phone: '+1 (555) 567-8901',
    status: 'active',
    joinDate: '2025-06-28',
    lastLogin: '2025-07-18',
    location: 'Portland, OR',
    company: 'Renewable Energy Co.',
    totalProducts: 34,
    totalSales: 234000,
    averageRating: 4.3,
    commissionRate: 7.5,
    isVerified: true,
    isPremium: false,
    categories: ['Solar Panels', 'Accessories'],
    lastOrderDate: '2025-07-16',
    userType: 'regular',
    securityLevel: 'basic',
    globalReach: false,
    certificationLevel: 'basic',
    paymentMethods: ['Credit Card', 'PayPal'],
    shippingRegions: ['North America']
  },
  {
    id: '6',
    name: 'Robert Taylor',
    email: 'robert.taylor@globalenergy.com',
    phone: '+1 (555) 678-9012',
    status: 'enterprise',
    joinDate: '2025-05-10',
    lastLogin: '2025-07-20',
    location: 'Miami, FL',
    company: 'Global Energy Solutions',
    totalProducts: 289,
    totalSales: 2340000,
    averageRating: 4.9,
    commissionRate: 10.0,
    isVerified: true,
    isPremium: true,
    categories: ['Solar Panels', 'Inverters', 'Batteries', 'Accessories', 'Monitoring Systems'],
    lastOrderDate: '2025-07-20',
    userType: 'enterprise',
    securityLevel: 'premium',
    globalReach: true,
    certificationLevel: 'premium',
    paymentMethods: ['Credit Card', 'Wire Transfer', 'PayPal', 'Cryptocurrency'],
    shippingRegions: ['North America', 'Europe', 'Asia', 'Australia', 'South America']
  },
  {
    id: '7',
    name: 'Emily Davis',
    email: 'emily.davis@cleantech.com',
    phone: '+1 (555) 789-0123',
    status: 'premium',
    joinDate: '2025-06-15',
    lastLogin: '2025-07-19',
    location: 'Boston, MA',
    company: 'CleanTech Innovations',
    totalProducts: 89,
    totalSales: 567000,
    averageRating: 4.7,
    commissionRate: 8.8,
    isVerified: true,
    isPremium: true,
    categories: ['Solar Panels', 'Batteries', 'Smart Home Systems'],
    lastOrderDate: '2025-07-17',
    userType: 'premium',
    securityLevel: 'enhanced',
    globalReach: true,
    certificationLevel: 'advanced',
    paymentMethods: ['Credit Card', 'Wire Transfer', 'PayPal'],
    shippingRegions: ['North America', 'Europe']
  },
  {
    id: '8',
    name: 'James Wilson',
    email: 'james.wilson@solargrid.com',
    phone: '+1 (555) 890-1234',
    status: 'active',
    joinDate: '2025-07-01',
    lastLogin: '2025-07-18',
    location: 'Phoenix, AZ',
    company: 'Solar Grid Systems',
    totalProducts: 12,
    totalSales: 89000,
    averageRating: 4.1,
    commissionRate: 7.2,
    isVerified: true,
    isPremium: false,
    categories: ['Solar Panels'],
    lastOrderDate: '2025-07-14',
    userType: 'regular',
    securityLevel: 'basic',
    globalReach: false,
    certificationLevel: 'basic',
    paymentMethods: ['Credit Card', 'PayPal'],
    shippingRegions: ['North America']
  }
];

export default function SuperAdminSuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showSupplierDetailModal, setShowSupplierDetailModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Get all unique categories
  const allCategories = Array.from(new Set(mockSuppliers.flatMap(supplier => supplier.categories)));

  // Filter suppliers based on search and filters
  const filteredSuppliers = mockSuppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || supplier.categories.includes(categoryFilter);
    const matchesUserType = userTypeFilter === 'all' || supplier.userType === userTypeFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesUserType;
  });

  // Pagination
  const indexOfLastSupplier = currentPage * usersPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - usersPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier);
  const totalPages = Math.ceil(filteredSuppliers.length / usersPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(currentSuppliers.map(supplier => supplier.id));
    } else {
      setSelectedSuppliers([]);
    }
  };

  const handleSelectSupplier = (supplierId: string, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers([...selectedSuppliers, supplierId]);
    } else {
      setSelectedSuppliers(selectedSuppliers.filter(id => id !== supplierId));
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
      default: return <Store className="w-4 h-4" />;
    }
  };

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'premium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'basic': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const activeSuppliers = mockSuppliers.filter(s => s.status === 'active' || s.status === 'premium' || s.status === 'enterprise').length;
  const premiumSuppliers = mockSuppliers.filter(s => s.isPremium).length;
  const totalRevenue = mockSuppliers.reduce((sum, supplier) => sum + supplier.totalSales, 0);
  const averageCommission = mockSuppliers.reduce((sum, supplier) => sum + supplier.commissionRate, 0) / mockSuppliers.length;

  // Modal handlers
  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierDetailModal(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowEditSupplierModal(true);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    if (confirm(`Are you sure you want to delete ${supplier.name}? This action cannot be undone.`)) {
      // Here you would typically make an API call to delete the supplier
      console.log('Deleting supplier:', supplier.id);
      alert('Supplier deleted successfully!');
    }
  };

  const handleSaveSupplierEdit = () => {
    if (editingSupplier) {
      // Here you would typically make an API call to update the supplier
      console.log('Updating supplier:', editingSupplier);
      setShowEditSupplierModal(false);
      setEditingSupplier(null);
      alert('Supplier updated successfully!');
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
      'Company',
      'Location',
      'User Type',
      'Total Products',
      'Total Sales',
      'Average Rating',
      'Commission Rate',
      'Join Date',
      'Last Login',
      'Last Order Date',
      'Verified',
      'Premium',
      'Security Level',
      'Global Reach',
      'Certification Level',
      'Categories',
      'Payment Methods',
      'Shipping Regions'
    ];

    const csvData = filteredSuppliers.map(supplier => [
      supplier.id,
      supplier.name,
      supplier.email,
      supplier.phone,
      supplier.status,
      supplier.company,
      supplier.location,
      supplier.userType,
      supplier.totalProducts,
      supplier.totalSales,
      supplier.averageRating,
      supplier.commissionRate,
      new Date(supplier.joinDate).toLocaleDateString(),
      new Date(supplier.lastLogin).toLocaleDateString(),
      supplier.lastOrderDate ? new Date(supplier.lastOrderDate).toLocaleDateString() : '',
      supplier.isVerified ? 'Yes' : 'No',
      supplier.isPremium ? 'Yes' : 'No',
      supplier.securityLevel,
      supplier.globalReach ? 'Yes' : 'No',
      supplier.certificationLevel,
      supplier.categories.join('; '),
      supplier.paymentMethods.join('; '),
      supplier.shippingRegions.join('; ')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `super_admin_suppliers_export_${new Date().toISOString().split('T')[0]}.csv`);
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
              Supplier Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Super Admin: Manage all supplier accounts, global reach, and system-wide performance
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{mockSuppliers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Store className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Suppliers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeSuppliers}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium Suppliers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{premiumSuppliers}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${(totalRevenue / 1000000).toFixed(1)}M</p>
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
                  placeholder="Search suppliers by name, email, company, or location..."
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

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
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
            {selectedSuppliers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedSuppliers.length} selected
                </span>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Suppliers Table or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.length === currentSuppliers.length && currentSuppliers.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Security</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentSuppliers.map((supplier, index) => (
                    <motion.tr
                      key={supplier.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSuppliers.includes(supplier.id)}
                          onChange={(e) => handleSelectSupplier(supplier.id, e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {supplier.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{supplier.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{supplier.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>{supplier.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getUserTypeIcon(supplier.userType)}
                          <span className="text-sm text-gray-900 dark:text-white capitalize">{supplier.userType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{supplier.company}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{supplier.totalProducts}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${supplier.totalSales.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{supplier.securityLevel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewSupplier(supplier)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditSupplier(supplier)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit Supplier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSupplier(supplier)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete Supplier"
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
            {currentSuppliers.map((supplier, index) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Supplier Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.includes(supplier.id)}
                      onChange={(e) => handleSelectSupplier(supplier.id, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                    />
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {supplier.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleViewSupplier(supplier)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditSupplier(supplier)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                      title="Edit Supplier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteSupplier(supplier)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Supplier Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{supplier.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{supplier.email}</p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{supplier.company}</p>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {supplier.phone}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {supplier.location}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                      {supplier.status}
                    </span>
                    <div className="flex items-center gap-1">
                      {getUserTypeIcon(supplier.userType)}
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{supplier.userType}</span>
                    </div>
                  </div>

                  {/* Security Level */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4 mr-2" />
                    <span className="capitalize">{supplier.securityLevel} Security</span>
                  </div>

                  {/* Global Reach */}
                  {supplier.globalReach && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Globe className="w-4 h-4 mr-2" />
                      <span>Global Reach</span>
                    </div>
                  )}

                  {/* Certification Level */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCertificationColor(supplier.certificationLevel)}`}>
                      {supplier.certificationLevel} Certified
                    </span>
                  </div>

                  {/* Supplier Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{supplier.totalProducts}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Products</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">${(supplier.totalSales / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sales</p>
                    </div>
                  </div>

                  {supplier.averageRating > 0 && (
                    <div className="flex items-center justify-center pt-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          {supplier.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Joined {new Date(supplier.joinDate).toLocaleDateString()}
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

        {/* Supplier Detail Modal */}
        {showSupplierDetailModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Supplier Details</h2>
                <button
                  onClick={() => setShowSupplierDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Supplier Avatar and Basic Info */}
                  <div>
                    <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                        {selectedSupplier.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSupplier.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selectedSupplier.email}</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{selectedSupplier.company}</p>
                    </div>
                  </div>

                  {/* Supplier Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                        <p className="text-gray-900 dark:text-white">{selectedSupplier.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                        <p className="text-gray-900 dark:text-white">{selectedSupplier.location}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSupplier.status)}`}>
                          {selectedSupplier.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">User Type</label>
                        <div className="flex items-center gap-1">
                          {getUserTypeIcon(selectedSupplier.userType)}
                          <span className="text-gray-900 dark:text-white capitalize">{selectedSupplier.userType}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Join Date</label>
                        <p className="text-gray-900 dark:text-white">{selectedSupplier.joinDate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                        <p className="text-gray-900 dark:text-white">{selectedSupplier.lastLogin}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Level</label>
                        <p className="text-gray-900 dark:text-white capitalize">{selectedSupplier.securityLevel}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Commission Rate</label>
                        <p className="text-gray-900 dark:text-white">{selectedSupplier.commissionRate}%</p>
                      </div>
                    </div>

                    {/* Supplier Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSupplier.totalProducts}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">${(selectedSupplier.totalSales / 1000).toFixed(0)}K</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSupplier.averageRating.toFixed(1)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSupplier.categories.map((category, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Methods</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSupplier.paymentMethods.map((method, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Regions */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Shipping Regions</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSupplier.shippingRegions.map((region, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedSupplier.lastOrderDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Order Date</label>
                        <p className="text-gray-900 dark:text-white">{selectedSupplier.lastOrderDate}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {selectedSupplier.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                      {selectedSupplier.isPremium && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </span>
                      )}
                      {selectedSupplier.globalReach && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                          <Globe className="w-3 h-3 mr-1" />
                          Global Reach
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCertificationColor(selectedSupplier.certificationLevel)}`}>
                        {selectedSupplier.certificationLevel} Certified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Supplier Modal */}
        {showEditSupplierModal && editingSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Supplier</h2>
                <button
                  onClick={() => setShowEditSupplierModal(false)}
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
                    value={editingSupplier.name}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingSupplier.email}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingSupplier.phone}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                  <input
                    type="text"
                    value={editingSupplier.company}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, company: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingSupplier.location}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, location: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editingSupplier.status}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, status: e.target.value as any } : null)}
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
                    value={editingSupplier.userType}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, userType: e.target.value as any } : null)}
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
                    value={editingSupplier.securityLevel}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, securityLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="basic">Basic</option>
                    <option value="enhanced">Enhanced</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certification Level</label>
                  <select
                    value={editingSupplier.certificationLevel}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, certificationLevel: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="none">None</option>
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingSupplier.commissionRate}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, commissionRate: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveSupplierEdit}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditSupplierModal(false)}
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