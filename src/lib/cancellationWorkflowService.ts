import { supabase } from './auth';

export interface CancellationWorkflowResult {
  success: boolean;
  error?: string;
  refundProcessed?: boolean;
  inventoryRestored?: boolean;
  notificationsSent?: boolean;
}

export interface InventoryRestoration {
  productId: string;
  quantity: number;
  restored: boolean;
}

export interface RefundRequest {
  orderId: string;
  amount: number;
  reason: string;
  requestedBy: string;
}

class CancellationWorkflowService {
  /**
   * Execute complete post-cancellation workflow
   */
  async executeCancellationWorkflow(
    order: any,
    cancellationReason: string,
    cancelledBy: string
  ): Promise<CancellationWorkflowResult> {
    const result: CancellationWorkflowResult = {
      success: true,
      refundProcessed: false,
      inventoryRestored: false,
      notificationsSent: false
    };

    try {
      // 1. Process refund if payment was made
      if (order.payment_status === 'COMPLETED' && order.total_amount > 0) {
        const refundResult = await this.processRefund({
          orderId: order.id,
          amount: order.total_amount,
          reason: cancellationReason,
          requestedBy: cancelledBy
        });

        result.refundProcessed = refundResult.success;
        if (!refundResult.success) {
          result.error = `Refund processing failed: ${refundResult.error}`;
          // Don't fail the entire workflow for refund issues
        }
      }

      // 2. Restore inventory
      if (order.items && order.items.length > 0) {
        const inventoryResult = await this.restoreInventory(order.items);
        result.inventoryRestored = inventoryResult.every(item => item.restored);
        
        if (!result.inventoryRestored) {
          const failedItems = inventoryResult.filter(item => !item.restored);
          console.warn('Some inventory items could not be restored:', failedItems);
          // Don't fail the entire workflow for inventory issues
        }
      }

      // 3. Update shipping status if order was shipped
      if (order.status === 'SHIPPED' && order.tracking_number) {
        await this.updateShippingStatus(order.tracking_number, 'CANCELLED');
      }

      // 4. Send notifications
      const notificationResult = await this.sendCancellationNotifications(order, cancellationReason);
      result.notificationsSent = notificationResult.success;
      
      if (!notificationResult.success) {
        console.warn('Notification sending failed:', notificationResult.error);
        // Don't fail the entire workflow for notification issues
      }

      return result;

    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : 'Unknown error occurred';
      return result;
    }
  }

  /**
   * Process refund for cancelled order
   */
  private async processRefund(refundRequest: RefundRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if refund already exists
      const { data: existingRefund, error: checkError } = await supabase
        .from('refunds')
        .select('id')
        .eq('order_id', refundRequest.orderId)
        .single();

      if (existingRefund) {
        return { success: true }; // Refund already processed
      }

      // Create refund record
      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .insert({
          order_id: refundRequest.orderId,
          amount: refundRequest.amount,
          currency: 'NGN',
          status: 'PENDING',
          refund_reason: refundRequest.reason,
          refund_method: 'ADMIN_PROCESSED',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (refundError) {
        return { success: false, error: refundError.message };
      }

      // Also create a returns record so admin can manage it through the disputes page
      const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Get order details to extract customer_id and supplier_id
      const { data: orderData } = await supabase
        .from('orders')
        .select('user_id, supplier_id')
        .eq('id', refundRequest.orderId)
        .single();

      const { data: returnRecord, error: returnError } = await supabase
        .from('returns')
        .insert({
          order_id: refundRequest.orderId,
          customer_id: orderData?.user_id,
          supplier_id: orderData?.supplier_id,
          return_number: returnNumber,
          return_type: 'REFUND',
          status: 'PENDING',
          reason: refundRequest.reason,
          description: `Order cancelled: ${refundRequest.reason}`,
          requested_amount: refundRequest.amount,
          customer_notes: `Cancelled by ${refundRequest.requestedBy}`,
          return_shipping_address: null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (returnError) {
        console.warn('Failed to create return record for cancelled order:', returnError);
        // Don't fail the refund creation if return creation fails
      } else {
        // Link the refund to the return record
        await supabase
          .from('refunds')
          .update({ return_id: returnRecord.id })
          .eq('id', refund.id);
      }

      // TODO: Integrate with payment gateway (Paystack) for actual refund
      // For now, we'll mark it as pending for manual processing
      console.log(`Refund created for order ${refundRequest.orderId}: ${refundRequest.amount} NGN`);

      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown refund error' 
      };
    }
  }

  /**
   * Restore inventory for cancelled order items
   */
  private async restoreInventory(orderItems: any[]): Promise<InventoryRestoration[]> {
    const results: InventoryRestoration[] = [];

    for (const item of orderItems) {
      try {
        // Get current product inventory
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, stock_quantity')
          .eq('id', item.product_id)
          .single();

        if (productError || !product) {
          results.push({
            productId: item.product_id,
            quantity: item.quantity,
            restored: false
          });
          continue;
        }

        // Restore stock quantity
        const { error: updateError } = await supabase
          .from('products')
          .update({
            stock_quantity: (product.stock_quantity || 0) + item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product_id);

        results.push({
          productId: item.product_id,
          quantity: item.quantity,
          restored: !updateError
        });

        if (updateError) {
          console.error(`Failed to restore inventory for product ${item.product_id}:`, updateError);
        }

      } catch (error) {
        results.push({
          productId: item.product_id,
          quantity: item.quantity,
          restored: false
        });
        console.error(`Error restoring inventory for product ${item.product_id}:`, error);
      }
    }

    return results;
  }

  /**
   * Update shipping status for cancelled orders
   */
  private async updateShippingStatus(trackingNumber: string, status: string): Promise<void> {
    try {
      // Update delivery updates table if it exists
      const { error } = await supabase
        .from('delivery_updates')
        .insert({
          tracking_number: trackingNumber,
          status: status.toLowerCase(),
          description: `Order cancelled - ${status}`,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.warn('Failed to update shipping status:', error);
      }

    } catch (error) {
      console.warn('Error updating shipping status:', error);
    }
  }

  /**
   * Send cancellation notifications
   */
  private async sendCancellationNotifications(
    order: any, 
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create notification records for customer and supplier
      const notifications = [
        {
          user_id: order.user_id,
          type: 'order_cancelled',
          title: 'Order Cancelled',
          message: `Your order ${order.order_number} has been cancelled. Reason: ${reason}`,
          data: {
            order_id: order.id,
            order_number: order.order_number,
            cancellation_reason: reason
          }
        },
        {
          user_id: order.supplier_id,
          type: 'order_cancelled',
          title: 'Order Cancelled',
          message: `Order ${order.order_number} has been cancelled. Reason: ${reason}`,
          data: {
            order_id: order.id,
            order_number: order.order_number,
            cancellation_reason: reason
          }
        }
      ];

      // Insert notifications (if notifications table exists)
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.warn('Failed to create notifications:', error);
        // Don't fail the workflow for notification issues
      }

      // TODO: Send email notifications
      // TODO: Send SMS notifications if phone numbers are available

      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown notification error' 
      };
    }
  }

  /**
   * Get cancellation workflow status for an order
   */
  async getCancellationWorkflowStatus(orderId: string): Promise<{
    refundStatus?: string;
    inventoryRestored?: boolean;
    notificationsSent?: boolean;
  }> {
    try {
      const result: any = {};

      // Check refund status
      const { data: refund } = await supabase
        .from('refunds')
        .select('status')
        .eq('order_id', orderId)
        .single();

      if (refund) {
        result.refundStatus = refund.status;
      }

      // Check if inventory was restored (this would require additional tracking)
      // For now, we'll assume it was restored if refund exists
      result.inventoryRestored = !!refund;

      // Check notifications (if notifications table exists)
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('data->order_id', orderId)
        .eq('type', 'order_cancelled')
        .limit(1);

      result.notificationsSent = !!notifications?.length;

      return result;

    } catch (error) {
      console.error('Error getting cancellation workflow status:', error);
      return {};
    }
  }
}

export const cancellationWorkflowService = new CancellationWorkflowService();



