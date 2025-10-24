'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  FileText, 
  Send,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { customerRefundService, RefundRequest, ReturnItem } from '@/lib/customerRefundService';
import { supabase } from '@/lib/auth';

export default function RefundRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();

  const [order, setOrder] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [returnType, setReturnType] = useState<'REFUND' | 'EXCHANGE' | 'REPLACEMENT'>('REFUND');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemReasons, setItemReasons] = useState<Record<string, string>>({});
  const [itemConditions, setItemConditions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!orderId || !user) return;
    
    fetchOrderDetails();
    checkEligibility();
  }, [orderId, user]);

  const fetchOrderDetails = async () => {
    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(
            id,
            product_id,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        setError('Order not found');
        return;
      }

      setOrder(orderData);
    } catch (err) {
      setError('Failed to fetch order details');
    }
  };

  const checkEligibility = async () => {
    if (!orderId) return;

    try {
      const eligibilityResult = await customerRefundService.checkRefundEligibility(orderId);
      setEligibility(eligibilityResult);
      
      if (eligibilityResult.canRequestRefund) {
        setRequestedAmount(eligibilityResult.maxRefundAmount?.toString() || '');
        // Select all items by default
        const allItemIds = eligibilityResult.eligibleItems?.map(item => item.id) || [];
        setSelectedItems(allItemIds);
      }
    } catch (err) {
      setError('Failed to check refund eligibility');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      // Clear item-specific data
      setItemReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[itemId];
        return newReasons;
      });
      setItemConditions(prev => {
        const newConditions = { ...prev };
        delete newConditions[itemId];
        return newConditions;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !user || !eligibility?.canRequestRefund) return;

    setSubmitting(true);
    setError(null);

    try {
      // Prepare return items
      const returnItems: ReturnItem[] = selectedItems.map(itemId => ({
        orderItemId: itemId,
        quantity: order.order_items?.find((item: any) => item.id === itemId)?.quantity || 1,
        returnReason: itemReasons[itemId] || reason,
        conditionDescription: itemConditions[itemId] || description
      }));

      // Prepare refund request
      const refundRequest: RefundRequest = {
        orderId: order.id,
        returnType,
        reason,
        description,
        requestedAmount: parseFloat(requestedAmount),
        customerNotes
      };

      const result = await customerRefundService.submitRefundRequest(
        refundRequest,
        returnItems,
        user.id
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/my-orders');
        }, 3000);
      } else {
        setError(result.error || 'Failed to submit refund request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UnifiedHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UnifiedHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <button
              onClick={() => router.push('/my-orders')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UnifiedHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
          >
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Refund Request Submitted
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your refund request has been submitted successfully. We'll review it and get back to you within 2-3 business days.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              You'll be redirected to your orders page shortly...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!eligibility?.canRequestRefund) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UnifiedHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => router.push('/my-orders')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Orders
              </button>
            </div>

            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Cannot Request Refund
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {eligibility?.reason || 'This order is not eligible for refund requests.'}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Order Details:</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Order:</strong> {order.order_number}<br />
                  <strong>Status:</strong> {order.status}<br />
                  <strong>Payment Status:</strong> {order.payment_status}<br />
                  <strong>Total:</strong> {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UnifiedHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.push('/my-orders')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Orders
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Request Refund
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Order {order.order_number} • {formatCurrency(order.total_amount)}
            </p>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Select Items to Return
            </h2>
            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleItemSelection(item.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Product #{item.product_id}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {item.quantity} • {formatCurrency(item.unit_price)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.total_price)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedItems.includes(item.id) && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reason for Return
                        </label>
                        <input
                          type="text"
                          value={itemReasons[item.id] || ''}
                          onChange={(e) => setItemReasons(prev => ({
                            ...prev,
                            [item.id]: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., Defective item, Wrong size, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Item Condition
                        </label>
                        <textarea
                          value={itemConditions[item.id] || ''}
                          onChange={(e) => setItemConditions(prev => ({
                            ...prev,
                            [item.id]: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          rows={2}
                          placeholder="Describe the condition of the item..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Refund Request Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Refund Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Return Type
                  </label>
                  <select
                    value={returnType}
                    onChange={(e) => setReturnType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="REFUND">Refund</option>
                    <option value="EXCHANGE">Exchange</option>
                    <option value="REPLACEMENT">Replacement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requested Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={requestedAmount}
                      onChange={(e) => setRequestedAmount(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                      min="0"
                      max={eligibility?.maxRefundAmount}
                      step="0.01"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum: {formatCurrency(eligibility?.maxRefundAmount || 0)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Return
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Please describe why you're requesting a refund..."
                  required
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Any additional information that might help us process your request..."
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/my-orders')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || selectedItems.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Refund Request
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
