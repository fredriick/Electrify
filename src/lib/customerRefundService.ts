import { supabase } from './auth';

export interface RefundRequest {
  orderId: string;
  returnType: 'REFUND' | 'EXCHANGE' | 'REPLACEMENT';
  reason: string;
  description?: string;
  requestedAmount: number;
  customerNotes?: string;
}

export interface ReturnItem {
  orderItemId: string;
  quantity: number;
  returnReason: string;
  conditionDescription?: string;
}

export interface RefundEligibility {
  canRequestRefund: boolean;
  reason?: string;
  maxRefundAmount?: number;
  orderStatus: string;
  paymentStatus: string;
  eligibleItems?: any[];
}

class CustomerRefundService {
  /**
   * Check if an order is eligible for refund request
   */
  async checkRefundEligibility(orderId: string): Promise<RefundEligibility> {
    try {
      const { data: order, error } = await supabase
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

      if (error || !order) {
        return { 
          canRequestRefund: false, 
          reason: 'Order not found', 
          orderStatus: 'N/A', 
          paymentStatus: 'N/A' 
        };
      }

      // Check if order is eligible for refund
      if (order.payment_status !== 'COMPLETED' && order.payment_status !== 'completed') {
        return { 
          canRequestRefund: false, 
          reason: 'Payment not completed for this order', 
          orderStatus: order.status, 
          paymentStatus: order.payment_status 
        };
      }

      if (order.status === 'CANCELLED' || order.status === 'cancelled') {
        return { 
          canRequestRefund: false, 
          reason: 'Order is cancelled. Refund should have been processed automatically.', 
          orderStatus: order.status, 
          paymentStatus: order.payment_status 
        };
      }

      // Only allow refund requests for delivered orders (not shipped)
      if (order.status !== 'DELIVERED' && order.status !== 'delivered') {
        return { 
          canRequestRefund: false, 
          reason: 'Can only request refunds for delivered orders', 
          orderStatus: order.status, 
          paymentStatus: order.payment_status 
        };
      }

      // Check if order is within 7 days of creation (refund window)
      const orderDate = new Date(order.created_at);
      const currentDate = new Date();
      const daysDifference = Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference > 7) {
        return { 
          canRequestRefund: false, 
          reason: `Refund window has expired. Orders can only be refunded within 7 days of purchase (${daysDifference} days ago)`, 
          orderStatus: order.status, 
          paymentStatus: order.payment_status 
        };
      }

      // Check if there's already any return for this order (pending, approved, completed, etc.)
      let existingReturn = null;
      try {
        const { data } = await supabase
          .from('returns')
          .select('id, status')
          .eq('order_id', orderId)
          .single();
        existingReturn = data;
      } catch (error) {
        // Table might not exist yet or no return found - that's okay
      }

      if (existingReturn) {
        // Check the status of the existing return
        switch (existingReturn.status) {
          case 'PENDING':
            return { 
              canRequestRefund: false, 
              reason: 'A refund request is already pending for this order', 
              orderStatus: order.status, 
              paymentStatus: order.payment_status 
            };
          case 'APPROVED':
            return { 
              canRequestRefund: false, 
              reason: 'Refund has been approved and is being processed', 
              orderStatus: order.status, 
              paymentStatus: order.payment_status 
            };
          case 'COMPLETED':
            return { 
              canRequestRefund: false, 
              reason: 'Refund has been completed', 
              orderStatus: order.status, 
              paymentStatus: order.payment_status 
            };
          case 'REJECTED':
            // Allow new refund request if previous was rejected
            break;
          default:
            return { 
              canRequestRefund: false, 
              reason: 'A refund request already exists for this order', 
              orderStatus: order.status, 
              paymentStatus: order.payment_status 
            };
        }
      }

      return {
        canRequestRefund: true,
        maxRefundAmount: order.total_amount,
        orderStatus: order.status,
        paymentStatus: order.payment_status,
        eligibleItems: order.order_items || []
      };

    } catch (error: any) {
      console.error('Error checking refund eligibility:', error);
      return { 
        canRequestRefund: false, 
        reason: error.message || 'Unknown error', 
        orderStatus: 'N/A', 
        paymentStatus: 'N/A' 
      };
    }
  }

  /**
   * Submit a refund request
   */
  async submitRefundRequest(
    request: RefundRequest, 
    items: ReturnItem[], 
    customerId: string
  ): Promise<{ success: boolean; error?: string; returnId?: string }> {
    try {
      // First check eligibility
      const eligibility = await this.checkRefundEligibility(request.orderId);
      if (!eligibility.canRequestRefund) {
        return { success: false, error: eligibility.reason || 'Order not eligible for refund' };
      }

      // Generate return number
      const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Get supplier ID from the order
      const { data: orderData } = await supabase
        .from('orders')
        .select('supplier_id')
        .eq('id', request.orderId)
        .single();

      // Create return record
      const { data: returnRecord, error: returnError } = await supabase
        .from('returns')
        .insert({
          order_id: request.orderId,
          customer_id: customerId,
          supplier_id: orderData?.supplier_id, // Get from order
          return_number: returnNumber,
          return_type: request.returnType,
          status: 'PENDING',
          reason: request.reason,
          description: request.description,
          requested_amount: request.requestedAmount,
          customer_notes: request.customerNotes,
          return_shipping_address: null, // Will be provided later
        })
        .select()
        .single();

      if (returnError) {
        console.error('Error creating return record:', returnError);
        return { success: false, error: returnError.message };
      }

      // Create return items
      const returnItems = items.map(item => {
        const orderItem = eligibility.eligibleItems?.find(i => i.id === item.orderItemId);
        return {
          return_id: returnRecord.id,
          order_item_id: item.orderItemId,
          product_id: orderItem?.product_id,
          quantity: item.quantity,
          unit_price: orderItem?.unit_price || 0,
          total_price: (orderItem?.unit_price || 0) * item.quantity,
          return_reason: item.returnReason,
          condition_description: item.conditionDescription,
        };
      });

      const { error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems);

      if (itemsError) {
        console.error('Error creating return items:', itemsError);
        // Try to clean up the return record
        await supabase.from('returns').delete().eq('id', returnRecord.id);
        return { success: false, error: itemsError.message };
      }

      return { success: true, returnId: returnRecord.id };

    } catch (error: any) {
      console.error('Error submitting refund request:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Get customer's refund requests
   */
  async getCustomerRefundRequests(customerId: string): Promise<any[]> {
    try {
      const { data: returns, error } = await supabase
        .from('returns')
        .select(`
          *,
          order:orders(order_number, total_amount, status),
          return_items:return_items(
            *,
            order_item:order_items(unit_price, total_price)
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching refund requests:', error);
        return [];
      }

      return returns || [];

    } catch (error) {
      console.error('Error fetching refund requests:', error);
      return [];
    }
  }

  /**
   * Get refund request details
   */
  async getRefundRequestDetails(returnId: string): Promise<any> {
    try {
      const { data: returnRecord, error } = await supabase
        .from('returns')
        .select(`
          *,
          order:orders(*),
          return_items:return_items(
            *,
            order_item:order_items(unit_price, total_price, quantity)
          ),
          refunds:refunds(*)
        `)
        .eq('id', returnId)
        .single();

      if (error) {
        console.error('Error fetching refund request details:', error);
        return null;
      }

      return returnRecord;

    } catch (error) {
      console.error('Error fetching refund request details:', error);
      return null;
    }
  }
}

export const customerRefundService = new CustomerRefundService();
