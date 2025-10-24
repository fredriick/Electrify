import { supabase } from './auth';
import { cancellationWorkflowService } from './cancellationWorkflowService';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_id: string;
  supplier_id: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  shipping_address: string;
  billing_address: string;
  payment_status: string;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  // Enhanced cancellation metadata
  cancelled_at?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  items: OrderItem[];
  customer?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateOrderData {
  user_id: string;
  customer_id: string;
  supplier_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  shipping_address: string;
  billing_address: string;
  payment_status: string;
  tracking_number?: string;
  estimated_delivery?: string;
}

export const orderService = {
  // Get orders for a specific supplier
  async getOrders(supplierId: string): Promise<{ data: Order[] | null; error: any }> {
    try {
      
      // First, let's check if there are any orders at all
      const { data: allOrdersCheck, error: allOrdersError } = await supabase
        .from('orders')
        .select('id, supplier_id')
        .limit(10);
      
      
      // First, try to get orders directly by supplier_id
      const { data: directOrders, error: directError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name, image_url, supplier_id)
          )
        `)
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (directError) {
        // Error fetching orders by supplier_id
      }

      

      // If we found orders directly, use them
      if (directOrders && directOrders.length > 0) {
        
        
        // Get customer information and refund status for each order
        const ordersWithCustomers = await Promise.all(
          directOrders.map(async (order: any) => {
            const { data: customer } = await supabase
              .from('customers')
              .select('id, email, first_name, last_name')
              .eq('id', order.customer_id)
              .single();

            // Check if this order has a refund
            const { data: refund } = await supabase
              .from('returns')
              .select('status')
              .eq('order_id', order.id)
              .single();

            let displayStatus = order.status;
            if (refund) {
              switch (refund.status) {
                case 'PENDING':
                  displayStatus = 'REFUND_PENDING';
                  break;
                case 'PROCESSED':
                  displayStatus = 'REFUND_PROCESSED';
                  break;
                case 'APPROVED':
                  displayStatus = 'REFUNDED';
                  break;
                case 'REJECTED':
                  displayStatus = 'REFUND_REJECTED';
                  break;
                default:
                  displayStatus = order.status;
              }
            }
            
            return {
              ...order,
              status: displayStatus,
              original_status: order.status,
              customer
            };
          })
        );
        
        return { data: ordersWithCustomers, error: null };
      }

      
      
      // Fallback: Get orders by finding products that belong to this supplier
      const { data: supplierProducts, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('supplier_id', supplierId);

      if (productsError) {
        return { data: null, error: productsError };
      }

      const supplierProductIds = supplierProducts?.map((p: any) => p.id) || [];

      if (supplierProductIds.length === 0) {
        return { data: [], error: null };
      }

      // Get all orders
      const { data: allOrders, error: allOrdersError2 } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name, image_url, supplier_id)
          )
        `)
        .order('created_at', { ascending: false });

      if (allOrdersError2) {
        return { data: null, error: allOrdersError2 };
      }

      

      // Filter orders that contain products from this supplier
      const filteredOrders = allOrders?.filter((order: any) => 
        order.items?.some((item: any) => 
          supplierProductIds.includes(item.product_id)
        )
      ) || [];

      
      // Batch refund detection (optimized approach)
      const orderIds = filteredOrders.map((order: any) => order.id);
      const refundedOrderIds = new Set<string>();
      const refundStatuses = new Map<string, string>();

      try {
        // Method 1: Batch check refunds table
        const refundStatusValues = ['approved', 'COMPLETED', 'APPROVED'];
        const refundColumns = ['status', 'refund_status'];

        for (const column of refundColumns) {
          for (const status of refundStatusValues) {
            const { data: refunds } = await supabase
              .from('refunds')
              .select('order_id, status')
              .in('order_id', orderIds)
              .eq(column, status);

            if (refunds) {
              refunds.forEach((refund: any) => {
                refundedOrderIds.add(refund.order_id);
                refundStatuses.set(refund.order_id, refund.status);
              });
            }
          }
        }

        // Method 2: Batch check returns table
        const { data: returns } = await supabase
          .from('returns')
          .select('order_id, status')
          .in('order_id', orderIds)
          .in('status', ['APPROVED', 'COMPLETED', 'PROCESSED']);

        if (returns) {
          returns.forEach((returnItem: any) => {
            refundedOrderIds.add(returnItem.order_id);
            refundStatuses.set(returnItem.order_id, returnItem.status);
          });
        }

        // Method 3: Check orders with REFUNDED status
        filteredOrders.forEach((order: any) => {
          if (order.status === 'REFUNDED') {
            refundedOrderIds.add(order.id);
            refundStatuses.set(order.id, 'REFUNDED');
          }
        });

      } catch (error) {
        // Error in batch refund detection - continue with empty refund set
      }

      // Get customer information and apply refund status
      const ordersWithCustomers = await Promise.all(
        filteredOrders.map(async (order: any) => {
          const { data: customer } = await supabase
            .from('customers')
            .select('id, email, first_name, last_name')
            .eq('id', order.customer_id)
            .single();

          const isRefunded = refundedOrderIds.has(order.id);
          const refundStatus = refundStatuses.get(order.id);

          let displayStatus = order.status;
          if (isRefunded) {
            switch (refundStatus) {
              case 'PENDING':
              case 'pending':
                displayStatus = 'REFUND_PENDING';
                break;
              case 'PROCESSED':
              case 'processed':
                displayStatus = 'REFUND_PROCESSED';
                break;
              case 'APPROVED':
              case 'approved':
              case 'COMPLETED':
              case 'completed':
                displayStatus = 'REFUNDED';
                break;
              case 'REJECTED':
              case 'rejected':
                displayStatus = 'REFUND_REJECTED';
                break;
              default:
                displayStatus = 'REFUNDED';
            }
          }
          
          return {
            ...order,
            status: displayStatus,
            original_status: order.status,
            customer
          };
        })
      );

      const refundedCount = refundedOrderIds.size;

      // Refund detection completed

      return { data: ordersWithCustomers, error: null };

    } catch (error) {
      return { data: null, error };
    }
  },

  // Create a new order
  async createOrder(orderData: CreateOrderData): Promise<{ data: Order | null; error: any }> {
    try {
      

      // Get supplier_id from the first product
      const { data: firstProduct, error: productError } = await supabase
        .from('products')
        .select('supplier_id')
        .eq('id', orderData.items[0].product_id)
        .single();

      if (productError || !firstProduct) {
        return { data: null, error: new Error('Could not find product or supplier') };
      }

      const supplierId = firstProduct.supplier_id;

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          supplier_id: supplierId
        })
        .select()
        .single();

      if (orderError) {
        return { data: null, error: orderError };
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        return { data: null, error: itemsError };
      }

      
      return { data: order, error: null };

    } catch (error) {
      return { data: null, error };
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<{ data: Order | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<{ data: Order | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name, image_url, supplier_id)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Process order (change status to PROCESSING)
  async processOrder(orderId: string): Promise<{ data: Order | null; error: any }> {
    try {
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'PROCESSING', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Ship order (change status to SHIPPED and add tracking info)
  async shipOrder(orderId: string, trackingNumber?: string, estimatedDelivery?: string): Promise<{ data: Order | null; error: any }> {
    try {
      
      const updateData: any = {
        status: 'SHIPPED',
        updated_at: new Date().toISOString()
      };

      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      if (estimatedDelivery) {
        updateData.estimated_delivery = estimatedDelivery;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Deliver order (change status to DELIVERED)
  async deliverOrder(orderId: string): Promise<{ data: Order | null; error: any }> {
    try {
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'DELIVERED', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get status label for display
  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'PENDING': 'Pending',
      'PROCESSING': 'Processing',
      'SHIPPED': 'Shipped',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled',
      'REFUNDED': 'Refunded'
    };
    return statusLabels[status] || status;
  },

  // Enhanced status display with cancellation context
  getEnhancedStatusLabel(order: Order): string {
    if (order.status !== 'CANCELLED') {
      return this.getStatusLabel(order.status);
    }

    // For cancelled orders, provide more context
    if (order.cancelled_at && order.tracking_number) {
      // Check if order was cancelled after shipping
      const cancelledDate = new Date(order.cancelled_at);
      const createdDate = new Date(order.created_at);
      
      // If cancelled more than 1 hour after creation, likely after shipping
      const timeDiff = cancelledDate.getTime() - createdDate.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff > 1) {
        return 'Cancelled (After Shipping)';
      }
    }

    return 'Cancelled';
  },

  // Check if order can be cancelled based on business rules
  canCancelOrder(order: Order): { canCancel: boolean; reason?: string } {
    const status = order.status?.toUpperCase();
    
    // Don't allow cancellation if already cancelled
    if (status === 'CANCELLED') {
      return { canCancel: false, reason: 'Order is already cancelled' };
    }

    // Don't allow cancellation after delivery
    if (status === 'DELIVERED') {
      return { canCancel: false, reason: 'Cannot cancel delivered orders. Please use returns/refunds.' };
    }

    // For shipped orders, require admin handling
    if (status === 'SHIPPED') {
      return { canCancel: false, reason: 'Cannot cancel shipped orders. Admin will handle refund process.' };
    }

    // Only allow cancellation for processing orders (updated business rule)
    if (status === 'PROCESSING') {
      return { canCancel: true };
    }

    // Don't allow cancellation for pending orders (updated business rule)
    if (status === 'PENDING') {
      return { canCancel: false, reason: 'Cannot cancel pending orders. Wait for order to be processed.' };
    }

    return { canCancel: false, reason: 'Order status does not allow cancellation' };
  },

  // Enhanced cancel order with metadata and validation
  async cancelOrder(orderId: string, reason: string, cancelledBy: string): Promise<{ data: Order | null; error: any }> {
    try {
      // First, get the current order to validate cancellation
      const { data: currentOrder, error: fetchError } = await this.getOrderById(orderId);
      
      if (fetchError || !currentOrder) {
        return { data: null, error: fetchError || new Error('Order not found') };
      }

      // Check if order can be cancelled
      const { canCancel, reason: cancelReason } = this.canCancelOrder(currentOrder);
      
      if (!canCancel) {
        return { data: null, error: new Error(cancelReason || 'Order cannot be cancelled') };
      }

      // Update order with cancellation metadata
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'CANCELLED',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          cancelled_by: cancelledBy,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Execute post-cancellation workflow
      try {
        const workflowResult = await cancellationWorkflowService.executeCancellationWorkflow(
          currentOrder,
          reason,
          cancelledBy
        );

        if (!workflowResult.success) {
          // Cancellation workflow completed with issues
          // Don't fail the cancellation for workflow issues
        }
      } catch (workflowError) {
        // Cancellation workflow failed
        // Don't fail the cancellation for workflow issues
      }

      // Fallback: Create notifications manually if database triggers fail
      try {
        await this.createCancellationNotifications(currentOrder, reason, cancelledBy);
      } catch (notificationError) {
        console.warn('Failed to create fallback cancellation notifications:', notificationError);
        // Don't fail the cancellation for notification issues
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Legacy cancel order method for backward compatibility
  async cancelOrderLegacy(orderId: string): Promise<{ data: Order | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'CANCELLED', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get order status history for audit trail
  async getOrderStatusHistory(orderId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select(`
          *,
          changed_by_user:users(id, email, first_name, last_name)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Fallback method to create cancellation notifications manually
  async createCancellationNotifications(order: any, reason: string, cancelledBy: string): Promise<void> {
    try {
      // Import notification service
      const { notificationService } = await import('./notificationService');
      
      // Get customer name
      const customerName = order.customer ? 
        `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || 
        order.customer.email : 'Customer';

      // Create notifications array
      const notifications = [];

      // Customer notification
      notifications.push({
        user_id: order.user_id,
        title: 'Order Cancelled',
        message: `Your order ${order.order_number} has been cancelled. Reason: ${reason}`,
        type: 'WARNING' as const,
        is_read: false,
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
          cancellation_reason: reason,
          fallback_notification: true
        }
      });

      // Get supplier ID from order items (since orders table doesn't have supplier_id directly)
      let supplierId = null;
      if (order.items && order.items.length > 0) {
        // Get supplier ID from the first product in the order
        const firstItem = order.items[0];
        if (firstItem.product && firstItem.product.supplier_id) {
          supplierId = firstItem.product.supplier_id;
        }
      }

      // Supplier notification - Different message based on who cancelled
      if (supplierId) {
        // Check if the supplier cancelled the order themselves
        const isSupplierCancellation = cancelledBy === supplierId;
        
        notifications.push({
          user_id: supplierId,
          title: isSupplierCancellation ? 'Order Cancellation Confirmed' : 'Order Cancelled',
          message: isSupplierCancellation 
            ? `You have successfully cancelled order ${order.order_number}. Reason: ${reason}`
            : `Order ${order.order_number} has been cancelled. Reason: ${reason}`,
          type: isSupplierCancellation ? 'SUCCESS' as const : 'WARNING' as const,
          is_read: false,
          metadata: {
            order_id: order.id,
            order_number: order.order_number,
            customer_name: customerName,
            cancellation_reason: reason,
            cancelled_by: cancelledBy,
            is_supplier_cancellation: isSupplierCancellation,
            fallback_notification: true
          }
        });
      }

      // Admin notifications
      try {
        const { data: admins, error: adminError } = await supabase
          .from('admins')
          .select('id');

        if (!adminError && admins && admins.length > 0) {
          // Determine who cancelled the order for admin notification
          const cancelledByUser = cancelledBy === order.user_id ? customerName : 
                                 cancelledBy === supplierId ? 'Supplier' : 
                                 'System';
          
          for (const admin of admins) {
            notifications.push({
              user_id: admin.id,
              title: 'Order Cancelled',
              message: `Order ${order.order_number} has been cancelled by ${cancelledByUser}. Reason: ${reason}`,
              type: 'WARNING' as const,
              is_read: false,
              metadata: {
                order_id: order.id,
                order_number: order.order_number,
                customer_name: customerName,
                supplier_name: supplierId ? 'Supplier' : 'Unknown',
                cancelled_by: cancelledBy,
                cancelled_by_user: cancelledByUser,
                cancellation_reason: reason,
                fallback_notification: true
              }
            });
          }
        }
      } catch (adminError) {
        console.warn('Failed to fetch admins for notification:', adminError);
      }

      // Create notifications
      for (const notification of notifications) {
        await notificationService.createNotification(notification);
      }

    } catch (error) {
      console.error('Error creating fallback cancellation notifications:', error);
      throw error;
    }
  }
};