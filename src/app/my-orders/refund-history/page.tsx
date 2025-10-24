'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye,
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { customerRefundService } from '@/lib/customerRefundService';

interface RefundRequest {
  id: string;
  order_id: string;
  return_number: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  return_type: 'REFUND' | 'EXCHANGE' | 'REPLACEMENT';
  reason: string;
  description?: string;
  requested_amount: number;
  approved_amount?: number;
  refund_amount?: number;
  created_at: string;
  updated_at: string;
  order?: {
    order_number: string;
    total_amount: number;
    status: string;
  };
}

export default function RefundHistoryPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (user) {
      fetchRefundHistory();
    }
  }, [user?.id]);

  const fetchRefundHistory = async () => {
    try {
      // Don't show loading if we already have refunds (prevents unnecessary loading on tab return)
      if (refunds.length === 0) {
        setLoading(true);
      }
      const refundRequests = await customerRefundService.getCustomerRefundRequests(user?.id || '');
      setRefunds(refundRequests);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch refund history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending Review',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          icon: Clock
        };
      case 'APPROVED':
        return {
          label: 'Approved',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          icon: CheckCircle
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          icon: X
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          icon: CheckCircle
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          icon: X
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          icon: Clock
        };
    }
  };

  const getReturnTypeLabel = (type: string) => {
    switch (type) {
      case 'REFUND':
        return 'Refund';
      case 'EXCHANGE':
        return 'Exchange';
      case 'REPLACEMENT':
        return 'Replacement';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UnifiedHeader products={[]} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UnifiedHeader products={[]} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/my-orders"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Refund History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your refund requests and their status
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Refunds List */}
        {refunds.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Refund Requests
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't submitted any refund requests yet.
            </p>
            <Link
              href="/my-orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              View Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {refunds.map((refund) => {
              const statusConfig = getStatusConfig(refund.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div
                  key={refund.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {refund.return_number}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Order:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {refund.order?.order_number || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Type:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {getReturnTypeLabel(refund.return_type)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {formatCurrency(refund.requested_amount)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-gray-500 dark:text-gray-400">Reason:</span>
                        <span className="ml-2">{refund.reason}</span>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Submitted: {new Date(refund.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setSelectedRefund(refund)}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Refund Details Modal */}
        {selectedRefund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Refund Details
                  </h2>
                  <button
                    onClick={() => setSelectedRefund(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Refund Number</label>
                      <p className="text-gray-900 dark:text-white">{selectedRefund.return_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const statusConfig = getStatusConfig(selectedRefund.status);
                          const StatusIcon = statusConfig.icon;
                          return (
                            <>
                              <StatusIcon className="w-4 h-4" />
                              <span className={statusConfig.color}>{statusConfig.label}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Number</label>
                      <p className="text-gray-900 dark:text-white">{selectedRefund.order?.order_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                      <p className="text-gray-900 dark:text-white">{getReturnTypeLabel(selectedRefund.return_type)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Requested Amount</label>
                      <p className="text-gray-900 dark:text-white">{formatCurrency(selectedRefund.requested_amount)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved Amount</label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedRefund.approved_amount ? formatCurrency(selectedRefund.approved_amount) : 'Pending'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason</label>
                    <p className="text-gray-900 dark:text-white">{selectedRefund.reason}</p>
                  </div>
                  
                  {selectedRefund.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                      <p className="text-gray-900 dark:text-white">{selectedRefund.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(selectedRefund.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(selectedRefund.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}



