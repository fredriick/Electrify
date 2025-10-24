'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { productApprovalService, ProductApprovalUpdate } from '@/lib/productApprovalService';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  LayoutList,
  LayoutGrid,
  Star,
  DollarSign,
  User,
  Calendar,
  Tag,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  RefreshCw
} from 'lucide-react';

interface PendingProduct {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  supplier: string;
  supplierId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  salesCount: number;
  createdAt: string;
  submittedAt: string;
  isFeatured: boolean;
  tags: string[];
  specifications: Record<string, string>;
  adminNotes?: string;
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  reviewedBy?: string;
}

const mockPendingProducts: PendingProduct[] = [
  {
    id: '1',
    name: 'Lithium Battery Pack 10kWh',
    sku: 'BAT-10KWH-LITH',
    description: 'High-capacity lithium battery for solar storage',
    price: 2499.99,
    category: 'Batteries',
    supplier: 'Tesla Energy',
    supplierId: 'supplier-3',
    status: 'pending',
    stock: 12,
    images: ['/images/battery-1.jpg'],
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    createdAt: '2025-07-20',
    submittedAt: '2025-07-20',
    isFeatured: false,
          tags: ['lithium', 'high-capacity', 'storage'],
      specifications: {
        'Capacity': '10kWh',
        'Voltage': '48V',
        'Cycle Life': '4000 cycles',
        'Warranty': '10 years'
      },
      adminNotes: 'Product appears to meet basic specifications. Need to verify safety certifications and warranty terms.'
  },
  {
    id: '2',
    name: 'Advanced Solar Controller',
    sku: 'CTRL-SOLAR-ADV',
    description: 'Advanced MPPT solar charge controller with Bluetooth',
    price: 189.99,
    category: 'Controllers',
    supplier: 'SolarTech Inc.',
    supplierId: 'supplier-1',
    status: 'under_review',
    stock: 25,
    images: ['/images/controller-1.jpg'],
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    createdAt: '2025-07-19',
    submittedAt: '2025-07-19',
    isFeatured: false,
    tags: ['mppt', 'bluetooth', 'advanced'],
          specifications: {
        'Max Current': '60A',
        'Max Voltage': '150V',
        'Efficiency': '98%',
        'Communication': 'Bluetooth 5.0'
      },
      adminNotes: 'Checking technical specifications and safety compliance. Need to verify Bluetooth certification and safety standards compliance.'
  },
  {
    id: '3',
    name: 'Portable Solar Generator',
    sku: 'GEN-PORT-SOLAR',
    description: 'Portable solar generator for camping and emergencies',
    price: 899.99,
    category: 'Generators',
    supplier: 'PowerMax Systems',
    supplierId: 'supplier-2',
    status: 'rejected',
    stock: 8,
    images: ['/images/generator-1.jpg'],
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    createdAt: '2025-07-18',
    submittedAt: '2025-07-18',
    isFeatured: false,
    tags: ['portable', 'camping', 'emergency'],
    specifications: {
      'Power Output': '1000W',
      'Battery Capacity': '1000Wh',
      'Weight': '12kg',
      'Charging Time': '8 hours'
    },
          rejectionReason: 'Missing safety certifications and incomplete documentation',
      adminNotes: 'Product rejected due to missing UL safety certification and incomplete technical documentation. Supplier needs to provide proper safety compliance documents.'
  },
  {
    id: '4',
    name: 'Solar Panel Cleaning Kit',
    sku: 'CLEAN-KIT-SOLAR',
    description: 'Professional solar panel cleaning kit with telescopic pole',
    price: 79.99,
    category: 'Accessories',
    supplier: 'Energy Store Pro',
    supplierId: 'supplier-4',
    status: 'pending',
    stock: 45,
    images: ['/images/cleaning-kit-1.jpg'],
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    createdAt: '2025-07-21',
    submittedAt: '2025-07-21',
    isFeatured: false,
    tags: ['cleaning', 'professional', 'telescopic'],
          specifications: {
        'Pole Length': '3-6m telescopic',
        'Brush Type': 'Soft bristle',
        'Material': 'Aluminum',
        'Warranty': '2 years'
      },
      adminNotes: 'Cleaning kit looks well-designed. Need to verify material quality and safety of telescopic pole mechanism.'
  },
  {
    id: '5',
    name: 'Smart Home Energy Monitor',
    sku: 'MON-ENERGY-SMART',
    description: 'Real-time energy monitoring system for smart homes',
    price: 149.99,
    category: 'Monitoring',
    supplier: 'LG Energy Solutions',
    supplierId: 'supplier-5',
    status: 'approved',
    stock: 30,
    images: ['/images/monitor-1.jpg'],
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    createdAt: '2025-07-22',
    submittedAt: '2025-07-22',
          approvedAt: '2025-07-23',
      reviewedBy: 'Admin User',
      adminNotes: 'Product meets all safety standards and technical requirements. Bluetooth certification verified. Approved for listing.',
    isFeatured: false,
    tags: ['smart-home', 'monitoring', 'real-time'],
    specifications: {
      'Accuracy': '99.5%',
      'Connectivity': 'WiFi + Bluetooth',
      'App Support': 'iOS & Android',
      'Installation': 'Plug & Play'
    }
  }
];

export default function PendingApprovalPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApprovalService.getAllProductsWithApprovalStatus();
      
      // Transform the data to match our interface
      const transformedProducts: PendingProduct[] = data.map((product: any) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        originalPrice: product.compare_price,
        category: product.category,
        supplier: product.suppliers?.shop_name || product.suppliers?.company_name || 'Unknown Supplier',
        supplierId: product.supplier_id,
        status: product.approval_status || 'pending',
        stock: product.stock_quantity || 0,
        images: product.images || [],
        rating: 0, // Not in your schema yet
        reviewCount: 0, // Not in your schema yet
        salesCount: 0, // Not in your schema yet
        createdAt: product.created_at,
        submittedAt: product.created_at,
        isFeatured: product.is_featured || false,
        tags: [], // Not in your schema yet
        specifications: product.specifications || {},
        adminNotes: product.admin_notes,
        rejectionReason: product.rejection_reason,
        approvedAt: product.approved_at,
        rejectedAt: product.rejected_at,
        reviewedBy: product.reviewed_by
      }));
      
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Using mock data for demonstration.');
      // Fallback to mock data
      setProducts(mockPendingProducts);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || product.supplier === supplierFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(currentProducts.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'under_review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'under_review': return <AlertTriangle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleReviewProduct = (product: PendingProduct) => {
    setSelectedProduct(product);
    setReviewNotes(product.adminNotes || '');
    setRejectionReason(product.rejectionReason || '');
    setReviewModalOpen(true);
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      console.log('🚀 Starting product approval for ID:', productId);
      console.log('📝 Admin notes:', reviewNotes);
      
      const result = await productApprovalService.updateProductApproval({
        productId,
        status: 'approved',
        adminNotes: reviewNotes
      });
      
      console.log('📊 Approval result:', result);
      
      if (result.success) {
        alert(result.message);
        console.log('🔄 Reloading products after approval...');
        await loadProducts(); // Reload products to get updated status
      } else {
        console.error('❌ Approval failed:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error approving product:', error);
      alert('Failed to approve product');
    }
  };

  const handleMarkUnderReview = async (productId: string) => {
    try {
      console.log('🚀 Starting product under review for ID:', productId);
      console.log('📝 Admin notes:', reviewNotes);
      
      const result = await productApprovalService.updateProductApproval({
        productId,
        status: 'under_review',
        adminNotes: reviewNotes
      });
      
      console.log('📊 Under review result:', result);
      
      if (result.success) {
        alert(result.message);
        console.log('🔄 Reloading products after under review...');
        await loadProducts(); // Reload products to get updated status
      } else {
        console.error('❌ Under review failed:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error marking product under review:', error);
      alert('Failed to mark product under review');
    }
  };

  const handleRejectProduct = async (productId: string, reason: string) => {
    try {
      console.log('🚀 Starting product rejection for ID:', productId);
      console.log('📝 Admin notes:', reviewNotes);
      console.log('❌ Rejection reason:', reason);
      
      const result = await productApprovalService.updateProductApproval({
        productId,
        status: 'rejected',
        adminNotes: reviewNotes,
        rejectionReason: reason
      });
      
      console.log('📊 Rejection result:', result);
      
      if (result.success) {
        alert(result.message);
        console.log('🔄 Reloading products after rejection...');
        await loadProducts(); // Reload products to get updated status
      } else {
        console.error('❌ Rejection failed:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error rejecting product:', error);
      alert('Failed to reject product');
    }
  };

  const handleBulkApprove = () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to approve');
      return;
    }
    // In a real app, this would update the backend
    console.log(`Bulk approving products: ${selectedProducts.join(', ')}`);
    alert(`${selectedProducts.length} products approved successfully!`);
    setSelectedProducts([]);
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Name',
      'SKU',
      'Category',
      'Supplier',
      'Status',
      'Price',
      'Stock Quantity',
      'Submitted Date',
      'Admin Notes',
      'Rejection Reason'
    ];

    const csvData = filteredProducts.map(product => [
      product.id,
      product.name,
      product.sku,
      product.category,
      product.supplier,
      product.status,
      product.price,
      product.stock,
      new Date(product.submittedAt).toLocaleDateString(),
      product.adminNotes || '',
      product.rejectionReason || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pending_products_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPending = products.filter(p => p.status === 'pending').length;
  const totalUnderReview = products.filter(p => p.status === 'under_review').length;
  const totalApproved = products.filter(p => p.status === 'approved').length;
  const totalRejected = products.filter(p => p.status === 'rejected').length;
  const totalProducts = products.length;

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const suppliers = ['all', ...Array.from(new Set(products.map(p => p.supplier)))];
  const statuses = ['all', 'pending', 'under_review', 'approved', 'rejected'];

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pending Approval
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Review and approve new product submissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow text-red-600' : 'text-gray-500 dark:text-gray-300'}`}
                title="List View"
              >
                <LayoutList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow text-red-600' : 'text-gray-500 dark:text-gray-300'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={loadProducts}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={exportToCSV}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalPending}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Under Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalUnderReview}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalApproved}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalRejected}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalProducts}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-600 dark:text-gray-400" />
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
                  placeholder="Search pending products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Filter */}
            <div className="lg:w-48">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>
                    {supplier === 'all' ? 'All Suppliers' : supplier}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedProducts.length} selected
                </span>
                <button 
                  onClick={handleBulkApprove}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Products Table or Grid */}
        {!loading && (
          <>
            {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.supplier}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {getStatusIcon(product.status)}
                          <span className="ml-1">{product.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${product.price}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{product.stock}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(product.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleReviewProduct(product)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            title="Review Product"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {product.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApproveProduct(product.id)}
                                className="text-green-400 hover:text-green-600 p-1"
                                title="Approve Product"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleRejectProduct(product.id, 'Rejected by admin')}
                                className="text-red-400 hover:text-red-600 p-1"
                                title="Reject Product"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Product Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-3"
                    />
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleReviewProduct(product)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      title="Review Product"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {product.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApproveProduct(product.id)}
                          className="text-green-400 hover:text-green-600 p-1"
                          title="Approve Product"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRejectProduct(product.id, 'Rejected by admin')}
                          className="text-red-400 hover:text-red-600 p-1"
                          title="Reject Product"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.sku}</p>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Tag className="w-4 h-4 mr-2" />
                    {product.category}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    {product.supplier}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {getStatusIcon(product.status)}
                      <span className="ml-1">{product.status}</span>
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">${product.price}</span>
                  </div>

                  {/* Product Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{product.stock}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Stock</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(product.submittedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p>
                    </div>
                  </div>

                  {product.adminNotes && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Admin Notes:</strong> {product.adminNotes}
                      </p>
                    </div>
                  )}
                  {product.rejectionReason && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-800 dark:text-red-200">
                        <strong>Rejection Reason:</strong> {product.rejectionReason}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Submitted {new Date(product.submittedAt).toLocaleDateString()}
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
          </>
        )}

        {/* Review Modal */}
        {reviewModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Review Product</h2>
                  <button
                    onClick={() => setReviewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Product Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedProduct.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">SKU:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedProduct.sku}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedProduct.category}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Supplier:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedProduct.supplier}</span>
                    </div>
                                      <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Price:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">${selectedProduct.price}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedProduct.status)}`}>
                      {getStatusIcon(selectedProduct.status)}
                      <span className="ml-1">{selectedProduct.status}</span>
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedProduct.description}</p>
                </div>
                {selectedProduct.adminNotes && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Previous Admin Notes:</span>
                    <p className="mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedProduct.adminNotes}</p>
                  </div>
                )}
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Add admin notes for feedback..."
                  />
                </div>

                {/* Rejection Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Reason for rejection..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setReviewModalOpen(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleMarkUnderReview(selectedProduct.id);
                      setReviewModalOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Under Review
                  </button>
                  <button
                    onClick={() => {
                      handleRejectProduct(selectedProduct.id, rejectionReason);
                      setReviewModalOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApproveProduct(selectedProduct.id);
                      setReviewModalOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </AdminLayout>
    </AdminRoute>
  );
} ``