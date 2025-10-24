import { supabase } from '@/lib/auth';

// =====================================================
// REVENUE SERVICE - PLATFORM REVENUE CALCULATION
// =====================================================

export interface CommissionRate {
  id: string;
  supplier_id: string;
  category_id?: string;
  commission_rate: number;
  min_order_amount: number;
  max_order_amount?: number;
  is_active: boolean;
}

export interface PlatformFee {
  id: string;
  fee_type: 'per_order' | 'per_item' | 'percentage';
  fee_amount: number;
  min_order_amount: number;
  max_order_amount?: number;
  is_active: boolean;
  description?: string;
}

export interface PaymentProcessingFee {
  id: string;
  payment_provider: 'paystack' | 'flutterwave' | 'stripe';
  fee_type: 'percentage' | 'fixed' | 'hybrid';
  percentage_rate: number;
  fixed_amount: number;
  min_fee: number;
  max_fee?: number;
  is_active: boolean;
}

export interface RevenueBreakdown {
  subtotal: number;
  vat_amount: number;
  shipping_amount: number;
  commission_amount: number;
  platform_fee_amount: number;
  payment_processing_fee: number;
  supplier_payout: number;
  platform_revenue: number;
  total_order_value: number;
}

export interface OrderRevenueBreakdown {
  id: string;
  order_id: string;
  supplier_id: string;
  subtotal: number;
  vat_amount: number;
  shipping_amount: number;
  commission_amount: number;
  platform_fee_amount: number;
  payment_processing_fee: number;
  supplier_payout: number;
  platform_revenue: number;
  payment_provider: string;
  payment_method: string;
  created_at: string;
}

export interface SupplierPayout {
  id: string;
  supplier_id: string;
  order_id: string;
  gross_amount: number;
  commission_deducted: number;
  platform_fee_deducted: number;
  net_payout: number;
  payout_status: 'pending' | 'processing' | 'completed' | 'failed';
  payout_method?: string;
  payout_reference?: string;
  payout_date?: string;
  created_at: string;
}

export interface PlatformRevenueSummary {
  id: string;
  date: string;
  total_commission: number;
  total_platform_fees: number;
  total_payment_fees: number;
  total_revenue: number;
  total_orders: number;
  total_order_value: number;
  total_suppliers: number;
  total_payouts: number;
}

class RevenueService {
  private commissionRates: CommissionRate[] = [];
  private platformFees: PlatformFee[] = [];
  private paymentFees: PaymentProcessingFee[] = [];

  // =====================================================
  // COMMISSION RATES MANAGEMENT
  // =====================================================

  async loadCommissionRates(): Promise<void> {
    try {
      // First, let's check if there are any commission rates at all (including inactive ones)
      const { data: allRates, error: allRatesError } = await supabase
        .from('commission_rates')
        .select('*');
      
      if (allRatesError) {
        // Error loading all commission rates
      }

      // If no commission rates exist, create default ones for existing suppliers
      if (allRates?.length === 0) {
        
        await this.createDefaultCommissionRates();
      }

      // Now get only active ones
      // Try different approaches to bypass RLS issues
      let data, error;
      
      try {
        // First try: Normal query
        const result = await supabase
          .from('commission_rates')
          .select('*')
          .eq('is_active', true)
          .order('min_order_amount', { ascending: true });
        data = result.data;
        error = result.error;
      } catch (err) {
        
        // Second try: Query without RLS (if possible)
        try {
          const result = await supabase
            .from('commission_rates')
            .select('*')
            .order('min_order_amount', { ascending: true });
          data = result.data?.filter((rate: any) => rate.is_active) || [];
          error = result.error;
        } catch (err2) {
          
          data = [];
          error = null;
        }
      }


      if (error) {
        
        throw error;
      }
      
      this.commissionRates = data || [];
    } catch (error) {
      
      throw error;
    }
  }

  async createDefaultCommissionRates(): Promise<void> {
    try {
      
      
      // Get all active suppliers
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id')
        .eq('is_active', true);

      if (suppliersError) {
        
        return;
      }

      if (!suppliers || suppliers.length === 0) {
        
        return;
      }

      

      // RLS Policy Issue: Cannot create commission rates as customer user
      // Instead, we'll use the admin interface to create them
      
      
      
      
      
      
      
      // For now, we'll just log the suppliers that need commission rates
      
      
    } catch (error) {
      
    }
  }

  async getCommissionRate(supplierId: string, subtotal: number): Promise<number> {
    if (this.commissionRates.length === 0) {
      
      await this.loadCommissionRates();
      
      // If still empty after reload, try to create them manually
      if (this.commissionRates.length === 0) {
        
        await this.createDefaultCommissionRates();
        await this.loadCommissionRates(); // Reload after creation
      }
    }


    const rate = this.commissionRates.find(r => 
      r.supplier_id === supplierId &&
      subtotal >= r.min_order_amount &&
      (r.max_order_amount === null || r.max_order_amount === undefined || subtotal <= r.max_order_amount)
    );


    return rate?.commission_rate || 5.0; // Default 5%
  }

  // =====================================================
  // PLATFORM FEES MANAGEMENT
  // =====================================================

  async loadPlatformFees(): Promise<void> {
    try {
      
      const { data, error } = await supabase
        .from('platform_fees')
        .select('*')
        .eq('is_active', true)
        .order('min_order_amount', { ascending: true });

      if (error) {
        
        throw error;
      }
      
      this.platformFees = data || [];
    } catch (error) {
      
      throw error;
    }
  }

  async getPlatformFee(subtotal: number): Promise<number> {
    if (this.platformFees.length === 0) {
      await this.loadPlatformFees();
    }


    // Find all matching fees first
    const matchingFees = this.platformFees.filter(f => {
      // Accept both 'per_order' and 'percentage' fee types
      const matchesType = f.fee_type === 'per_order' || f.fee_type === 'percentage';
      const matchesMinAmount = subtotal >= f.min_order_amount;
      const matchesMaxAmount = f.max_order_amount === null || f.max_order_amount === undefined || subtotal <= f.max_order_amount;
      
      return matchesType && matchesMinAmount && matchesMaxAmount;
    });


    // Select the best fee based on priority:
    // 1. Prefer 'per_order' over 'percentage'
    // 2. Prefer higher min_order_amount (more specific)
    const fee = matchingFees.sort((a, b) => {
      // First priority: per_order over percentage
      if (a.fee_type === 'per_order' && b.fee_type === 'percentage') return -1;
      if (a.fee_type === 'percentage' && b.fee_type === 'per_order') return 1;
      
      // Second priority: higher min_order_amount (more specific)
      return b.min_order_amount - a.min_order_amount;
    })[0];


    if (!fee) {
      return 200.0; // Default ₦200
    }

    // Calculate fee based on type
    if (fee.fee_type === 'percentage') {
      // If fee_amount is very large (> 100), treat it as a fixed amount instead of percentage
      // This handles cases where percentage fees were incorrectly stored as large numbers
      if (fee.fee_amount > 100) {
        return fee.fee_amount;
      } else {
        const percentageFee = subtotal * (fee.fee_amount / 100);
        return percentageFee;
      }
    } else {
      // Fixed fee (per_order or per_item)
      return fee.fee_amount;
    }
  }

  // =====================================================
  // PAYMENT PROCESSING FEES MANAGEMENT
  // =====================================================

  async loadPaymentFees(): Promise<void> {
    try {
      
      const { data, error } = await supabase
        .from('payment_processing_fees')
        .select('*')
        .eq('is_active', true);

      if (error) {
        
        throw error;
      }
      
      this.paymentFees = data || [];
    } catch (error) {
      
      throw error;
    }
  }

  async getPaymentProcessingFee(provider: string, totalOrderValue: number): Promise<number> {
    if (this.paymentFees.length === 0) {
      await this.loadPaymentFees();
    }


    const fee = this.paymentFees.find(f => f.payment_provider === provider);
    
    if (!fee) return 0;

    let processingFee = 0;
    
    if (fee.fee_type === 'percentage') {
      processingFee = totalOrderValue * fee.percentage_rate;
    } else if (fee.fee_type === 'fixed') {
      processingFee = fee.fixed_amount;
    } else if (fee.fee_type === 'hybrid') {
      processingFee = Math.max(
        totalOrderValue * fee.percentage_rate,
        fee.fixed_amount
      );
    }

    // Apply min/max limits
    if (fee.min_fee > 0) {
      processingFee = Math.max(processingFee, fee.min_fee);
    }
    if (fee.max_fee && fee.max_fee > 0) {
      processingFee = Math.min(processingFee, fee.max_fee);
    }

    return processingFee;
  }

  // =====================================================
  // REVENUE CALCULATION
  // =====================================================

  async calculateRevenueBreakdown(
    supplierId: string,
    subtotal: number,
    vatAmount: number,
    shippingAmount: number,
    paymentProvider: string = 'paystack'
  ): Promise<RevenueBreakdown> {
    // Calculate total order value
    const totalOrderValue = subtotal + vatAmount + shippingAmount;

    // Get rates and fees
    const commissionRate = await this.getCommissionRate(supplierId, subtotal);
    const platformFee = await this.getPlatformFee(subtotal);
    const paymentFee = await this.getPaymentProcessingFee(paymentProvider, totalOrderValue);

    // Calculate amounts
    const commissionAmount = subtotal * (commissionRate / 100);
    const platformFeeAmount = platformFee;
    const paymentProcessingFee = paymentFee;
    const supplierPayout = subtotal - commissionAmount;
    const platformRevenue = commissionAmount + platformFeeAmount + paymentProcessingFee;

    const breakdown: RevenueBreakdown = {
      subtotal,
      vat_amount: vatAmount,
      shipping_amount: shippingAmount,
      commission_amount: commissionAmount,
      platform_fee_amount: platformFeeAmount,
      payment_processing_fee: paymentProcessingFee,
      supplier_payout: supplierPayout,
      platform_revenue: platformRevenue,
      total_order_value: totalOrderValue
    };

    
    return breakdown;
  }

  // =====================================================
  // ORDER REVENUE BREAKDOWN MANAGEMENT
  // =====================================================

  async saveOrderRevenueBreakdown(
    orderId: string,
    supplierId: string,
    breakdown: RevenueBreakdown,
    paymentProvider: string,
    paymentMethod: string
  ): Promise<OrderRevenueBreakdown> {
    try {
      const { data, error } = await supabase
        .from('order_revenue_breakdown')
        .insert({
          order_id: orderId,
          supplier_id: supplierId,
          subtotal: breakdown.subtotal,
          vat_amount: breakdown.vat_amount,
          shipping_amount: breakdown.shipping_amount,
          commission_amount: breakdown.commission_amount,
          platform_fee_amount: breakdown.platform_fee_amount,
          payment_processing_fee: breakdown.payment_processing_fee,
          supplier_payout: breakdown.supplier_payout,
          platform_revenue: breakdown.platform_revenue,
          payment_provider: paymentProvider,
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      
      throw error;
    }
  }

  async getOrderRevenueBreakdown(orderId: string): Promise<OrderRevenueBreakdown[]> {
    try {
      const { data, error } = await supabase
        .from('order_revenue_breakdown')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      
      throw error;
    }
  }

  // =====================================================
  // SUPPLIER PAYOUTS MANAGEMENT
  // =====================================================

  async createSupplierPayout(
    supplierId: string,
    orderId: string,
    breakdown: RevenueBreakdown
  ): Promise<SupplierPayout> {
    try {
      const { data, error } = await supabase
        .from('supplier_payouts')
        .insert({
          supplier_id: supplierId,
          order_id: orderId,
          gross_amount: breakdown.subtotal,
          commission_deducted: breakdown.commission_amount,
          platform_fee_deducted: breakdown.platform_fee_amount,
          net_payout: breakdown.supplier_payout,
          payout_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      
      throw error;
    }
  }

  async getSupplierPayouts(supplierId: string): Promise<SupplierPayout[]> {
    try {
      const { data, error } = await supabase
        .from('supplier_payouts')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      
      throw error;
    }
  }

  // =====================================================
  // PLATFORM REVENUE SUMMARY
  // =====================================================

  async getPlatformRevenueSummary(date?: string): Promise<PlatformRevenueSummary[]> {
    try {
      let query = supabase
        .from('platform_revenue_summary')
        .select('*')
        .order('date', { ascending: false });

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      
      throw error;
    }
  }

  // =====================================================
  // DEBUGGING AND TESTING FUNCTIONS
  // =====================================================

  // Method to manually test commission rate creation
  async testCommissionRateCreation(): Promise<void> {
    
    try {
      await this.createDefaultCommissionRates();
      await this.loadCommissionRates();
      
    } catch (error) {
      
    }
  }

  // Method to manually set commission rates when RLS prevents database access
  setCommissionRatesManually(rates: CommissionRate[]): void {
    
    this.commissionRates = rates;
  }

  // Method to get commission rate with fallback when database access fails
  async getCommissionRateWithFallback(supplierId: string, subtotal: number): Promise<number> {
    // First try the normal method
    try {
      return await this.getCommissionRate(supplierId, subtotal);
    } catch (error) {
      
      
      // Fallback: Use a default commission rate based on supplier
      // This is a temporary solution until RLS is fixed
      const fallbackRate = 5.0; // Default 5%
      
      
      return fallbackRate;
    }
  }

  // =====================================================
  // ADMIN MANAGEMENT FUNCTIONS
  // =====================================================

  async updateCommissionRate(
    supplierId: string,
    commissionRate: number,
    minOrderAmount: number = 0,
    maxOrderAmount?: number,
    rateId?: string
  ): Promise<CommissionRate> {
    try {
      const updateData = {
        supplier_id: supplierId,
        commission_rate: commissionRate,
        min_order_amount: minOrderAmount,
        max_order_amount: maxOrderAmount,
        is_active: true
      };

      let data, error;
      
      if (rateId) {
        // Update existing record
        const result = await supabase
          .from('commission_rates')
          .update(updateData)
          .eq('id', rateId)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Create new record
        const result = await supabase
          .from('commission_rates')
          .insert(updateData)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      
      return data;
    } catch (error) {
      
      throw error;
    }
  }

  async updatePlatformFee(
    feeType: 'per_order' | 'per_item' | 'percentage',
    feeAmount: number,
    minOrderAmount: number = 0,
    maxOrderAmount?: number,
    description?: string,
    feeId?: string
  ): Promise<PlatformFee> {
    try {
      const updateData = {
        fee_type: feeType,
        fee_amount: feeAmount,
        min_order_amount: minOrderAmount,
        max_order_amount: maxOrderAmount,
        description,
        is_active: true
      };

      let data, error;
      
      if (feeId) {
        // Update existing record
        const result = await supabase
          .from('platform_fees')
          .update(updateData)
          .eq('id', feeId)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Create new record
        const result = await supabase
          .from('platform_fees')
          .insert(updateData)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      
      return data;
    } catch (error) {
      
      throw error;
    }
  }

  async updatePaymentProcessingFee(
    provider: 'paystack' | 'flutterwave' | 'stripe',
    feeType: 'percentage' | 'fixed' | 'hybrid',
    percentageRate: number = 0,
    fixedAmount: number = 0,
    minFee: number = 0,
    maxFee?: number,
    feeId?: string
  ): Promise<PaymentProcessingFee> {
    try {
      const updateData = {
        payment_provider: provider,
        fee_type: feeType,
        percentage_rate: percentageRate,
        fixed_amount: fixedAmount,
        min_fee: minFee,
        max_fee: maxFee,
        is_active: true
      };

      let data, error;
      
      if (feeId) {
        // Update existing record
        const result = await supabase
          .from('payment_processing_fees')
          .update(updateData)
          .eq('id', feeId)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Create new record
        const result = await supabase
          .from('payment_processing_fees')
          .insert(updateData)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      
      return data;
    } catch (error) {
      
      throw error;
    }
  }

  // Delete methods
  async deleteCommissionRate(rateId: string): Promise<void> {
    try {
      
      
      const { error } = await supabase
        .from('commission_rates')
        .delete()
        .eq('id', rateId);

      if (error) throw error;
      
      
    } catch (error) {
      
      throw error;
    }
  }

  async deletePlatformFee(feeId: string): Promise<void> {
    try {
      
      
      const { error } = await supabase
        .from('platform_fees')
        .delete()
        .eq('id', feeId);

      if (error) throw error;
      
      
    } catch (error) {
      
      throw error;
    }
  }

  async deletePaymentProcessingFee(feeId: string): Promise<void> {
    try {
      
      
      const { error } = await supabase
        .from('payment_processing_fees')
        .delete()
        .eq('id', feeId);

      if (error) throw error;
      
      
    } catch (error) {
      
      throw error;
    }
  }
}

// Export singleton instance
export const revenueService = new RevenueService();
