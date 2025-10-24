import { supabase } from './auth';

export interface SellerEarnings {
  id: string;
  seller_id: string;
  total_earnings: number;
  total_refunds: number;
  net_earnings: number;
  pending_amount: number;
  paid_amount: number;
  created_at: string;
  updated_at: string;
}

export interface RefundDeduction {
  id: string;
  seller_id: string;
  refund_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'DEDUCTED' | 'REVERSED';
  created_at: string;
  updated_at: string;
}

export class SellerEarningsService {
  /**
   * Get seller earnings summary
   */
  async getSellerEarnings(sellerId: string): Promise<SellerEarnings | null> {
    try {
      const { data, error } = await supabase
        .from('seller_earnings')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching seller earnings:', error);
        return null;
      }

      if (!data) {
        // Create initial earnings record if none exists
        return await this.createInitialEarnings(sellerId);
      }

      return data;
    } catch (error) {
      console.error('Error in getSellerEarnings:', error);
      return null;
    }
  }

  /**
   * Create initial earnings record for seller
   */
  private async createInitialEarnings(sellerId: string): Promise<SellerEarnings | null> {
    try {
      const { data, error } = await supabase
        .from('seller_earnings')
        .insert({
          seller_id: sellerId,
          total_earnings: 0,
          total_refunds: 0,
          net_earnings: 0,
          pending_amount: 0,
          paid_amount: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating initial earnings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createInitialEarnings:', error);
      return null;
    }
  }

  /**
   * Deduct refund amount from seller earnings
   */
  async deductRefund(sellerId: string, refundId: string, orderId: string, amount: number, currency: string = 'NGN'): Promise<boolean> {
    try {
      // Start transaction-like operation
      const { data: earnings, error: fetchError } = await supabase
        .from('seller_earnings')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

      if (fetchError) {
        console.error('Error fetching earnings for deduction:', fetchError);
        
        // If no earnings record exists, try to initialize it first
        if (fetchError.code === 'PGRST116' || fetchError.message?.includes('0 rows')) {
          console.log('🔧 No earnings record found, initializing seller earnings...');
          const initSuccess = await this.initializeSellerEarnings(sellerId);
          if (!initSuccess) {
            console.error('Failed to initialize seller earnings');
            return false;
          }
          
          // Retry fetching earnings after initialization
          const { data: newEarnings, error: retryError } = await supabase
            .from('seller_earnings')
            .select('*')
            .eq('seller_id', sellerId)
            .single();
            
          if (retryError || !newEarnings) {
            console.error('Error fetching earnings after initialization:', retryError);
            return false;
          }
          
          // Use the newly initialized earnings
          return this.performDeduction(newEarnings, sellerId, refundId, orderId, amount, currency);
        }
        
        return false;
      }

      if (!earnings) {
        console.error('No earnings record found for seller:', sellerId);
        return false;
      }

      return this.performDeduction(earnings, sellerId, refundId, orderId, amount, currency);
    } catch (error) {
      console.error('Error in deductRefund:', error);
      return false;
    }
  }

  private async performDeduction(earnings: any, sellerId: string, refundId: string, orderId: string, amount: number, currency: string): Promise<boolean> {
    try {
      // Create refund deduction record
      const { error: deductionError } = await supabase
        .from('refund_deductions')
        .insert({
          seller_id: sellerId,
          refund_id: refundId,
          order_id: orderId,
          amount: amount,
          currency: currency,
          status: 'DEDUCTED'
        });

      if (deductionError) {
        console.error('Error creating refund deduction:', deductionError);
        return false;
      }

      // Update seller earnings
      const newTotalRefunds = earnings.total_refunds + amount;
      const newNetEarnings = earnings.total_earnings - newTotalRefunds;
      const newPendingAmount = Math.max(0, earnings.pending_amount - amount);

      const { error: updateError } = await supabase
        .from('seller_earnings')
        .update({
          total_refunds: newTotalRefunds,
          net_earnings: newNetEarnings,
          pending_amount: newPendingAmount,
          updated_at: new Date().toISOString()
        })
        .eq('seller_id', sellerId);

      if (updateError) {
        console.error('Error updating seller earnings:', updateError);
        return false;
      }

      console.log(`✅ Refund of ${amount} ${currency} deducted from seller ${sellerId}`);
      return true;
    } catch (error) {
      console.error('Error in performDeduction:', error);
      return false;
    }
  }

  /**
   * Get refund deductions for a seller
   */
  async getRefundDeductions(sellerId: string): Promise<RefundDeduction[]> {
    try {
      const { data, error } = await supabase
        .from('refund_deductions')
        .select(`
          *,
          refunds!inner(
            id,
            refund_number,
            refund_reason,
            status
          ),
          orders!inner(
            id,
            order_number
          )
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching refund deductions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRefundDeductions:', error);
      return [];
    }
  }

  /**
   * Update seller earnings when order is completed (excludes cancelled orders)
   */
  async addOrderEarnings(sellerId: string, orderId: string, amount: number, currency: string = 'NGN'): Promise<boolean> {
    try {
      // Verify the order is not cancelled before adding earnings
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        console.error('Error fetching order for earnings validation:', orderError);
        return false;
      }

      if (order.status === 'CANCELLED') {
        console.log(`Order ${orderId} is cancelled, not adding to earnings`);
        return false;
      }

      const { data: earnings, error: fetchError } = await supabase
        .from('seller_earnings')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

      if (fetchError) {
        console.error('Error fetching earnings for addition:', fetchError);
        return false;
      }

      if (!earnings) {
        // Create initial earnings record
        const initialEarnings = await this.createInitialEarnings(sellerId);
        if (!initialEarnings) return false;
      }

      // Update earnings
      const { error: updateError } = await supabase
        .from('seller_earnings')
        .update({
          total_earnings: supabase.raw('total_earnings + ?', [amount]),
          net_earnings: supabase.raw('net_earnings + ?', [amount]),
          pending_amount: supabase.raw('pending_amount + ?', [amount]),
          updated_at: new Date().toISOString()
        })
        .eq('seller_id', sellerId);

      if (updateError) {
        console.error('Error updating seller earnings:', updateError);
        return false;
      }

      console.log(`✅ Order earnings of ${amount} ${currency} added for seller ${sellerId}`);
      return true;
    } catch (error) {
      console.error('Error in addOrderEarnings:', error);
      return false;
    }
  }

  /**
   * Recalculate seller earnings (useful when order status changes)
   */
  async recalculateSellerEarnings(sellerId: string): Promise<boolean> {
    try {
      // Get all successful orders for this seller (exclude cancelled and refunded)
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
        .eq('order_items.products.supplier_id', sellerId)
        .in('status', ['PROCESSING', 'SHIPPED', 'DELIVERED']);

      if (ordersError) {
        console.error('Error fetching orders for recalculation:', ordersError);
        return false;
      }

      // Calculate total earnings from non-cancelled orders
      const totalEarnings = orders?.reduce((sum: number, order: any) => {
        return sum + (order.total_amount || 0);
      }, 0) || 0;

      // Get current refund deductions
      const refundDeductions = await this.getRefundDeductions(sellerId);
      const totalRefunds = refundDeductions.reduce((sum: number, deduction: any) => {
        return sum + (deduction.amount || 0);
      }, 0);

      const netEarnings = totalEarnings - totalRefunds;

      // Update earnings record
      const { error: updateError } = await supabase
        .from('seller_earnings')
        .upsert({
          seller_id: sellerId,
          total_earnings: totalEarnings,
          total_refunds: totalRefunds,
          net_earnings: netEarnings,
          pending_amount: netEarnings, // Assuming all earnings are pending for now
          paid_amount: 0
        }, {
          onConflict: 'seller_id'
        });

      if (updateError) {
        console.error('Error recalculating seller earnings:', updateError);
        return false;
      }

      console.log(`✅ Recalculated seller earnings: ${totalEarnings} total, ${totalRefunds} refunds, ${netEarnings} net for seller ${sellerId}`);
      return true;
    } catch (error) {
      console.error('Error in recalculateSellerEarnings:', error);
      return false;
    }
  }

  /**
   * Initialize seller earnings with existing order data
   */
  async initializeSellerEarnings(sellerId: string): Promise<boolean> {
    try {
      // Check if earnings record already exists
      const existingEarnings = await this.getSellerEarnings(sellerId);
      if (existingEarnings && existingEarnings.total_earnings > 0) {
        console.log('Seller earnings already initialized');
        return true;
      }

      // Get all successful orders for this seller (exclude cancelled and refunded orders)
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
        .eq('order_items.products.supplier_id', sellerId)
        .in('status', ['PROCESSING', 'SHIPPED', 'DELIVERED']);

      if (ordersError) {
        console.error('Error fetching orders for earnings initialization:', ordersError);
        return false;
      }

      if (!orders || orders.length === 0) {
        console.log('No completed orders found for seller:', sellerId);
        return true; // No orders to initialize with
      }

      // Calculate total earnings from completed orders
      const totalEarnings = orders.reduce((sum: number, order: any) => {
        return sum + (order.total_amount || 0);
      }, 0);

      // Create or update earnings record
      const { error: upsertError } = await supabase
        .from('seller_earnings')
        .upsert({
          seller_id: sellerId,
          total_earnings: totalEarnings,
          total_refunds: 0,
          net_earnings: totalEarnings,
          pending_amount: totalEarnings,
          paid_amount: 0
        }, {
          onConflict: 'seller_id'
        });

      if (upsertError) {
        console.error('Error initializing seller earnings:', upsertError);
        return false;
      }

      console.log(`✅ Initialized seller earnings: ${totalEarnings} for seller ${sellerId}`);
      return true;
    } catch (error) {
      console.error('Error in initializeSellerEarnings:', error);
      return false;
    }
  }

  /**
   * Reverse a refund deduction (if refund is rejected)
   */
  async reverseRefundDeduction(sellerId: string, refundId: string): Promise<boolean> {
    try {
      // Get the deduction record
      const { data: deduction, error: fetchError } = await supabase
        .from('refund_deductions')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('refund_id', refundId)
        .single();

      if (fetchError || !deduction) {
        console.error('Error fetching refund deduction:', fetchError);
        return false;
      }

      // Update deduction status
      const { error: updateDeductionError } = await supabase
        .from('refund_deductions')
        .update({
          status: 'REVERSED',
          updated_at: new Date().toISOString()
        })
        .eq('id', deduction.id);

      if (updateDeductionError) {
        console.error('Error updating deduction status:', updateDeductionError);
        return false;
      }

      // Reverse the earnings deduction
      const { data: earnings, error: earningsError } = await supabase
        .from('seller_earnings')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

      if (earningsError || !earnings) {
        console.error('Error fetching earnings for reversal:', earningsError);
        return false;
      }

      const newTotalRefunds = Math.max(0, earnings.total_refunds - deduction.amount);
      const newNetEarnings = earnings.total_earnings - newTotalRefunds;
      const newPendingAmount = earnings.pending_amount + deduction.amount;

      const { error: updateEarningsError } = await supabase
        .from('seller_earnings')
        .update({
          total_refunds: newTotalRefunds,
          net_earnings: newNetEarnings,
          pending_amount: newPendingAmount,
          updated_at: new Date().toISOString()
        })
        .eq('seller_id', sellerId);

      if (updateEarningsError) {
        console.error('Error updating earnings for reversal:', updateEarningsError);
        return false;
      }

      console.log(`✅ Refund deduction reversed for seller ${sellerId}`);
      return true;
    } catch (error) {
      console.error('Error in reverseRefundDeduction:', error);
      return false;
    }
  }
}

export const sellerEarningsService = new SellerEarningsService();

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).sellerEarningsService = sellerEarningsService;
}
