'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Package, 
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  LayoutList,
  Grid3x3,
  Edit,
  Copy,
  Archive,
  Trash2,
  Printer,
  Mail,
  X,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { orderService, Order, OrderItem } from '@/lib/orderService';
import { supabase } from '@/lib/auth';

const statusConfig = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
  },
  PROCESSING: {
    label: 'Processing',
    icon: Package,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  },
  SHIPPED: {
    label: 'Shipped',
    icon: Truck,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
  },
  DELIVERED: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  },
  // Refund statuses
  REFUND_PENDING: {
    label: 'Refund Pending',
    icon: Clock,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
  },
  REFUND_PROCESSED: {
    label: 'Refund Processed',
    icon: Package,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
  },
  REFUNDED: {
    label: 'Refunded',
    icon: CheckCircle,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  },
  REFUND_REJECTED: {
    label: 'Refund Rejected',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }
};

export default function OrdersPage() {
  const { user, profile } = useAuth();
  const { currentCurrency, formatCurrency, getCurrencySymbol } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Fetch orders on component mount
  useEffect(() => {
    if (user?.id && profile) {
      // Add a small delay to ensure authentication context is fully established
      const timer = setTimeout(() => {
        fetchOrders();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user?.id, profile]);

  const fetchOrders = async () => {
    if (!user?.id) {
      return;
    }
    
    // Wait for profile to be loaded before fetching orders
    if (!profile) {
      return;
    }
    
    setLoading(true);
    try {
      // First, let's check if any orders exist at all
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select('*')
        .limit(5);
      
      
      // Check if user is in suppliers table
      const { data: supplierCheck, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', user.id)
        .single();
      
      
      const ordersData = await orderService.getOrders(user.id);
      setOrders(ordersData.data || []);
    } catch (error) {
      // Error fetching orders
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = (orders || []).filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (order.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (order.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus.toUpperCase();
    
    return matchesSearch && matchesStatus;
  });

  const statuses = ['all', ...Object.keys(statusConfig)];

  const openViewModal = async (order: Order) => {
    setViewingOrder(order);
    setShowViewModal(true);
    
    // Fetch revenue breakdown for this order
    try {
      const { data, error } = await supabase
        .from('order_revenue_breakdown')
        .select('*')
        .eq('order_id', order.id)
        .single();
      
      if (!error && data) {
        setRevenueBreakdown(data);
      } else {
        setRevenueBreakdown(null);
      }
    } catch (error) {
      // Could not fetch revenue breakdown for order
      setRevenueBreakdown(null);
    }
  };

  const toggleDropdown = (orderId: number) => {
    setOpenDropdown(openDropdown === orderId ? null : orderId);
  };

  const handleDropdownAction = async (action: string, order: Order) => {
    setOpenDropdown(null);
    switch (action) {
      case 'view':
        openViewModal(order);
        break;
      case 'print':
        printInvoice(order);
        break;
      case 'email':
        emailCustomer(order);
        break;
      case 'cancel':
        setCancellingOrder(order);
        setShowCancelModal(true);
        break;
      case 'process':
        await processOrder(order.id);
        break;
      case 'ship':
        await shipOrder(order.id);
        break;
      case 'deliver':
        await deliverOrder(order.id);
        break;
    }
  };

  const processOrder = async (orderId: string) => {
    setProcessingAction(`processing-${orderId}`);
    try {
      const success = await orderService.processOrder(orderId);
      if (success) {
        await fetchOrders(); // Refresh orders
        displaySuccessMessage('Order processed successfully!');
      } else {
        displaySuccessMessage('Failed to process order. Please try again.');
      }
    } catch (error) {
      displaySuccessMessage('Error processing order. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const shipOrder = async (orderId: string) => {
    setProcessingAction(`shipping-${orderId}`);
    try {
      const success = await orderService.shipOrder(orderId);
      if (success) {
        await fetchOrders(); // Refresh orders
        displaySuccessMessage('Order marked as shipped!');
      } else {
        displaySuccessMessage('Failed to ship order. Please try again.');
      }
    } catch (error) {
      displaySuccessMessage('Error shipping order. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const deliverOrder = async (orderId: string) => {
    setProcessingAction(`delivering-${orderId}`);
    try {
      const { data, error } = await orderService.deliverOrder(orderId);
      if (data && !error) {
        await fetchOrders(); // Refresh orders
        displaySuccessMessage('Order marked as delivered!');
      } else {
        displaySuccessMessage('Failed to deliver order. Please try again.');
      }
    } catch (error) {
      displaySuccessMessage('Error delivering order. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const printInvoice = (order: Order) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print invoices');
      return;
    }

    const customerName = order.customer ? 
      `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || 
      order.customer.email : 'Customer';

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .customer-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 18px; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>${order.order_number}</h2>
          </div>
          
          <div class="invoice-details">
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${orderService.getEnhancedStatusLabel(order)}</p>
          </div>
          
          <div class="customer-info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${order.customer?.email || 'N/A'}</p>
            <p><strong>Shipping Address:</strong> ${formatShippingAddress(order.shipping_address)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map((item: OrderItem) => `
                <tr>
                  <td>${item.product?.name || 'Product'}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unit_price)}</td>
                  <td>${formatCurrency(item.total_price)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total: ${formatCurrency(order.total_amount)}</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Electrify Solar Marketplace</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);

    displaySuccessMessage('Invoice printed successfully!');
  };

  const emailCustomer = (order: Order) => {
    const customerName = order.customer ? 
      `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || 
      order.customer.email : 'Customer';
    const customerEmail = order.customer?.email || 'customer@example.com';

    // Create email content
    const subject = encodeURIComponent(`Order Update - ${order.order_number}`);
    const body = encodeURIComponent(`
Dear ${customerName},

Thank you for your order ${order.order_number} placed on ${new Date(order.created_at).toLocaleDateString()}.

Order Details:
${order.items?.map((item: OrderItem) => `- ${item.quantity}x ${item.product?.name || 'Product'} - ${formatCurrency(item.unit_price)}`).join('\n') || 'No items found'}

Total: ${formatCurrency(order.total_amount)}

Current Status: ${orderService.getEnhancedStatusLabel(order)}

Shipping Address:
${order.shipping_address}

${order.tracking_number ? `Tracking Number: ${order.tracking_number}` : ''}
${order.estimated_delivery ? `Estimated Delivery: ${new Date(order.estimated_delivery).toLocaleDateString()}` : ''}

If you have any questions about your order, please don't hesitate to contact us.

Best regards,
Electrify Solar Marketplace Team
    `);

    // Open default email client
    window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`);

    displaySuccessMessage('Email client opened with order details!');
  };

  const confirmCancelOrder = async () => {
    if (!cancellingOrder || !user?.id) return;

    setProcessingAction(`cancelling-${cancellingOrder.id}`);
    try {
      // Use enhanced cancellation with reason and user ID
      const { data, error } = await orderService.cancelOrder(
        cancellingOrder.id, 
        'Cancelled by supplier', 
        user.id
      );
      
      if (error) {
        displaySuccessMessage(`Failed to cancel order: ${error.message}`);
      } else {
        await fetchOrders(); // Refresh orders
        setShowCancelModal(false);
        setCancellingOrder(null);
        displaySuccessMessage('Order cancelled successfully!');
      }
    } catch (error) {
      displaySuccessMessage('Error cancelling order. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const displaySuccessMessage = (message: string) => {
    setShowSuccessMessage(message);
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  const getCustomerDisplayName = (order: Order): string => {
    if (order.customer) {
      const fullName = `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
      return fullName || order.customer.email;
    }
    return 'Customer';
  };

  const getCustomerEmail = (order: Order): string => {
    return order.customer?.email || 'N/A';
  };

  const formatShippingAddress = (shippingAddress: any): string => {
    if (!shippingAddress) return 'N/A';
    
    // If it's already a string, return it
    if (typeof shippingAddress === 'string') return shippingAddress;
    
    // If it's an object, format it
    if (typeof shippingAddress === 'object') {
      const address = shippingAddress as any;
      const parts = [
        address.first_name,
        address.last_name,
        address.address_line_1,
        address.address_line_2,
        address.city,
        address.state,
        address.postal_code,
        address.country
      ].filter(Boolean); // Remove empty/undefined values
      
      return parts.join(', ');
    }
    
    return 'N/A';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="text-lg text-gray-600 dark:text-gray-300">Loading orders...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {showSuccessMessage}
            <button
              onClick={() => setShowSuccessMessage(null)}
              className="ml-2 hover:bg-green-600 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage and track your customer orders
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredOrders.length} orders
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : statusConfig[status as keyof typeof statusConfig]?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders List/Grid Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Orders</h2>
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-md border ${view === 'list' ? 'bg-primary-100 dark:bg-primary-900/20 border-primary-500 dark:border-primary-400 text-primary-700 dark:text-primary-300' : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <LayoutList className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-md border ${view === 'grid' ? 'bg-primary-100 dark:bg-primary-900/20 border-primary-500 dark:border-primary-400 text-primary-700 dark:text-primary-300' : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Orders List or Grid */}
        {view === 'list' ? (
          <div className="space-y-4">
            {filteredOrders.map((order, idx) => {
              const enhancedStatus = orderService.getEnhancedStatusLabel(order);
              const status = statusConfig[order.status as keyof typeof statusConfig];
              const StatusIcon = status?.icon || Clock;
              return (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {order.order_number}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status?.color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {enhancedStatus}
                          </span>
                          <button 
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(idx);
                            }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                            {openDropdown === idx && (
                              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                <button
                                  onClick={() => handleDropdownAction('view', order)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleDropdownAction('print', order)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Printer className="w-4 h-4" />
                                  Print Invoice
                                </button>
                                <button
                                  onClick={() => handleDropdownAction('email', order)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Mail className="w-4 h-4" />
                                  Email Customer
                                </button>
                                {order.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleDropdownAction('process', order)}
                                    className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                                  >
                                    <Package className="w-4 h-4" />
                                    Process Order
                                  </button>
                                )}
                                {order.status === 'PROCESSING' && (
                                  <button
                                    onClick={() => handleDropdownAction('ship', order)}
                                    className="w-full px-4 py-2 text-left text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
                                  >
                                    <Truck className="w-4 h-4" />
                                    Mark Shipped
                                  </button>
                                )}
                                {order.status === 'SHIPPED' && (
                                  <button
                                    onClick={() => handleDropdownAction('deliver', order)}
                                    className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark Delivered
                                  </button>
                                )}
                                {(() => {
                                  const { canCancel, reason } = orderService.canCancelOrder(order);
                                  return canCancel && (
                                    <>
                                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                      <button
                                        onClick={() => handleDropdownAction('cancel', order)}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                      >
                                        <X className="w-4 h-4" />
                                        Cancel Order
                                      </button>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Customer Info */}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Customer</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{getCustomerDisplayName(order)}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{getCustomerEmail(order)}</p>
                        </div>
                        {/* Products */}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Products</h4>
                          <div className="space-y-1">
                            {order.items?.map((item, index) => (
                              <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
                                {item.quantity}x {item.product?.name || 'Product'}
                              </div>
                            )) || <span className="text-sm text-gray-500">No items</span>}
                          </div>
                        </div>
                        {/* Order Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Order Details</h4>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.items?.reduce((total, item) => total + item.quantity, 0) || 0} items
                          </p>
                        </div>
                      </div>
                      {/* Shipping Address */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Shipping Address</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatShippingAddress(order.shipping_address)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => openViewModal(order)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {order.status === 'PENDING' && (
                      <button 
                        onClick={() => handleDropdownAction('process', order)}
                        disabled={processingAction === `processing-${order.id}`}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        {processingAction === `processing-${order.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                        Process Order
                      </button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <button 
                        onClick={() => handleDropdownAction('ship', order)}
                        disabled={processingAction === `shipping-${order.id}`}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        {processingAction === `shipping-${order.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Truck className="w-4 h-4" />
                        )}
                        Mark Shipped
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button 
                        onClick={() => handleDropdownAction('deliver', order)}
                        disabled={processingAction === `delivering-${order.id}`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        {processingAction === `delivering-${order.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order, idx) => {
              const enhancedStatus = orderService.getEnhancedStatusLabel(order);
              const status = statusConfig[order.status as keyof typeof statusConfig];
              const StatusIcon = status?.icon || Clock;
              return (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{order.order_number}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status?.color}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {enhancedStatus}
                      </span>
                      <button 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(idx);
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                        {openDropdown === idx && (
                          <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                            <button
                              onClick={() => handleDropdownAction('view', order)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleDropdownAction('print', order)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Printer className="w-4 h-4" />
                              Print Invoice
                            </button>
                            <button
                              onClick={() => handleDropdownAction('email', order)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Mail className="w-4 h-4" />
                              Email Customer
                            </button>
                            {order.status === 'PROCESSING' && (
                              <>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                <button
                                  onClick={() => handleDropdownAction('cancel', order)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel Order
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Customer:</span>
                    <div className="text-sm text-gray-900 dark:text-white">{getCustomerDisplayName(order)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{getCustomerEmail(order)}</div>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Products:</span>
                    <div className="text-sm text-gray-900 dark:text-white">
                                          {order.items?.map((item, idx) => (
                      <div key={idx}>{item.quantity}x {item.product?.name || 'Product'}</div>
                    )) || <span className="text-gray-500">No items</span>}
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Order Total:</span>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</div>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Shipping:</span>
                    <div className="text-sm text-gray-900 dark:text-white">{formatShippingAddress(order.shipping_address)}</div>
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => openViewModal(order)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {orders.length === 0 ? 'You haven\'t received any orders yet.' : 'Try adjusting your search or filter criteria'}
            </p>
          </div>
        )}

        {/* View Order Modal */}
        {showViewModal && viewingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl p-6 relative flex flex-col max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
                onClick={() => setShowViewModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Order {viewingOrder.order_number}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Order placed on {new Date(viewingOrder.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Order Status */}
              <div className="mb-6">
                {(() => {
                  const enhancedStatus = orderService.getEnhancedStatusLabel(viewingOrder);
                  const status = statusConfig[viewingOrder.status as keyof typeof statusConfig];
                  const StatusIcon = status?.icon || Clock;
                  return (
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${status?.color}`}>
                      <StatusIcon className="w-5 h-5 mr-2" />
                      {enhancedStatus}
                    </span>
                  );
                })()}
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{getCustomerDisplayName(viewingOrder)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{getCustomerEmail(viewingOrder)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(viewingOrder.subtotal || 0)}</p>
                    </div>
                    {viewingOrder.tax_amount > 0 && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tax:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(viewingOrder.tax_amount)}</p>
                      </div>
                    )}
                    {viewingOrder.shipping_amount > 0 && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Shipping:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(viewingOrder.shipping_amount)}</p>
                      </div>
                    )}
                    {!revenueBreakdown && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Platform Fees:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency((viewingOrder.total_amount || 0) - (viewingOrder.subtotal || 0) - (viewingOrder.tax_amount || 0) - (viewingOrder.shipping_amount || 0))}
                        </p>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(viewingOrder.total_amount)}</p>
                    </div>
                    {revenueBreakdown && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Revenue Breakdown</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Subtotal:</span>
                            <span className="font-medium">{formatCurrency(revenueBreakdown.subtotal)}</span>
                          </div>
                          {revenueBreakdown.commission_amount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-blue-700 dark:text-blue-300">Commission ({((revenueBreakdown.commission_amount / revenueBreakdown.subtotal) * 100).toFixed(1)}%):</span>
                              <span className="font-medium text-red-600">-{formatCurrency(revenueBreakdown.commission_amount)}</span>
                            </div>
                          )}
                          {revenueBreakdown.platform_fee_amount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-blue-700 dark:text-blue-300">Platform Fee:</span>
                              <span className="font-medium text-red-600">-{formatCurrency(revenueBreakdown.platform_fee_amount)}</span>
                            </div>
                          )}
                          {revenueBreakdown.payment_processing_fee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-blue-700 dark:text-blue-300">Payment Processing Fee:</span>
                              <span className="font-medium text-red-600">-{formatCurrency(revenueBreakdown.payment_processing_fee)}</span>
                            </div>
                          )}
                          <div className="border-t pt-1 mt-2">
                            <div className="flex justify-between font-semibold">
                              <span className="text-blue-900 dark:text-blue-100">Your Payout:</span>
                              <span className="text-green-600">{formatCurrency(revenueBreakdown.supplier_payout)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {viewingOrder.tracking_number && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tracking Number:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{viewingOrder.tracking_number}</p>
                  </div>
                    )}
                    {viewingOrder.estimated_delivery && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Delivery:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{new Date(viewingOrder.estimated_delivery).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Products</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="space-y-3">
                    {viewingOrder.items?.map((item: OrderItem, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.unit_price)}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total: {formatCurrency(item.total_price)}</p>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No items found</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Shipping Address</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-white">
                    {formatShippingAddress(viewingOrder.shipping_address)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => printInvoice(viewingOrder)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </button>
                <button
                  onClick={() => emailCustomer(viewingOrder)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email Customer
                </button>
                {viewingOrder.status === 'PENDING' && (
                  <button 
                    onClick={() => handleDropdownAction('process', viewingOrder)}
                    disabled={processingAction === `processing-${viewingOrder.id}`}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {processingAction === `processing-${viewingOrder.id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                    Process Order
                  </button>
                )}
                {viewingOrder.status === 'PROCESSING' && (
                  <button 
                    onClick={() => handleDropdownAction('ship', viewingOrder)}
                    disabled={processingAction === `shipping-${viewingOrder.id}`}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {processingAction === `shipping-${viewingOrder.id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                    Mark Shipped
                  </button>
                )}
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Order Confirmation Modal */}
        {showCancelModal && cancellingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cancel Order
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Are you sure you want to cancel this order?
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>Order ID:</strong> {cancellingOrder.order_number}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>Customer:</strong> {getCustomerDisplayName(cancellingOrder)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Total:</strong> {formatCurrency(cancellingOrder.total_amount)}
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellingOrder(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancelOrder}
                  disabled={processingAction === `cancelling-${cancellingOrder.id}`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {processingAction === `cancelling-${cancellingOrder.id}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 
 
 
 
 
 