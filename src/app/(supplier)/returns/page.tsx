'use client';

import { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Package,
  DollarSign,
  Calendar,
  User,
  X
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { returnsService, Return } from '@/lib/returnsService';

export default function ReturnsPage() {
  const { user } = useAuth();
  const { currentCurrency, formatCurrency, getCurrencySymbol } = useCurrency();
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingReturn, setViewingReturn] = useState<Return | null>(null);

  useEffect(() => {
    fetchReturns();
  }, [user?.id]);

  const fetchReturns = async () => {
    if (!user?.id) {
      return;
    }

    // Fetching returns for supplier
    setLoading(true);
    try {
      const returnsData = await returnsService.getReturns(user.id);
      // Returns data received
      setReturns(returnsData);
    } catch (error) {
      // Error fetching returns
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return returnsService.getStatusColor(status);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'PROCESSED':
        return <Package className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'REFUND':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'EXCHANGE':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'REPLACEMENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredReturns = returns.filter(returnItem => {
    const customerName = `${returnItem.customer?.first_name || ''} ${returnItem.customer?.last_name || ''}`.trim();
    const productName = returnItem.items?.[0]?.product?.name || 'Unknown Product';
    const orderNumber = returnItem.order?.order_number || '';
    
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.return_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || returnItem.status.toLowerCase() === selectedStatus;
    const matchesType = selectedType === 'all' || returnItem.return_type.toLowerCase() === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'PENDING').length,
    approved: returns.filter(r => r.status === 'APPROVED').length,
    completed: returns.filter(r => r.status === 'COMPLETED').length,
    totalAmount: returns.reduce((sum, r) => sum + r.requested_amount, 0)
  };

  const openViewModal = (returnItem: Return) => {
    setViewingReturn(returnItem);
    setShowViewModal(true);
  };

  const handleApproveReturn = async (returnId: string) => {
    try {
      const success = await returnsService.approveReturn(returnId);
      if (success) {
        await fetchReturns(); // Refresh the data
        setShowViewModal(false);
      }
    } catch (error) {
      console.error('Error approving return:', error);
    }
  };

  const handleRejectReturn = async (returnId: string) => {
    try {
      const success = await returnsService.rejectReturn(returnId);
      if (success) {
        await fetchReturns(); // Refresh the data
        setShowViewModal(false);
      }
    } catch (error) {
      console.error('Error rejecting return:', error);
    }
  };

  const handleCompleteReturn = async (returnId: string) => {
    try {
      const success = await returnsService.completeReturn(returnId);
      if (success) {
        await fetchReturns(); // Refresh the data
        setShowViewModal(false);
      }
    } catch (error) {
      console.error('Error completing return:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Returns & Refunds</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage customer returns and process refunds
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Returns</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{returnsService.formatCurrency(stats.totalAmount, currentCurrency)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search returns by customer, product, or order ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {/* Type Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="refund">Refund</option>
                <option value="exchange">Exchange</option>
                <option value="replacement">Replacement</option>
              </select>
            </div>
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Return Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReturns.map((returnItem) => {
                  const customerName = `${returnItem.customer?.first_name || ''} ${returnItem.customer?.last_name || ''}`.trim() || 'Unknown Customer';
                  const productName = returnItem.items?.[0]?.product?.name || 'Unknown Product';
                  const orderNumber = returnItem.order?.order_number || 'Unknown Order';
                  
                  return (
                    <tr key={returnItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {productName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Order: {orderNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Reason: {returnItem.reason}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customerName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {returnItem.customer?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {returnsService.formatCurrency(returnItem.requested_amount, currentCurrency)}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(returnItem.return_type)}`}>
                          {returnsService.getReturnTypeLabel(returnItem.return_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                          {getStatusIcon(returnItem.status)}
                          <span className="ml-1">{returnsService.getStatusLabel(returnItem.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(returnItem.created_at).toLocaleDateString()}
                        </div>
                        {returnItem.expected_return_date && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {new Date(returnItem.expected_return_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openViewModal(returnItem)}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredReturns.length === 0 && !loading && (
          <div className="text-center py-12">
            <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No returns found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No returns match your current filters
            </p>
          </div>
        )}

        {/* View Return Modal */}
        {showViewModal && viewingReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl p-6 relative flex flex-col max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
                onClick={() => setShowViewModal(false)}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Return Details
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Return requested on {new Date(viewingReturn.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Return Status */}
              <div className="mb-6">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(viewingReturn.status)}`}>
                  {getStatusIcon(viewingReturn.status)}
                  <span className="ml-2">{returnsService.getStatusLabel(viewingReturn.status)}</span>
                </span>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ml-3 ${getTypeColor(viewingReturn.return_type)}`}>
                  {returnsService.getReturnTypeLabel(viewingReturn.return_type)}
                </span>
              </div>

              {/* Return Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {viewingReturn.customer?.first_name && viewingReturn.customer?.last_name 
                          ? `${viewingReturn.customer.first_name} ${viewingReturn.customer.last_name}`
                          : 'Unknown Customer'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{viewingReturn.customer?.email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Order ID:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{viewingReturn.order?.order_number || 'Unknown Order'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{returnsService.formatCurrency(viewingReturn.requested_amount, currentCurrency)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Product Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {viewingReturn.items && viewingReturn.items.length > 0 ? (
                    viewingReturn.items.map((item, index) => (
                      <div key={item.id} className={index > 0 ? 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-600' : ''}>
                        <p className="font-medium text-gray-900 dark:text-white mb-2">{item.product?.name || 'Unknown Product'}</p>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                            <p className="text-gray-900 dark:text-white">{item.quantity}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Unit Price:</span>
                            <p className="text-gray-900 dark:text-white">{returnsService.formatCurrency(item.unit_price, currentCurrency)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Price:</span>
                            <p className="text-gray-900 dark:text-white">{returnsService.formatCurrency(item.total_price, currentCurrency)}</p>
                          </div>
                          {item.return_reason && (
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Return Reason:</span>
                              <p className="text-gray-900 dark:text-white">{item.return_reason}</p>
                            </div>
                          )}
                          {item.condition_description && (
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Condition:</span>
                              <p className="text-gray-900 dark:text-white">{item.condition_description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No items found</p>
                  )}
                </div>
              </div>

              {/* Return Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Return Details</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Return Number:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{viewingReturn.return_number}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Reason:</span>
                      <p className="text-gray-900 dark:text-white">{viewingReturn.reason}</p>
                    </div>
                    {viewingReturn.description && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Description:</span>
                        <p className="text-gray-900 dark:text-white">{viewingReturn.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Important Dates</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Requested Date:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(viewingReturn.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {viewingReturn.expected_return_date && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Expected Return Date:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(viewingReturn.expected_return_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {viewingReturn.status === 'PENDING' && (
                  <button 
                    onClick={() => handleApproveReturn(viewingReturn.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Approve Return
                  </button>
                )}
                {viewingReturn.status === 'APPROVED' && (
                  <button 
                    onClick={() => handleCompleteReturn(viewingReturn.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Complete Return
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
      </div>
    </DashboardLayout>
  );
} 