import { supabase } from './auth';

export interface AdminRefundRequest {
  orderId: string;
  refundAmount: number;
  reason: string;
  refundType: 'FULL' | 'PARTIAL';
  processedBy: string;
  notes?: string;
}

export interface AdminRefundResult {
  success: boolean;
  error?: string;
  refundId?: string;
  refundStatus?: string;
}

export interface OrderRefundEligibility {
  canRefund: boolean;
  reason?: string;
  maxRefundAmount?: number;
  suggestedRefundAmount?: number;
  refundType?: 'FULL' | 'PARTIAL';
}

class AdminRefundService {
  /**
   * Check if an order is eligible for admin refund
   */
  async checkRefundEligibility(orderId: string): Promise<OrderRefundEligibility> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return { canRefund: false, reason: 'Order not found' };
      }

      // Check if order is in a refundable status
      if (order.status === 'CANCELLED') {
        // Allow refunds for cancelled orders if payment was made
        if (order.payment_status === 'COMPLETED' && order.total_amount > 0) {
          return { 
            canRefund: true, 
            reason: 'Order cancelled - refund required',
            maxRefundAmount: order.total_amount,
            suggestedRefundAmount: order.total_amount,
            refundType: 'FULL'
          };
        } else {
          return { canRefund: false, reason: 'Cancelled order has no payment to refund' };
        }
      }

      if (order.status === 'PENDING') {
        return { canRefund: false, reason: 'Cannot refund pending orders. Cancel instead.' };
      }

      if (order.status === 'PROCESSING') {
        return { canRefund: false, reason: 'Cannot refund processing orders. Cancel instead.' };
      }

      // Check if payment was completed
      if (order.payment_status !== 'COMPLETED') {
        return { canRefund: false, reason: 'No payment to refund' };
      }

      // Check if refund already exists
      const { data: existingRefund } = await supabase
        .from('refunds')
        .select('id, amount, status')
        .eq('order_id', orderId)
        .single();

      if (existingRefund) {
        if (existingRefund.status === 'COMPLETED') {
          return { canRefund: false, reason: 'Refund already processed' };
        }
        return { 
          canRefund: true, 
          reason: 'Refund already initiated',
          maxRefundAmount: order.total_amount - (existingRefund.amount || 0),
          suggestedRefundAmount: order.total_amount - (existingRefund.amount || 0),
          refundType: 'PARTIAL'
        };
      }

      // Determine refund amount based on order status
      let suggestedAmount = order.total_amount;
      let refundType: 'FULL' | 'PARTIAL' = 'FULL';

      if (order.status === 'SHIPPED') {
        // For shipped orders, consider shipping costs
        suggestedAmount = order.total_amount - (order.shipping_amount || 0);
        refundType = 'PARTIAL';
      } else if (order.status === 'DELIVERED') {
        // For delivered orders, consider restocking fees
        suggestedAmount = order.total_amount * 0.85; // 15% restocking fee
        refundType = 'PARTIAL';
      }

      return {
        canRefund: true,
        maxRefundAmount: order.total_amount,
        suggestedRefundAmount: suggestedAmount,
        refundType
      };

    } catch (error) {
      return { 
        canRefund: false, 
        reason: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Process admin refund for shipped/delivered orders
   */
  async processAdminRefund(refundRequest: AdminRefundRequest): Promise<AdminRefundResult> {
    try {
      // Check eligibility first
      const eligibility = await this.checkRefundEligibility(refundRequest.orderId);
      
      if (!eligibility.canRefund) {
        return { success: false, error: eligibility.reason };
      }

      // Validate refund amount
      if (refundRequest.refundAmount <= 0) {
        return { success: false, error: 'Refund amount must be greater than 0' };
      }

      if (eligibility.maxRefundAmount && refundRequest.refundAmount > eligibility.maxRefundAmount) {
        return { 
          success: false, 
          error: `Refund amount cannot exceed ${eligibility.maxRefundAmount}` 
        };
      }

      // Generate unique refund number
      const refundNumber = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Get order details to extract customer_id and supplier_id
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('user_id, supplier_id')
        .eq('id', refundRequest.orderId)
        .single();

      if (orderError || !order) {
        return { success: false, error: 'Order not found' };
      }

      // Validate processed_by user exists (if provided)
      let processedByUserId = null;
      if (refundRequest.processedBy) {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', refundRequest.processedBy)
          .single();
        
        if (!userError && user) {
          processedByUserId = user.id;
        } else {
          console.warn('Processed by user not found, setting to null');
        }
      }

      // Create refund record
      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .insert({
          refund_number: refundNumber,
          order_id: refundRequest.orderId,
          customer_id: order.user_id,
          supplier_id: order.supplier_id,
          amount: refundRequest.refundAmount,
          currency: 'NGN',
          status: 'PENDING',
          refund_reason: refundRequest.reason,
          refund_method: 'ADMIN_PROCESSED',
          admin_notes: refundRequest.notes,
          processed_by: processedByUserId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (refundError) {
        return { success: false, error: refundError.message };
      }

      // Update order status to REFUNDED if full refund
      if (refundRequest.refundType === 'FULL') {
        await supabase
          .from('orders')
          .update({ 
            status: 'REFUNDED',
            updated_at: new Date().toISOString()
          })
          .eq('id', refundRequest.orderId);
      }

      // TODO: Integrate with payment gateway for actual refund
      // For now, mark as pending for manual processing
      console.log(`Admin refund created for order ${refundRequest.orderId}: ${refundRequest.refundAmount} NGN`);

      return { 
        success: true, 
        refundId: refund.id, 
        refundStatus: refund.status 
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get refund history for an order
   */
  async getOrderRefundHistory(orderId: string): Promise<{
    refunds: any[];
    totalRefunded: number;
    remainingAmount: number;
  }> {
    try {
      // Get order total
      const { data: order } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('id', orderId)
        .single();

      // Get all refunds for the order
      const { data: refunds, error } = await supabase
        .from('refunds')
        .select(`
          *,
          processed_by_user:users(id, email, first_name, last_name)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const totalRefunded = refunds?.reduce((sum: number, refund: any) => sum + refund.amount, 0) || 0;
      const remainingAmount = (order?.total_amount || 0) - totalRefunded;

      return {
        refunds: refunds || [],
        totalRefunded,
        remainingAmount
      };

    } catch (error) {
      console.error('Error getting refund history:', error);
      return {
        refunds: [],
        totalRefunded: 0,
        remainingAmount: 0
      };
    }
  }

  /**
   * Update refund status (for payment gateway integration)
   */
  async updateRefundStatus(refundId: string, status: 'COMPLETED' | 'FAILED', paymentReference?: string): Promise<AdminRefundResult> {
    try {
      const { data, error } = await supabase
        .from('refunds')
        .update({
          status,
          payment_reference: paymentReference,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', refundId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        refundId: data.id, 
        refundStatus: data.status 
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get orders eligible for admin refund
   */
  async getRefundEligibleOrders(): Promise<{
    shippedOrders: any[];
    deliveredOrders: any[];
  }> {
    try {
      // Get shipped orders
      const { data: shippedOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'SHIPPED')
        .order('created_at', { ascending: false });

      // Get delivered orders
      const { data: deliveredOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'DELIVERED')
        .order('created_at', { ascending: false });

      return {
        shippedOrders: shippedOrders || [],
        deliveredOrders: deliveredOrders || []
      };

    } catch (error) {
      console.error('Error getting refund eligible orders:', error);
      return {
        shippedOrders: [],
        deliveredOrders: []
      };
    }
  }
}

export const adminRefundService = new AdminRefundService();
