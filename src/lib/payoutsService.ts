import { getSupabaseClient, getSupabaseSessionClient } from './auth';

export interface Payout {
  id: string;
  supplier_id: string;
  amount: number;
  currency: string;
  bank_account?: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  reference: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  supplier_id: string;
  type: 'BANK_TRANSFER' | 'PAYPAL' | 'CREDIT_CARD';
  name: string;
  account_details: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayoutStats {
  totalEarnings: number;
  availableBalance: number;
  pendingPayouts: number;
  thisMonthEarnings: number;
  totalPayouts: number;
  completedPayouts: number;
  pendingPayoutsCount: number;
  // Add real period comparison data
  thisPeriodChange: number;
  thisMonthChange: number;
  lastMonthEarnings: number;
}

class PayoutsService {
  private refundCache = new Map<string, { data: any[]; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  // Helper function to get the correct Supabase client
  private getCorrectSupabaseClient() {
    const storageType = localStorage.getItem('auth-storage-type');
    if (storageType === 'sessionStorage') {
      return getSupabaseSessionClient();
    }
    return getSupabaseClient();
  }

  // Optimized refund detection using batch queries with caching
  private async filterOutRefundedOrders(orders: any[], supabaseClient: any): Promise<any[]> {
    if (!orders || orders.length === 0) return [];

    const orderIds = orders.map(order => order.id);
    const cacheKey = orderIds.sort().join(',');
    
    // Check cache first
    const cached = this.refundCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    const refundedOrderIds = new Set<string>();

    try {
      // Method 1: Batch check refunds table
      const refundStatuses = ['approved', 'COMPLETED', 'APPROVED'];
      const refundColumns = ['status', 'refund_status'];

      for (const column of refundColumns) {
        for (const status of refundStatuses) {
          const { data: refunds } = await supabaseClient
            .from('refunds')
            .select('order_id')
            .in('order_id', orderIds)
            .eq(column, status);

          if (refunds) {
            refunds.forEach((refund: any) => refundedOrderIds.add(refund.order_id));
          }
        }
      }

      // Method 2: Batch check returns table
      const { data: returns } = await supabaseClient
        .from('returns')
        .select('order_id')
        .in('order_id', orderIds)
        .in('status', ['APPROVED', 'COMPLETED', 'PROCESSED']);

      if (returns) {
        returns.forEach((returnItem: any) => refundedOrderIds.add(returnItem.order_id));
      }

      // Method 3: Check orders with REFUNDED status
      orders.forEach(order => {
        if (order.status === 'REFUNDED') {
          refundedOrderIds.add(order.id);
        }
      });

      // Filter out refunded orders
      const nonRefundedOrders = orders.filter(order => !refundedOrderIds.has(order.id));

      return nonRefundedOrders;
    } catch (error) {
      // If refund check fails, return all orders (safer approach)
      return orders;
    }
  }
  async getPayouts(supplierId: string): Promise<Payout[]> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Fetching payouts for supplier
      
      const { data: payouts, error } = await supabaseClient
        .from('payouts')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) {
        // Error fetching payouts
        return [];
      }

      // Payouts fetched
      return payouts || [];
    } catch (error) {
      // Error fetching payouts
      return [];
    }
  }

  async getPayoutStats(supplierId: string): Promise<PayoutStats> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Get orders that generate earnings (PROCESSING, SHIPPED, DELIVERED)
      // First get all successful orders, then filter by supplier in JavaScript
      const { data: allSuccessfulOrders, error: ordersError } = await supabaseClient
        .from('orders')
        .select(`
          id,
          total_amount, 
          created_at, 
          updated_at,
          order_items(
            product_id,
            products(supplier_id)
          )
        `)
        .in('status', ['PROCESSING', 'SHIPPED', 'DELIVERED']);

      if (ordersError) {
        // Error fetching successful orders
        console.error('❌ PayoutsService: Error fetching orders:', ordersError);
        return this.getDefaultStats();
      }

      // Filter orders that belong to this supplier
      const successfulOrders = (allSuccessfulOrders || []).filter((order: any) => {
        return order.order_items?.some((item: any) => 
          item.products?.supplier_id === supplierId
        );
      });

      // Filter out refunded orders using optimized batch queries
      const refundDetectionStart = performance.now();
      const nonRefundedOrders = await this.filterOutRefundedOrders(successfulOrders, supabaseClient);
      const refundDetectionTime = performance.now() - refundDetectionStart;
      
      // Refund detection completed

      // Get processed payouts
      const { data: processedPayouts, error: processedError } = await supabaseClient
        .from('payouts')
        .select('amount, created_at')
        .eq('supplier_id', supplierId)
        .eq('status', 'PROCESSED');

      if (processedError) {
        // Error fetching processed payouts
      }

      // Get pending payouts
      const { data: pendingPayouts, error: pendingError } = await supabaseClient
        .from('payouts')
        .select('amount')
        .eq('supplier_id', supplierId)
        .eq('status', 'PENDING');

      if (pendingError) {
        // Error fetching pending payouts
      }

      // Calculate period comparisons
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calculate earnings from non-refunded orders only
      const totalEarningsFromOrders = (nonRefundedOrders || []).reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
      
      // Calculate available balance (non-refunded orders older than 7 days)
      const availableOrders = (nonRefundedOrders || [])
        .filter((order: any) => {
          const orderDate = new Date(order.updated_at || order.created_at);
          const daysSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceOrder >= 7; // Available after 7 days
        });
      
      const availableBalance = availableOrders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
      
      // Available balance calculated

      // This month's earnings (non-refunded orders in last 30 days)
      const thisMonthEarnings = (nonRefundedOrders || [])
        .filter((order: any) => new Date(order.created_at) >= thirtyDaysAgo)
        .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

      // Last month's earnings (non-refunded orders 30-60 days ago)
      const lastMonthEarnings = (nonRefundedOrders || [])
        .filter((order: any) => {
          const orderDate = new Date(order.created_at);
          return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
        })
        .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

      // This period's change (non-refunded orders in last 7 days)
      const thisPeriodEarnings = (nonRefundedOrders || [])
        .filter((order: any) => new Date(order.created_at) >= sevenDaysAgo)
        .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

      const totalEarnings = totalEarningsFromOrders;
      const pendingAmount = (pendingPayouts || []).reduce((sum: number, payout: Payout) => sum + payout.amount, 0);

      // Calculate changes
      const thisMonthChange = thisMonthEarnings - lastMonthEarnings;
      const thisPeriodChange = thisPeriodEarnings;

      // Return calculated stats

      return {
        totalEarnings,
        availableBalance,
        pendingPayouts: pendingAmount,
        thisMonthEarnings,
        totalPayouts: (processedPayouts || []).length + (pendingPayouts || []).length,
        completedPayouts: (processedPayouts || []).length,
        pendingPayoutsCount: (pendingPayouts || []).length,
        thisPeriodChange,
        thisMonthChange,
        lastMonthEarnings
      };
    } catch (error) {
      // Error calculating payout stats
      return this.getDefaultStats();
    }
  }

  async getPaymentMethods(supplierId: string): Promise<PaymentMethod[]> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Fetching payment methods for supplier
      
      const { data: paymentMethods, error } = await supabaseClient
        .from('payment_methods')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        // Error fetching payment methods
        return [];
      }

      // Payment methods fetched
      return paymentMethods || [];
    } catch (error) {
      // Error fetching payment methods
      return [];
    }
  }

  async createPayout(supplierId: string, amount: number, paymentMethodId: string): Promise<boolean> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Creating payout

      const reference = `PAY-${Date.now()}`;
      
      const { data, error } = await supabaseClient
        .from('payouts')
        .insert({
          supplier_id: supplierId,
          amount,
          currency: 'NGN',
          status: 'PENDING',
          reference,
          bank_account: paymentMethodId // Using payment method ID as bank_account for now
        })
        .select();

      if (error) {
        // Error creating payout
        return false;
      }

      // Payout created successfully
      return true;
    } catch (error) {
      // Error creating payout
      return false;
    }
  }

  async addPaymentMethod(supplierId: string, paymentMethod: Omit<PaymentMethod, 'id' | 'supplier_id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Adding payment method for supplier
      
      
      // If new method is set as default, remove default from others
      if (paymentMethod.is_default) {
        const { error: updateError } = await supabaseClient
          .from('payment_methods')
          .update({ is_default: false })
          .eq('supplier_id', supplierId);
          
        if (updateError) {
          // Error updating existing default payment methods
        }
      }

      const { error } = await supabaseClient
        .from('payment_methods')
        .insert({
          supplier_id: supplierId,
          ...paymentMethod
        });

      if (error) {
        // Error adding payment method
        return false;
      }

      // Payment method added successfully
      return true;
    } catch (error) {
      // Error adding payment method
      return false;
    }
  }

  async setDefaultPaymentMethod(supplierId: string, methodId: string): Promise<boolean> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Remove default from all methods
      await supabaseClient
        .from('payment_methods')
        .update({ is_default: false })
        .eq('supplier_id', supplierId);

      // Set the selected method as default
      const { error } = await supabaseClient
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId)
        .eq('supplier_id', supplierId);

      if (error) {
        // Error setting default payment method
        return false;
      }

      return true;
    } catch (error) {
      // Error setting default payment method
      return false;
    }
  }

  async updatePaymentMethod(supplierId: string, methodId: string, paymentMethod: Omit<PaymentMethod, 'id' | 'supplier_id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Updating payment method
      
      // If new method is set as default, remove default from others
      if (paymentMethod.is_default) {
        const { error: updateError } = await supabaseClient
          .from('payment_methods')
          .update({ is_default: false })
          .eq('supplier_id', supplierId);
          
        if (updateError) {
          // Error updating existing default payment methods
        }
      }

      const { error } = await supabaseClient
        .from('payment_methods')
        .update({
          type: paymentMethod.type,
          name: paymentMethod.name,
          account_details: paymentMethod.account_details,
          is_default: paymentMethod.is_default
        })
        .eq('id', methodId)
        .eq('supplier_id', supplierId);

      if (error) {
        // Error updating payment method
        return false;
      }

      // Payment method updated successfully
      return true;
    } catch (error) {
      // Error updating payment method
      return false;
    }
  }

  async deletePaymentMethod(supplierId: string, methodId: string): Promise<boolean> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Deleting payment method
      
      const { error } = await supabaseClient
        .from('payment_methods')
        .delete()
        .eq('id', methodId)
        .eq('supplier_id', supplierId);

      if (error) {
        // Error deleting payment method
        return false;
      }

      // Payment method deleted successfully
      return true;
    } catch (error) {
      // Error deleting payment method
      return false;
    }
  }

  // Helper function to get status color
  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'PROCESSED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
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
      case 'FAILED':
        return 'Failed';
      default:
        return 'Unknown';
    }
  }

  // Helper function to get payment method type label
  getPaymentMethodTypeLabel(type: string): string {
    switch (type.toUpperCase()) {
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'PAYPAL':
        return 'PayPal';
      case 'CREDIT_CARD':
        return 'Credit Card';
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

  // Helper function to get default stats
  private getDefaultStats(): PayoutStats {
    return {
      totalEarnings: 0,
      availableBalance: 0,
      pendingPayouts: 0,
      thisMonthEarnings: 0,
      totalPayouts: 0,
      completedPayouts: 0,
      pendingPayoutsCount: 0,
      // Add real period comparison data
      thisPeriodChange: 0,
      thisMonthChange: 0,
      lastMonthEarnings: 0
    };
  }
}

export const payoutsService = new PayoutsService(); 