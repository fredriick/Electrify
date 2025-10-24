import { supabase } from './auth';

export interface ReturnItem {
  id: string;
  return_id: string;
  order_item_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  return_reason?: string;
  condition_description?: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

export interface Return {
  id: string;
  order_id: string;
  customer_id: string;
  supplier_id: string;
  return_number: string;
  return_type: 'REFUND' | 'EXCHANGE' | 'REPLACEMENT';
  status: 'PENDING' | 'PROCESSED' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  description?: string;
  requested_amount: number;
  approved_amount?: number;
  refund_amount?: number;
  return_shipping_address?: any;
  return_tracking_number?: string;
  return_carrier?: string;
  expected_return_date?: string;
  actual_return_date?: string;
  admin_notes?: string;
  customer_notes?: string;
  created_at: string;
  updated_at: string;
  items?: ReturnItem[];
  customer?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  order?: {
    id: string;
    order_number: string;
    total_amount: number;
  };
}

export interface Refund {
  id: string;
  return_id: string;
  order_id: string;
  customer_id: string;
  supplier_id: string;
  refund_number: string;
  amount: number;
  currency: string;
  payment_gateway?: string;
  payment_reference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  refund_method?: string;
  refund_reason?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

class ReturnsService {
  async getReturns(supplierId: string): Promise<Return[]> {
    const supabaseClient = supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Fetching returns for supplier
      
      // First, let's check if there are any returns at all
      const { data: allReturns, error: allError } = await supabaseClient
        .from('returns')
        .select('id, supplier_id, customer_id, order_id')
        .limit(5);
      
      // All returns in database
      if (allError) {
        // Error fetching all returns
      }
      
      // Let's see the details of the existing return and fix it if needed
      if (allReturns && allReturns.length > 0) {
        // Existing return details
        
        // If the return has NULL supplier_id, try to fix it
        const returnWithNullSupplier = allReturns.find((r: any) => !r.supplier_id);
        if (returnWithNullSupplier) {
          // Found return with NULL supplier_id, attempting to fix
          
          // Get the order for this return
          const { data: orderData } = await supabaseClient
            .from('orders')
            .select('id')
            .eq('id', returnWithNullSupplier.order_id)
            .single();
          
          if (orderData) {
            // Find the supplier from order_items via products
            const { data: orderItemData } = await supabaseClient
              .from('order_items')
              .select(`
                product_id,
                product:products(supplier_id)
              `)
              .eq('order_id', orderData.id)
              .limit(1)
              .single();
            
            if (orderItemData && orderItemData.product && orderItemData.product.supplier_id) {
              // Updating return supplier_id
              
              // Update the return with the correct supplier_id
              const { error: updateError } = await supabaseClient
                .from('returns')
                .update({ supplier_id: orderItemData.product.supplier_id })
                .eq('id', returnWithNullSupplier.id);
              
              if (updateError) {
                // Error updating return supplier_id
              } else {
                // Successfully updated return supplier_id
              }
            }
          }
        }
      }
      
      // Check if supplier has any orders with supplier_id
      const { data: supplierOrders, error: ordersError } = await supabaseClient
        .from('orders')
        .select('id, supplier_id, order_number')
        .eq('supplier_id', supplierId)
        .limit(3);
      
      // Supplier orders
      if (ordersError) {
        // Error fetching supplier orders
      }
      
      // Now try the supplier-specific query
      // First try direct supplier_id match
      let { data: returns, error } = await supabaseClient
        .from('returns')
        .select(`
          *,
          items:return_items(
            *,
            product:products(id, name, image_url)
          )
        `)
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      // If no returns found, try to find returns for orders that belong to this supplier
      // (fallback for when supplier_id is NULL in orders table)
      if ((!returns || returns.length === 0)) {
        // No direct returns found, checking orders via products
        
        // Find all orders that have products from this supplier
        // We need to go through products table since order_items doesn't have supplier_id
        const { data: supplierProducts, error: productsError } = await supabaseClient
          .from('products')
          .select('id')
          .eq('supplier_id', supplierId);
        
        if (productsError) {
          // Error fetching supplier products
        } else if (supplierProducts && supplierProducts.length > 0) {
          const productIds = supplierProducts.map((p: any) => p.id);
          // Found supplier products
          
          // Find order_items for these products
          const { data: supplierOrderItems, error: orderItemsError } = await supabaseClient
            .from('order_items')
            .select('order_id')
            .in('product_id', productIds);
          
          if (orderItemsError) {
            // Error fetching supplier order items
          } else if (supplierOrderItems && supplierOrderItems.length > 0) {
            const orderIds = Array.from(new Set(supplierOrderItems.map((item: any) => item.order_id)));
            // Found orders via products
            
            const { data: fallbackReturns, error: fallbackError } = await supabaseClient
              .from('returns')
              .select(`
                *,
                items:return_items(
                  *,
                  product:products(id, name, image_url)
                )
              `)
              .in('order_id', orderIds)
              .order('created_at', { ascending: false });
            
            if (fallbackError) {
              // Error fetching fallback returns
            } else {
              // Fallback returns found
              returns = fallbackReturns;
            }
          }
        }
      }

      if (error) {
        // Error fetching supplier returns
        return [];
      }

      // Supplier returns data

      // Get customer and order information for each return
      const returnsWithDetails = await Promise.all(
        (returns || []).map(async (returnItem: any) => {
          try {
            // Get customer info from users table
            const { data: customer } = await supabaseClient
              .from('users')
              .select('id, email, first_name, last_name')
              .eq('id', returnItem.customer_id)
              .single();

            // Get order info
            const { data: order } = await supabaseClient
              .from('orders')
              .select('id, order_number, total_amount')
              .eq('id', returnItem.order_id)
              .single();

            return {
              ...returnItem,
              customer: customer || null,
              order: order || null
            };
          } catch (error) {
            // Error fetching details for return
            return {
              ...returnItem,
              customer: null,
              order: null
            };
          }
        })
      );

      // Returns with details
      return returnsWithDetails;
    } catch (error) {
      // Error fetching returns
      return [];
    }
  }

  async getReturn(returnId: string): Promise<Return | null> {
    const supabaseClient = supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data: returnItem, error } = await supabaseClient
        .from('returns')
        .select(`
          *,
          items:return_items(
            *,
            product:products(id, name, image_url)
          )
        `)
        .eq('id', returnId)
        .single();

      if (error) {
        // Error fetching return
        return null;
      }

      if (!returnItem) return null;

      // Get customer and order information
      try {
        const { data: customer } = await supabaseClient
          .from('users')
          .select('id, email, first_name, last_name')
          .eq('id', returnItem.customer_id)
          .single();

        const { data: order } = await supabaseClient
          .from('orders')
          .select('id, order_number, total_amount')
          .eq('id', returnItem.order_id)
          .single();

        return {
          ...returnItem,
          customer: customer || null,
          order: order || null
        };
      } catch (detailsError) {
        // Error fetching return details
        return {
          ...returnItem,
          customer: null,
          order: null
        };
      }
    } catch (error) {
      // Error fetching return
      return null;
    }
  }

  async updateReturnStatus(returnId: string, status: Return['status']): Promise<boolean> {
    const supabaseClient = supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await supabaseClient
        .from('returns')
        .update({ status })
        .eq('id', returnId);

      if (error) {
        // Error updating return status
        return false;
      }

      return true;
    } catch (error) {
      // Error updating return status
      return false;
    }
  }

  async approveReturn(returnId: string): Promise<boolean> {
    return this.updateReturnStatus(returnId, 'APPROVED');
  }

  async rejectReturn(returnId: string): Promise<boolean> {
    return this.updateReturnStatus(returnId, 'REJECTED');
  }

  async completeReturn(returnId: string): Promise<boolean> {
    return this.updateReturnStatus(returnId, 'COMPLETED');
  }

  // Helper function to get status color
  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'PROCESSED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  // Helper function to get status label
  getStatusLabel(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Pending';
      case 'PROCESSED':
        return 'Processed';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  // Helper function to get return type label
  getReturnTypeLabel(type: string): string {
    switch (type.toUpperCase()) {
      case 'REFUND':
        return 'Refund';
      case 'EXCHANGE':
        return 'Exchange';
      case 'REPLACEMENT':
        return 'Replacement';
      default:
        return 'Unknown';
    }
  }

  // Helper function to format currency
  formatCurrency(amount: number, currencyCode: string = 'USD'): string {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'NGN': '₦'
    };
    
    const symbol = currencySymbols[currencyCode] || currencyCode;
    
    // Format based on currency
    if (currencyCode === 'NGN') {
      return `${symbol}${amount.toLocaleString('en-NG')}`;
    } else if (currencyCode === 'USD') {
      return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    } else if (currencyCode === 'EUR') {
      return `${symbol}${amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`;
    } else if (currencyCode === 'GBP') {
      return `${symbol}${amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
    }
    
    // Fallback to USD format
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
}

export const returnsService = new ReturnsService(); 