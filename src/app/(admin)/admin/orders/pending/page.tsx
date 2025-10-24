'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/auth';
import { 
  ShoppingCart, 
  Search, 
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
  DollarSign,
  User,
  Package,
  Truck,
  CreditCard,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Star,
  Zap,
  Calendar,
  Timer
} from 'lucide-react';

interface PendingOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  supplier: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
  }>;
  status: 'pending' | 'confirmed' | 'processing';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  waitingTime: number; // hours since order was placed
  supplierResponseTime?: number; // hours since supplier was notified
  customerNotes?: string;
  adminNotes?: string;
}

const mockPendingOrders: PendingOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-003',
    customer: {
      id: 'customer-3',
      name: 'Mike Davis',
      email: 'mike.davis@email.com',
      phone: '+1 (555) 456-7890',
      address: '789 Pine St, Chicago, IL 60601'
    },
    supplier: {
      id: 'supplier-3',
      name: 'Tesla Energy',
      email: 'orders@teslaenergy.com'
    },
    items: [
      {
        id: 'item-4',
        name: 'Lithium Battery Pack 10kWh',
        sku: 'BAT-10KWH-LITH',
        quantity: 1,
        price: 2499.99,
        total: 2499.99,
        image: '/images/battery-1.jpg'
      }
    ],
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'Bank Transfer',
    subtotal: 2499.99,
    tax: 199.99,
    shipping: 50.00,
    total: 2749.98,
    currency: 'USD',
    createdAt: '2025-07-20T11:45:00Z',
    updatedAt: '2025-07-20T11:45:00Z',
    estimatedDelivery: '2025-08-05',
    notes: 'Large order - requires special handling',
    priority: 'high',
    waitingTime: 48,
    customerNotes: 'Need this for a commercial installation project'
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-006',
    customer: {
      id: 'customer-6',
      name: 'Lisa Chen',
      email: 'lisa.chen@email.com',
      phone: '+1 (555) 234-5678',
      address: '987 Cedar Ln, San Francisco, CA 94102'
    },
    supplier: {
      id: 'supplier-1',
      name: 'SolarTech Inc.',
      email: 'orders@solartech.com'
    },
    items: [
      {
        id: 'item-7',
        name: 'Premium Solar Panel 400W',
        sku: 'SOLAR-400W-PREM',
        quantity: 5,
        price: 299.99,
        total: 1499.95,
        image: '/images/solar-panel-1.jpg'
      }
    ],
    status: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    subtotal: 1499.95,
    tax: 119.99,
    shipping: 75.00,
    total: 1694.94,
    currency: 'USD',
    createdAt: '2025-07-21T09:30:00Z',
    updatedAt: '2025-07-21T09:30:00Z',
    estimatedDelivery: '2025-07-30',
    notes: 'Customer requested expedited shipping',
    priority: 'urgent',
    waitingTime: 24,
    supplierResponseTime: 2,
    customerNotes: 'Urgent installation needed for solar rebate deadline'
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-007',
    customer: {
      id: 'customer-7',
      name: 'Robert Wilson',
      email: 'robert.w@email.com',
      phone: '+1 (555) 345-6789',
      address: '654 Birch Rd, Austin, TX 73301'
    },
    supplier: {
      id: 'supplier-2',
      name: 'PowerMax Systems',
      email: 'orders@powermax.com'
    },
    items: [
      {
        id: 'item-8',
        name: 'Smart Inverter 3000W',
        sku: 'INV-3000W-SMART',
        quantity: 2,
        price: 599.99,
        total: 1199.98,
        image: '/images/inverter-1.jpg'
      }
    ],
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'PayPal',
    subtotal: 1199.98,
    tax: 96.00,
    shipping: 45.00,
    total: 1340.98,
    currency: 'USD',
    createdAt: '2025-07-19T14:20:00Z',
    updatedAt: '2025-07-21T10:15:00Z',
    estimatedDelivery: '2025-07-29',
    notes: 'Standard processing',
    priority: 'medium',
    waitingTime: 72,
    supplierResponseTime: 48,
    customerNotes: 'Regular residential installation'
  },
  {
    id: '4',
    orderNumber: 'ORD-2025-008',
    customer: {
      id: 'customer-8',
      name: 'Jennifer Lee',
      email: 'jennifer.lee@email.com',
      phone: '+1 (555) 456-7890',
      address: '321 Spruce Ave, Denver, CO 80201'
    },
    supplier: {
      id: 'supplier-4',
      name: 'Energy Store Pro',
      email: 'orders@energystore.com'
    },
    items: [
      {
        id: 'item-9',
        name: 'Solar Mounting Kit',
        sku: 'MOUNT-KIT-UNIV',
        quantity: 3,
        price: 89.99,
        total: 269.97,
        image: '/images/mounting-kit-1.jpg'
      },
      {
        id: 'item-10',
        name: 'Solar Cable Set 10m',
        sku: 'CABLE-10M-SOLAR',
        quantity: 2,
        price: 34.99,
        total: 69.98,
        image: '/images/cable-set-1.jpg'
      }
    ],
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    subtotal: 339.95,
    tax: 27.20,
    shipping: 25.00,
    total: 392.15,
    currency: 'USD',
    createdAt: '2025-07-20T16:45:00Z',
    updatedAt: '2025-07-21T11:30:00Z',
    estimatedDelivery: '2025-07-27',
    notes: 'DIY customer - needs installation guide',
    priority: 'low',
    waitingTime: 36,
    supplierResponseTime: 18,
    customerNotes: 'First-time solar installation, need guidance'
  }
];

export default function PendingOrdersPage() {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState<string>('');

  // Function to fetch real pending orders data
  const fetchPendingOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching pending orders from database...');
      
              // Fetch orders with 'PENDING' status and related data
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product:products (
                id,
                name,
                sku,
                image_url
              )
            )
          `)
          .eq('status', 'PENDING')
          .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('❌ Error fetching pending orders:', ordersError);
        setError('Failed to fetch pending orders');
        return;
      }
      
              console.log('✅ Pending orders fetched:', ordersData);
        console.log('🔍 Sample order structure:', ordersData?.[0]);
        
                // Transform database data to match PendingOrder interface
        const transformedOrders: PendingOrder[] = ordersData?.map((dbOrder: any) => {
          console.log('🔍 Processing order:', dbOrder);
          
          // Calculate waiting time in hours
          const createdAt = new Date(dbOrder.created_at);
          const now = new Date();
          const waitingTime = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
          
          // Determine priority based on waiting time and order amount
          let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
          if (waitingTime > 72) priority = 'urgent';
          else if (waitingTime > 48) priority = 'high';
          else if (waitingTime > 24) priority = 'medium';
          
          const transformedOrder = {
            id: dbOrder.id,
            orderNumber: dbOrder.order_number,
            customer: {
              id: dbOrder.user_id,
              name: 'Customer', // We'll need to fetch user details separately
              email: 'customer@email.com',
              phone: '',
              address: dbOrder.shipping_address || ''
            },
            supplier: {
              id: dbOrder.supplier_id || 'unknown',
              name: 'Supplier', // We'll need to fetch supplier details separately
              email: 'supplier@email.com'
            },
            items: dbOrder.order_items?.map((item: any) => ({
              id: item.id,
              name: item.product_name || item.product?.name || 'Unknown Product',
              sku: item.product?.sku || 'N/A',
              quantity: item.quantity,
              price: item.price,
              total: item.total_price,
              image: item.product_image || item.product?.image_url
            })) || [],
            status: dbOrder.status,
            paymentStatus: 'pending', // Default to pending for pending orders
            paymentMethod: 'Credit Card', // Default value
            subtotal: dbOrder.total_amount,
            tax: 0, // Not stored in your schema
            shipping: 0, // Not stored in your schema
            total: dbOrder.total_amount,
            currency: '₦', // Using your platform currency
            createdAt: dbOrder.created_at,
            updatedAt: dbOrder.updated_at,
            estimatedDelivery: dbOrder.estimated_delivery,
            notes: '',
            priority,
            waitingTime,
            supplierResponseTime: 0, // Default value
            customerNotes: '',
            adminNotes: ''
          };
          
          console.log('✅ Transformed order:', transformedOrder);
          return transformedOrder;
        }) || [];
      
      setPendingOrders(transformedOrders);
      console.log('✅ Transformed pending orders:', transformedOrders);
      
    } catch (err) {
      console.error('❌ Error in fetchPendingOrders:', err);
      setError('Failed to fetch pending orders data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch real pending orders data on component mount
  useEffect(() => {
    fetchPendingOrders();
  }, []);

  // Filter orders based on search and filters
  const filteredOrders = pendingOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toUpperCase() === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    const matchesSupplier = supplierFilter === 'all' || order.supplier.name === supplierFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSupplier;
  });

  // Sort by priority and waiting time
  const sortedOrders = filteredOrders.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    return b.waitingTime - a.waitingTime;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(currentOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'PROCESSING': return <RefreshCw className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatusDisplay = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'Pending';
      case 'CONFIRMED': return 'Confirmed';
      case 'PROCESSING': return 'Processing';
      case 'SHIPPED': return 'Shipped';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Zap className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleQuickApprove = (orderId: string) => {
    // In a real app, this would update the backend
    console.log(`Quick approving order ${orderId}`);
    alert('Order approved successfully!');
  };

  const handleQuickReject = (orderId: string) => {
    // In a real app, this would update the backend
    console.log(`Quick rejecting order ${orderId}`);
    alert('Order rejected successfully!');
  };

  const handleBulkAction = () => {
    if (selectedOrders.length === 0) {
      alert('Please select orders for bulk action');
      return;
    }
    if (!selectedBulkAction) {
      alert('Please select an action');
      return;
    }
    // In a real app, this would update the backend
    console.log(`Bulk action ${selectedBulkAction} on orders: ${selectedOrders.join(', ')}`);
    alert(`${selectedOrders.length} orders processed with action: ${selectedBulkAction}`);
    setSelectedOrders([]);
    setBulkActionModalOpen(false);
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'Order ID',
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Supplier',
      'Status',
      'Priority',
      'Total Amount',
      'Waiting Time (hours)',
      'Created Date',
      'Customer Notes'
    ];

    const csvData = filteredOrders.map(order => [
      order.id,
      order.orderNumber,
      order.customer.name,
      order.customer.email,
      order.supplier.name,
      order.status,
      order.priority,
      order.total,
      order.waitingTime,
      new Date(order.createdAt).toLocaleDateString(),
      order.customerNotes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pending_orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPending = pendingOrders.length;
  const urgentOrders = pendingOrders.filter(o => o.priority === 'urgent').length;
  const highPriorityOrders = pendingOrders.filter(o => o.priority === 'high').length;
  const averageWaitingTime = pendingOrders.length > 0 ? Math.round(pendingOrders.reduce((sum, o) => sum + o.waitingTime, 0) / pendingOrders.length) : 0;

  const statuses = ['all', 'PENDING', 'CONFIRMED', 'PROCESSING'];
  const priorities = ['all', 'urgent', 'high', 'medium', 'low'];
  const suppliers = ['all', ...Array.from(new Set(pendingOrders.map(o => o.supplier.name)))];

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading pending orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pending Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and process pending orders with priority handling
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
              onClick={() => {
                setCurrentPage(1);
                fetchPendingOrders();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button 
              onClick={exportToCSV}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            {selectedOrders.length > 0 && (
              <button 
                onClick={() => setBulkActionModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Bulk Actions ({selectedOrders.length})
              </button>
            )}
          </div>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Debug:</strong> Pending orders loaded: {pendingOrders.length} | Filtered: {filteredOrders.length} | Current page: {currentPage}
            </p>
          </div>
        )}

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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{urgentOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-red-600 dark:text-red-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{highPriorityOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Wait Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{averageWaitingTime}h</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Timer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                  placeholder="Search pending orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
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
                     {status === 'all' ? 'All Status' : formatStatusDisplay(status)}
                   </option>
                 ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="lg:w-48">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority === 'all' ? 'All Priority' : priority.charAt(0).toUpperCase() + priority.slice(1)}
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
          </div>
        </div>

        {/* Orders Table or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wait Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No pending orders found</p>
                          <p className="text-sm">All orders have been processed or there are no pending orders yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{order.orderNumber}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} items</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customer.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                          {getPriorityIcon(order.priority)}
                          <span className="ml-1">{order.priority}</span>
                        </span>
                      </td>
                                             <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                           {getStatusIcon(order.status)}
                           <span className="ml-1">{formatStatusDisplay(order.status)}</span>
                         </span>
                       </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{order.waitingTime}h</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">₦{order.total}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleQuickApprove(order.id)}
                            className="text-green-400 hover:text-green-600 p-1"
                            title="Quick Approve"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleQuickReject(order.id)}
                            className="text-red-400 hover:text-red-600 p-1"
                            title="Quick Reject"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentOrders.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No pending orders found</p>
                  <p className="text-sm">All orders have been processed or there are no pending orders yet.</p>
                </div>
              </div>
            ) : (
              currentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-3"
                    />
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleQuickApprove(order.id)}
                      className="text-green-400 hover:text-green-600 p-1"
                      title="Quick Approve"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleQuickReject(order.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Quick Reject"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Order Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} items</p>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    {order.customer.name}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                      {getPriorityIcon(order.priority)}
                      <span className="ml-1">{order.priority}</span>
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">₦{order.total}</span>
                  </div>

                                     <div className="flex items-center justify-between">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                       {getStatusIcon(order.status)}
                       <span className="ml-1">{formatStatusDisplay(order.status)}</span>
                     </span>
                     <span className="text-sm text-gray-500 dark:text-gray-400">{order.waitingTime}h</span>
                   </div>

                  {/* Order Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{order.items.length}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                    </div>
                  </div>

                  {order.customerNotes && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Customer Note:</strong> {order.customerNotes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
            )}
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

        {/* Bulk Action Modal */}
        {bulkActionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bulk Actions</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {selectedOrders.length} orders selected
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Action
                  </label>
                  <select
                    value={selectedBulkAction}
                    onChange={(e) => setSelectedBulkAction(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Choose an action...</option>
                    <option value="approve">Approve All</option>
                    <option value="reject">Reject All</option>
                    <option value="confirm">Confirm All</option>
                    <option value="process">Mark as Processing</option>
                    <option value="priority_high">Set Priority to High</option>
                    <option value="priority_urgent">Set Priority to Urgent</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setBulkActionModalOpen(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkAction}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Apply Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 