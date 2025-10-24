'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/auth';
import { adminRefundService, AdminRefundRequest } from '@/lib/adminRefundService';
import { sellerEarningsService } from '@/lib/sellerEarningsService';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
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
  MessageSquare,
  Paperclip,
  UploadCloud,
  FileText,
  Send,
  ShieldCheck,
  FileCheck2,
  FileX2,
  FileWarning,
  FilePlus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Dispute {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  supplier: {
    id: string;
    name: string;
    email: string;
  };
  reason: string;
  status: 'open' | 'in_review' | 'resolved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  orderTotal: number;
  orderStatus: string;
  messages: Array<{
    id: string;
    sender: 'admin' | 'customer' | 'supplier';
    content: string;
    timestamp: string;
    attachments?: string[];
  }>;
  evidence: string[];
  resolution?: string;
}

// For now, we'll create disputes based on orders that might have issues
// In a real implementation, you'd have a separate disputes table

export default function DisputesPage() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [refundOrders, setRefundOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<any | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showEvidence, setShowEvidence] = useState(false);
  const [resolutionInput, setResolutionInput] = useState('');
  
  // Refund form states
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);
  const [eligibility, setEligibility] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'disputes' | 'refunds'>('disputes');

  // Function to fetch disputes and refund orders
  const fetchDisputes = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching disputes and refund data from database...');
      
      // Fetch disputes (existing logic) - only cancelled orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'CANCELLED')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('❌ Error fetching orders for disputes:', ordersError);
        setError('Failed to fetch disputes data');
        return;
      }

      console.log('✅ Orders fetched for disputes:', ordersData);
      
      // Transform cancelled orders into disputes
      // In a real app, you'd have a separate disputes table
      const transformedDisputes: Dispute[] = ordersData?.map((order: any) => {
        // Create dispute for cancelled orders (suppliers can cancel, customers can only request refunds)
        const reason = 'Order was cancelled by supplier';
        
        // Get dispute status from localStorage
        let status: 'open' | 'in_review' | 'resolved' | 'rejected' = 'open';
        try {
          const disputeStatuses = JSON.parse(localStorage.getItem('disputeStatuses') || '{}');
          if (disputeStatuses[order.id] && disputeStatuses[order.id].status) {
            const storedStatus = disputeStatuses[order.id].status;
            if (['open', 'in_review', 'resolved', 'rejected'].includes(storedStatus)) {
              status = storedStatus as 'open' | 'in_review' | 'resolved' | 'rejected';
            }
          }
        } catch (error) {
          console.error('Error reading dispute status from localStorage:', error);
        }
        
        return {
          id: order.id,
          orderNumber: order.order_number,
          customer: {
            id: order.user_id || order.customer_id || 'unknown',
            name: 'Customer', // We'll fetch user details separately if needed
            email: 'customer@email.com'
          },
          supplier: {
            id: order.supplier_id || 'unknown',
            name: 'Supplier', // We'll fetch supplier details separately if needed
            email: 'supplier@email.com'
          },
          reason,
          status,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          orderTotal: order.total_amount,
          orderStatus: order.status,
          messages: [
            {
              id: 'm1',
              sender: 'supplier',
              content: `Order ${order.order_number} was cancelled by supplier`,
              timestamp: order.created_at
            }
          ],
          evidence: [],
          resolution: undefined // No resolution yet for cancelled orders
        };
      }) || [];
      
      setDisputes(transformedDisputes);
      console.log('✅ Transformed disputes:', transformedDisputes);
      
          // Fetch orders that actually have refund requests OR cancelled orders that need refunds
          try {
            // First get orders with existing refund requests
            const { data: refundRequests, error: refundError } = await supabase
              .from('returns')
              .select(`
                id,
                order_id,
                status,
                created_at,
                updated_at,
                reason,
                admin_notes,
                orders!inner(
                  id,
                  order_number,
                  status,
                  total_amount,
                  created_at,
                  user_id,
                  supplier_id
                )
              `)
              .order('created_at', { ascending: false });

            // Also get cancelled orders that need refunds (no existing refund request)
            const { data: cancelledOrders, error: cancelledError } = await supabase
              .from('orders')
              .select(`
                id,
                order_number,
                status,
                total_amount,
                created_at,
                user_id,
                supplier_id
              `)
              .eq('status', 'CANCELLED')
              .eq('payment_status', 'COMPLETED')
              .gt('total_amount', 0)
              .order('created_at', { ascending: false });

            // Filter out cancelled orders that already have refund requests
            const cancelledOrderIds = refundRequests?.map((req: any) => req.orders.id) || [];
            const cancelledOrdersNeedingRefunds = cancelledOrders?.filter((order: any) => 
              !cancelledOrderIds.includes(order.id)
            ) || [];

            if (refundError) {
              console.error('❌ Error fetching refund requests:', refundError);
            }
            
            if (cancelledError) {
              console.error('❌ Error fetching cancelled orders:', cancelledError);
            }

            // Combine refund requests and cancelled orders
            const allRefundOrders = [
              // Existing refund requests
              ...(refundRequests?.map((request: any) => ({
                ...request.orders,
                refund_request_id: request.id,
                refund_status: request.status,
                refund_reason: request.reason,
                admin_notes: request.admin_notes,
                refund_updated_at: request.updated_at,
                is_existing_refund: true
              })) || []),
              // Cancelled orders needing refunds
              ...(cancelledOrdersNeedingRefunds?.map((order: any) => ({
                ...order,
                refund_request_id: null,
                refund_status: 'NEEDS_REFUND',
                refund_reason: 'Order cancelled by supplier',
                admin_notes: null,
                refund_updated_at: null,
                is_existing_refund: false
              })) || [])
            ];

            // Get unique supplier IDs from all orders
            const supplierIds = Array.from(new Set(allRefundOrders.map((order: any) => order.supplier_id).filter(Boolean)));
            
            // If no supplier IDs found in orders, try to get them from order_items -> products
            if (supplierIds.length === 0) {
              console.log('🔍 No supplier IDs in orders, trying to get from order_items...');
              const orderIds = allRefundOrders.map((order: any) => order.id) || [];
              
              if (orderIds.length > 0) {
                const { data: orderItems, error: itemsError } = await supabase
                  .from('order_items')
                  .select(`
                    order_id,
                    products!inner(
                      supplier_id
                    )
                  `)
                  .in('order_id', orderIds);
                
                if (!itemsError && orderItems) {
                  const productSupplierIds = Array.from(new Set(orderItems.map((item: any) => item.products.supplier_id).filter(Boolean)));
                  supplierIds.push(...productSupplierIds);
                  console.log('🔍 Supplier IDs from order_items:', productSupplierIds);
                }
              }
            }
            
            // Fetch supplier data separately
            let suppliersData: any[] = [];
            if (supplierIds.length > 0) {
              const { data: suppliers, error: suppliersError } = await supabase
                .from('suppliers')
                .select('id, company_name, first_name, last_name, email')
                .in('id', supplierIds);
              
              if (suppliersError) {
                console.error('❌ Error fetching suppliers:', suppliersError);
              } else {
                suppliersData = suppliers || [];
                console.log('✅ Suppliers fetched:', suppliersData);
              }
            }

            // Transform all refund orders to match the expected format
            const formattedRefundOrders = allRefundOrders.map((order: any) => {
              // Try to find supplier by order supplier_id first, then by any supplier in our data
              let supplier = suppliersData.find(s => s.id === order.supplier_id);
              if (!supplier && suppliersData.length > 0) {
                // If no supplier found by order supplier_id, use the first available supplier
                supplier = suppliersData[0];
              }
              
              return {
                id: order.id,
                order_number: order.order_number,
                customer_name: 'Unknown Customer', // Will be populated separately
                total_amount: order.total_amount,
                status: order.status,
                created_at: order.created_at,
                supplier_id: order.supplier_id || (supplier?.id),
                supplier: supplier, // Add supplier information
                refund_request_id: order.refund_request_id,
                refund_status: order.refund_status,
                refund_reason: order.refund_reason,
                admin_notes: order.admin_notes,
                updated_at: order.refund_updated_at,
                is_existing_refund: order.is_existing_refund
              };
            });
            
            setRefundOrders(formattedRefundOrders);
            console.log('✅ All refund orders (requests + cancelled):', formattedRefundOrders);
          } catch (refundError) {
            console.error('❌ Error fetching refund requests:', refundError);
            // Don't fail the entire function for refund errors
          }
      
    } catch (err) {
      console.error('❌ Error in fetchDisputes:', err);
      setError('Failed to fetch disputes data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch disputes data on component mount
  useEffect(() => {
    fetchDisputes();
  }, []);

  // Filter disputes
  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter refund orders
  const filteredRefundOrders = refundOrders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier?.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Refund functions
  const handleViewRefundOrder = async (order: any) => {
    setSelectedRefundOrder(order);
    try {
      const eligibilityResult = await adminRefundService.checkRefundEligibility(order.id);
      setEligibility(eligibilityResult);
      
      if (eligibilityResult.suggestedRefundAmount) {
        setRefundAmount(eligibilityResult.suggestedRefundAmount.toString());
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedRefundOrder || !user?.id) return;

    setProcessingRefund(true);
    try {
      // Check if return record already exists for this order
      let returnId = selectedRefundOrder.refund_request_id;
      
      if (!returnId) {
        // Check if a return record already exists for this order
        const { data: existingReturn, error: checkError } = await supabase
          .from('returns')
          .select('id, status')
          .eq('order_id', selectedRefundOrder.id)
          .single();

        if (existingReturn) {
          returnId = existingReturn.id;
          console.log('✅ Found existing return record:', existingReturn);
        } else {
          // Create a new return record for cancelled orders
          const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          
          const { data: newReturn, error: createError } = await supabase
            .from('returns')
            .insert({
              return_number: returnNumber,
              order_id: selectedRefundOrder.id,
              customer_id: selectedRefundOrder.user_id,
              supplier_id: selectedRefundOrder.supplier_id,
              status: 'PROCESSED',
              return_type: 'REFUND',
              reason: refundReason || 'Order cancelled by supplier',
              requested_amount: parseFloat(refundAmount),
              approved_amount: parseFloat(refundAmount),
              refund_amount: parseFloat(refundAmount),
              admin_notes: refundNotes || 'Refund processed by admin for cancelled order',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (createError) {
            console.error('❌ Error creating return record:', createError);
            alert('Failed to create return record');
            return;
          }

          returnId = newReturn.id;
          console.log('✅ Created new return record:', newReturn);
        }
      }

      // Update return status to PROCESSED
      const { error: updateError } = await supabase
        .from('returns')
        .update({ 
          status: 'PROCESSED',
          updated_at: new Date().toISOString(),
          admin_notes: refundNotes || 'Refund processed by admin'
        })
        .eq('id', returnId);

      if (updateError) {
        console.error('❌ Error updating return status:', updateError);
        alert('Failed to process refund request');
        return;
      }

      // Check if refund record already exists for this order
      const { data: existingRefund, error: refundCheckError } = await supabase
        .from('refunds')
        .select('id, status')
        .eq('order_id', selectedRefundOrder.id)
        .single();

      if (existingRefund) {
        console.log('✅ Found existing refund record:', existingRefund);
        alert('Refund already processed! You can now approve it.');
        setSelectedRefundOrder(null);
        setRefundAmount('');
        setRefundReason('');
        setRefundNotes('');
        fetchDisputes(); // Refresh the list
        return;
      }

      // Create refund record in refunds table only if it doesn't exist
      const refundRequest: AdminRefundRequest = {
        orderId: selectedRefundOrder.id,
        refundAmount: parseFloat(refundAmount),
        reason: refundReason,
        refundType: eligibility?.refundType || 'FULL',
        processedBy: user.id,
        notes: refundNotes
      };

      const result = await adminRefundService.processAdminRefund(refundRequest);
      
      if (result.success) {
        alert('Refund processed successfully! You can now approve it.');
        setSelectedRefundOrder(null);
        setRefundAmount('');
        setRefundReason('');
        setRefundNotes('');
        fetchDisputes(); // Refresh the list
      } else {
        alert(`Refund failed: ${result.error}`);
      }
    } catch (error) {
      alert('Error processing refund. Please try again.');
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleApproveRefund = async (refundRequestId: string) => {
    if (!user?.id) return;
    
    const confirmed = confirm('Are you sure you want to approve this refund request? This will deduct the amount from the seller\'s earnings.');
    if (!confirmed) return;

    try {
      // Get refund request details to find the refund amount and supplier
      const { data: refundRequest, error: fetchError } = await supabase
        .from('returns')
        .select(`
          id,
          order_id,
          supplier_id,
          refund_amount,
          approved_amount
        `)
        .eq('id', refundRequestId)
        .single();

      if (fetchError || !refundRequest) {
        alert('Error fetching refund request details.');
        console.error('Error fetching refund request:', fetchError);
        return;
      }

      // Get order details separately
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, supplier_id, total_amount')
        .eq('id', refundRequest.order_id)
        .single();

      if (orderError || !order) {
        alert('Error fetching order details.');
        console.error('Error fetching order:', orderError);
        return;
      }

      let supplierId = order.supplier_id;

      // If supplier_id is null in orders table, try to get it from order_items -> products
      if (!supplierId) {
        console.log('🔍 No supplier_id in orders table, trying to get from order_items...');
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            products!inner(
              supplier_id
            )
          `)
          .eq('order_id', refundRequest.order_id)
          .limit(1);

        if (!itemsError && orderItems && orderItems.length > 0) {
          supplierId = orderItems[0].products.supplier_id;
          console.log('✅ Found supplier_id from order_items:', supplierId);
        }
      }

      const refundAmount = refundRequest.refund_amount || refundRequest.approved_amount || order.total_amount;

      if (!supplierId) {
        alert('Error: No supplier found for this refund request.');
        return;
      }

      // Update the return status to APPROVED
      const { error: updateError } = await supabase
        .from('returns')
        .update({ 
          status: 'APPROVED',
          updated_at: new Date().toISOString(),
          admin_notes: 'Approved by admin'
        })
        .eq('id', refundRequestId);

      if (updateError) {
        alert('Error approving refund request.');
        console.error('Error approving refund:', updateError);
        return;
      }

      // Use manual sync function to update refund status
      const { data: syncResult, error: syncError } = await supabase
        .rpc('manual_sync_refund_status', {
          p_order_id: refundRequest.order_id,
          p_admin_user_id: user.id
        });

      if (syncError) {
        console.error('Error syncing refund status:', syncError);
        alert('Refund approved but failed to sync refund status. Please check manually.');
      } else if (syncResult?.success) {
        console.log('✅ Successfully synced refund status:', syncResult);
      } else {
        console.log('ℹ️ No sync needed or no refund record found:', syncResult);
        
        // Fallback: Create refund record if it doesn't exist
        const { data: existingRefund } = await supabase
          .from('refunds')
          .select('id')
          .eq('order_id', refundRequest.order_id)
          .single();

        if (!existingRefund) {
          // Get order details for customer_id and supplier_id
          const { data: orderDetails } = await supabase
            .from('orders')
            .select('user_id, supplier_id')
            .eq('id', refundRequest.order_id)
            .single();

          const { error: refundCreateError } = await supabase
            .from('refunds')
            .insert({
              order_id: refundRequest.order_id,
              customer_id: orderDetails?.user_id,
              supplier_id: orderDetails?.supplier_id,
              amount: refundAmount,
              currency: 'NGN',
              status: 'COMPLETED',
              refund_reason: refundRequest.reason || 'Approved by admin',
              refund_method: 'ADMIN_APPROVED',
              processed_at: new Date().toISOString(),
              processed_by: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (refundCreateError) {
            console.error('Error creating refund record:', refundCreateError);
            alert('Refund approved but failed to create refund record. Please check manually.');
          } else {
            console.log('✅ Successfully created refund record with COMPLETED status');
          }
        }
      }

      // Deduct refund amount from seller earnings
      // For cancelled orders, we might not have a refunds table record yet, so use the return ID
      const deductionSuccess = await sellerEarningsService.deductRefund(
        supplierId,
        refundRequestId, // Use return ID instead of refund ID
        refundRequest.order_id,
        refundAmount,
        'NGN'
      );

      if (!deductionSuccess) {
        console.error('Failed to deduct refund from seller earnings');
        // Note: We don't fail the approval if deduction fails, but log it for manual review
        alert('Refund approved but failed to deduct from seller earnings. Please review manually.');
      } else {
        alert('Refund request approved successfully and deducted from seller earnings!');
      }

      fetchDisputes(); // Refresh the list
    } catch (error) {
      alert('Error approving refund request. Please try again.');
      console.error('Error approving refund:', error);
    }
  };

  const handleRejectRefund = async (refundRequestId: string) => {
    if (!user?.id) return;
    
    const reason = prompt('Please provide a reason for rejecting this refund request:');
    if (!reason) return;

    try {
      // Get refund request details to check if we need to reverse deductions
      const { data: refundRequest, error: fetchError } = await supabase
        .from('returns')
        .select(`
          id,
          order_id,
          orders!inner(
            id,
            supplier_id
          ),
          refunds!inner(
            id,
            amount
          )
        `)
        .eq('id', refundRequestId)
        .single();

      if (fetchError || !refundRequest) {
        alert('Error fetching refund request details.');
        console.error('Error fetching refund request:', fetchError);
        return;
      }

      const supplierId = refundRequest.orders.supplier_id;

      // Update the return status to REJECTED
      const { error: updateError } = await supabase
        .from('returns')
        .update({ 
          status: 'REJECTED',
          admin_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', refundRequestId);

      if (updateError) {
        alert('Error rejecting refund request.');
        console.error('Error rejecting refund:', updateError);
        return;
      }

      // Use manual sync function to update refund status
      const { data: syncResult, error: syncError } = await supabase
        .rpc('manual_sync_refund_status', {
          p_order_id: refundRequest.order_id,
          p_admin_user_id: user.id
        });

      if (syncError) {
        console.error('Error syncing refund status:', syncError);
        alert('Refund rejected but failed to sync refund status. Please check manually.');
      } else if (syncResult?.success) {
        console.log('✅ Successfully synced refund status:', syncResult);
      } else {
        console.log('ℹ️ No sync needed or no refund record found:', syncResult);
        
        // Fallback: Create refund record if it doesn't exist
        const { data: existingRefund } = await supabase
          .from('refunds')
          .select('id')
          .eq('order_id', refundRequest.order_id)
          .single();

        if (!existingRefund) {
          // Get order details for customer_id and supplier_id
          const { data: orderDetails } = await supabase
            .from('orders')
            .select('user_id, supplier_id')
            .eq('id', refundRequest.order_id)
            .single();

          const { error: refundCreateError } = await supabase
            .from('refunds')
            .insert({
              order_id: refundRequest.order_id,
              customer_id: orderDetails?.user_id,
              supplier_id: orderDetails?.supplier_id,
              amount: refundRequest.refund_amount || refundRequest.approved_amount || 0,
              currency: 'NGN',
              status: 'FAILED',
              refund_reason: reason,
              refund_method: 'ADMIN_REJECTED',
              admin_notes: reason,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (refundCreateError) {
            console.error('Error creating refund record:', refundCreateError);
            alert('Refund rejected but failed to create refund record. Please check manually.');
          } else {
            console.log('✅ Successfully created refund record with FAILED status');
          }
        }
      }

      // If refund was previously processed, reverse the deduction
      if (supplierId) {
        const reversalSuccess = await sellerEarningsService.reverseRefundDeduction(
          supplierId,
          refundRequest.refunds.id
        );

        if (!reversalSuccess) {
          console.warn('Failed to reverse refund deduction, but refund was rejected');
        }
      }

      alert('Refund request rejected successfully!');
      fetchDisputes(); // Refresh the list
    } catch (error) {
      alert('Error rejecting refund request. Please try again.');
      console.error('Error rejecting refund:', error);
    }
  };

  const statuses = ['all', 'open', 'in_review', 'resolved', 'rejected'];

  // Dispute status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in_review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Open dispute details modal
  const openDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowEvidence(false);
    setMessageInput('');
    setAttachment(null);
    setResolutionInput(dispute.resolution || '');
  };

  // Send message in chat
  const sendMessage = () => {
    if (!selectedDispute || !messageInput.trim()) return;
    const newMessage: { id: string; sender: 'admin' | 'customer' | 'supplier'; content: string; timestamp: string; attachments?: string[] } = {
      id: `m${Date.now()}`,
      sender: 'admin',
      content: messageInput,
      timestamp: new Date().toISOString(),
      attachments: attachment ? [attachment.name] : []
    };
    setDisputes(ds => ds.map(d =>
      d.id === selectedDispute.id
        ? { ...d, messages: [...d.messages, newMessage] }
        : d
    ));
    setMessageInput('');
    setAttachment(null);
  };

  // Attach evidence
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };



  // Save resolution
  const saveResolution = () => {
    if (!selectedDispute) return;
    setDisputes(ds => ds.map(d =>
      d.id === selectedDispute.id
        ? { ...d, resolution: resolutionInput, status: 'resolved', updatedAt: new Date().toISOString() }
        : d
    ));
    setSelectedDispute(prev => prev ? { ...prev, resolution: resolutionInput, status: 'resolved' } : prev);
  };

  // Update dispute status
  const updateDisputeStatus = async (disputeId: string, newStatus: 'open' | 'in_review' | 'resolved' | 'rejected') => {
    try {
      // Store dispute status in localStorage
      const disputeStatuses = JSON.parse(localStorage.getItem('disputeStatuses') || '{}');
      disputeStatuses[disputeId] = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('disputeStatuses', JSON.stringify(disputeStatuses));

      // If status is resolved, also update the corresponding refund request in the returns table
      if (newStatus === 'resolved') {
        try {
          // Find the return request for this order
          const { data: returnRequest, error: findError } = await supabase
            .from('returns')
            .select('id, status')
            .eq('order_id', disputeId)
            .eq('status', 'PENDING')
            .single();

          if (!findError && returnRequest) {
            // Update the return status to APPROVED (since admin resolved the dispute)
            const { error: updateError } = await supabase
              .from('returns')
              .update({ 
                status: 'APPROVED',
                updated_at: new Date().toISOString(),
                admin_notes: 'Dispute resolved by admin'
              })
              .eq('id', returnRequest.id);

            if (updateError) {
              console.error('Error updating return status:', updateError);
            } else {
              console.log('✅ Return status updated to APPROVED');
            }
          }
        } catch (error) {
          console.error('Error updating return status:', error);
        }
      }

      // Update local state
      const updatedDisputes = disputes.map(d => 
        d.id === disputeId ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d
      );
      setDisputes(updatedDisputes);
      
      // Update the selected dispute if it's currently open
      if (selectedDispute?.id === disputeId) {
        setSelectedDispute(updatedDisputes.find(d => d.id === disputeId) || null);
      }

      console.log(`✅ Dispute status updated to: ${newStatus}`);
      alert(`Dispute status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating dispute status:', error);
      alert('Failed to update dispute status. Please try again.');
    }
  };

  // Export disputes
  const exportToCSV = () => {
    const headers = [
      'Dispute ID',
      'Order Number',
      'Customer',
      'Supplier',
      'Reason',
      'Status',
      'Created',
      'Updated',
      'Resolution'
    ];
    const csvData = filteredDisputes.map(d => [
      d.id,
      d.orderNumber,
      d.customer.name,
      d.supplier.name,
      d.reason,
      d.status,
      new Date(d.createdAt).toLocaleDateString(),
      new Date(d.updatedAt).toLocaleDateString(),
      d.resolution || ''
    ]);
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `disputes_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading disputes...</p>
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
              onClick={() => fetchDisputes()} 
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disputes & Refunds</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage supplier-cancelled orders and process customer refund requests</p>
            </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchDisputes()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
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

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('disputes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'disputes'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Cancelled Orders ({filteredDisputes.length})
              </button>
            <button
              onClick={() => setActiveTab('refunds')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'refunds'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Refunds ({filteredRefundOrders.length})
            </button>
          </nav>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search cancelled orders by order number, customer, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Debug:</strong> Disputes loaded: {disputes.length} | Filtered: {filteredDisputes.length}
            </p>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'disputes' ? (
          /* Disputes Table */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDisputes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No disputes found</p>
                          <p className="text-sm">All orders are proceeding smoothly with no reported issues.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                  filteredDisputes.map((dispute, index) => (
                  <motion.tr
                    key={dispute.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{dispute.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{dispute.customer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{dispute.supplier.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{dispute.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                        {dispute.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(dispute.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                          onClick={() => openDispute(dispute)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {dispute.status !== 'resolved' && (
                          <>
                            <button
                              className="text-yellow-400 hover:text-yellow-600 p-1"
                              onClick={() => updateDisputeStatus(dispute.id, 'in_review')}
                              title="Mark as In Review"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              className="text-green-400 hover:text-green-600 p-1"
                              onClick={() => updateDisputeStatus(dispute.id, 'resolved')}
                              title="Mark as Resolved"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
          /* Refunds Table */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRefundOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No refund requests</p>
                          <p className="text-sm">No customers have submitted refund requests yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRefundOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{order.order_number}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          Customer
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {order.user_id || order.customer_id || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {order.supplier?.company_name || order.supplier?.first_name || 'Unknown Supplier'}
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {order.supplier_id || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.refund_status === 'NEEDS_REFUND'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : order.refund_status === 'PENDING' 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : order.refund_status === 'PROCESSED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : order.refund_status === 'APPROVED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : order.refund_status === 'REJECTED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {order.refund_status === 'NEEDS_REFUND' ? 'Needs Refund' : (order.refund_status || 'PENDING')}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewRefundOrder(order)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          {order.refund_status === 'NEEDS_REFUND' ? (
                            <button
                              onClick={() => handleViewRefundOrder(order)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Process Refund for Cancelled Order"
                            >
                              <Package className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApproveRefund(order.refund_request_id)}
                                className={`${
                                  order.refund_status === 'PROCESSED' 
                                    ? 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                }`}
                                title={order.refund_status === 'PROCESSED' ? 'Approve Refund' : 'Refund must be processed first'}
                                disabled={order.refund_status !== 'PROCESSED'}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectRefund(order.refund_request_id)}
                                className={`${
                                  order.refund_status === 'PENDING' 
                                    ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                }`}
                                title={order.refund_status === 'PENDING' ? 'Reject Refund' : 'Cannot reject processed/approved refunds'}
                                disabled={order.refund_status !== 'PENDING'}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dispute Details Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dispute Details</h2>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Dispute Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Order:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedDispute.orderNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Customer:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedDispute.customer.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Supplier:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedDispute.supplier.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Reason:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedDispute.reason}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDispute.status)}`}>{selectedDispute.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Updated:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{new Date(selectedDispute.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Order Total:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">₦{selectedDispute.orderTotal}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Order Status:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedDispute.orderStatus}</span>
                  </div>
                </div>

                {/* Evidence Section */}
                <div>
                  <button
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => setShowEvidence(e => !e)}
                  >
                    {showEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showEvidence ? 'Hide Evidence' : 'Show Evidence'}
                  </button>
                  {showEvidence && (
                    <div className="mt-2 space-y-2">
                      {selectedDispute.evidence.length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400 text-sm">No evidence attached.</div>
                      ) : (
                        selectedDispute.evidence.map((ev, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-200">{ev}</span>
                          </div>
                        ))
                      )}
                      <div className="mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <UploadCloud className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-200">Attach Evidence</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleAttachment}
                          />
                        </label>
                        {attachment && (
                          <div className="text-xs text-gray-500 mt-1">Selected: {attachment.name}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Section */}
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">Dispute Chat</div>
                  <div className="space-y-3 max-h-48 overflow-y-auto mb-2">
                    {selectedDispute.messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-3 py-2 max-w-xs ${
                          msg.sender === 'admin' ? 'bg-red-600 text-white' : msg.sender === 'customer' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200' : 'bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-200'
                        }`}>
                          <div className="text-xs font-semibold mb-1">{msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)}</div>
                          <div className="text-sm">{msg.content}</div>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-1 flex gap-2">
                              {msg.attachments.map((a, i) => (
                                <span key={i} className="inline-flex items-center gap-1 text-xs text-gray-200 bg-gray-700 rounded px-2 py-0.5">
                                  <Paperclip className="w-3 h-3" /> {a}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-200 mt-1 text-right">{new Date(msg.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>

                {/* Resolution Section */}
                <div className="mt-6">
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">Resolution</div>
                  <textarea
                    value={resolutionInput}
                    onChange={e => setResolutionInput(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Describe the resolution..."
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={saveResolution}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Mark as Resolved
                    </button>
                    <button
                      onClick={() => updateDisputeStatus(selectedDispute.id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <FileX2 className="w-4 h-4" />
                      Reject Dispute
                    </button>
                    <button
                      onClick={() => updateDisputeStatus(selectedDispute.id, 'in_review')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <FileWarning className="w-4 h-4" />
                      Mark In Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {selectedRefundOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Process Refund - {selectedRefundOrder.order_number}
                </h3>
                
                {eligibility && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Refund Eligibility</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Can Refund:</span> {eligibility.canRefund ? 'Yes' : 'No'}</p>
                      {eligibility.reason && (
                        <p><span className="font-medium">Reason:</span> {eligibility.reason}</p>
                      )}
                      {eligibility.maxRefundAmount && (
                        <p><span className="font-medium">Max Amount:</span> {formatCurrency(eligibility.maxRefundAmount)}</p>
                      )}
                      {eligibility.suggestedRefundAmount && (
                        <p><span className="font-medium">Suggested Amount:</span> {formatCurrency(eligibility.suggestedRefundAmount)}</p>
                      )}
                      {eligibility.refundType && (
                        <p><span className="font-medium">Refund Type:</span> {eligibility.refundType}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Refund Amount
                    </label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter refund amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Refund Reason
                    </label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Enter reason for refund"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={refundNotes}
                      onChange={(e) => setRefundNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={2}
                      placeholder="Internal notes about this refund"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setSelectedRefundOrder(null)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessRefund}
                    disabled={processingRefund || !eligibility?.canRefund}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingRefund ? 'Processing...' : 'Process Refund'}
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