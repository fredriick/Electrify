import { supabase } from './auth';

/**
 * Debug function to check seller earnings table data
 * This can be called from the browser console to debug earnings table issues
 */
export async function debugSellerEarnings(supplierId: string) {
  console.log('🔍 Debugging seller earnings for supplier:', supplierId);
  
  try {
    // Get current earnings record
    const { data: earnings, error: earningsError } = await supabase
      .from('seller_earnings')
      .select('*')
      .eq('seller_id', supplierId)
      .single();

    if (earningsError && earningsError.code !== 'PGRST116') {
      console.error('❌ Error fetching earnings:', earningsError);
      return;
    }

    console.log('📊 Current earnings record:', earnings);

    // Get refund deductions
    const { data: refunds, error: refundsError } = await supabase
      .from('refund_deductions')
      .select('*')
      .eq('seller_id', supplierId);

    if (refundsError) {
      console.error('❌ Error fetching refund deductions:', refundsError);
    } else {
      console.log('📊 Refund deductions:', refunds);
    }

    // Calculate what the earnings SHOULD be based on orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        order_items!inner(
          product_id,
          products!inner(
            supplier_id
          )
        )
      `)
      .eq('order_items.products.supplier_id', supplierId)
      .neq('status', 'CANCELLED')
      .neq('status', 'REFUNDED');

    if (ordersError) {
      console.error('❌ Error fetching orders for calculation:', ordersError);
      return;
    }

    const totalEarnings = orders?.reduce((sum: number, order: any) => 
      sum + (order.total_amount || 0), 0
    ) || 0;

    const totalRefunds = refunds?.reduce((sum: number, refund: any) => 
      sum + (refund.amount || 0), 0
    ) || 0;

    const netEarnings = totalEarnings - totalRefunds;

    console.log('💰 Calculated totals:');
    console.log('  - Total Earnings (from orders):', totalEarnings);
    console.log('  - Total Refunds:', totalRefunds);
    console.log('  - Net Earnings:', netEarnings);

    console.log('📊 Comparison with stored data:');
    if (earnings) {
      console.log('  - Stored Total Earnings:', earnings.total_earnings);
      console.log('  - Stored Total Refunds:', earnings.total_refunds);
      console.log('  - Stored Net Earnings:', earnings.net_earnings);
      console.log('  - Match:', 
        earnings.total_earnings === totalEarnings && 
        earnings.total_refunds === totalRefunds && 
        earnings.net_earnings === netEarnings
      );
    } else {
      console.log('  - No earnings record found');
    }

    return {
      earnings,
      refunds,
      orders,
      calculated: {
        totalEarnings,
        totalRefunds,
        netEarnings
      }
    };
  } catch (error) {
    console.error('❌ Error debugging seller earnings:', error);
    return null;
  }
}

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).debugSellerEarnings = debugSellerEarnings;
}
