import { supabase } from './auth';

/**
 * Debug function to check actual order statuses in the database
 * This can be called from the browser console to debug order status issues
 */
export async function debugOrderStatuses(supplierId: string) {
  console.log('🔍 Debugging order statuses for supplier:', supplierId);
  
  try {
    // Get all orders for this supplier
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        status,
        created_at,
        order_items (
          product_id,
          products (
            supplier_id
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }

    // Filter orders for this supplier
    const supplierOrders = (orders || []).filter((order: any) => 
      order.order_items?.some((item: any) => 
        item.products?.supplier_id === supplierId
      )
    );

    console.log('📊 All orders for supplier:', supplierOrders);
    
    // Group by status
    const ordersByStatus = supplierOrders.reduce((acc: any, order: any) => {
      const status = order.status?.toUpperCase() || 'UNKNOWN';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(order);
      return acc;
    }, {});

    console.log('📊 Orders grouped by status:', ordersByStatus);
    
    // Calculate totals by status
    const totalsByStatus = Object.keys(ordersByStatus).reduce((acc: any, status: any) => {
      acc[status] = ordersByStatus[status].reduce((sum: number, order: any) => 
        sum + (order.total_amount || 0), 0
      );
      return acc;
    }, {});

    console.log('💰 Totals by status:', totalsByStatus);
    
    // Calculate what should be included in sales
    const includedStatuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
    const excludedStatuses = ['CANCELLED', 'REFUNDED'];
    
    const includedOrders = supplierOrders.filter((order: any) => {
      const status = order.status?.toUpperCase();
      return includedStatuses.includes(status) && !excludedStatuses.includes(status);
    });
    
    const excludedOrders = supplierOrders.filter((order: any) => {
      const status = order.status?.toUpperCase();
      return excludedStatuses.includes(status);
    });
    
    const includedTotal = includedOrders.reduce((sum: number, order: any) => 
      sum + (order.total_amount || 0), 0
    );
    
    const excludedTotal = excludedOrders.reduce((sum: number, order: any) => 
      sum + (order.total_amount || 0), 0
    );
    
    console.log('✅ Orders that SHOULD be included in sales:', includedOrders);
    console.log('❌ Orders that SHOULD be excluded from sales:', excludedOrders);
    console.log('💰 Expected total sales (included):', includedTotal);
    console.log('💰 Excluded total:', excludedTotal);
    
    return {
      allOrders: supplierOrders,
      ordersByStatus,
      totalsByStatus,
      includedOrders,
      excludedOrders,
      includedTotal,
      excludedTotal
    };
  } catch (error) {
    console.error('❌ Error debugging order statuses:', error);
    return null;
  }
}

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).debugOrderStatuses = debugOrderStatuses;
}
