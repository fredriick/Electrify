import { getSupabaseClient } from '@/lib/auth';

export interface TaxRate {
  id: string;
  name: string;
  rate: number; // Percentage (e.g., 8.5 for 8.5%)
  type: 'default' | 'location_based' | 'product_based';
  location?: {
    country?: string;
  };
  product_categories?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxCalculation {
  base_amount: number;
  tax_rate: number;
  tax_amount: number;
  tax_breakdown: Array<{
    rate_name: string;
    rate: number;
    amount: number;
  }>;
}

export class TaxService {
  private supabase = getSupabaseClient();
  private static instance: TaxService;
  private taxRates: TaxRate[] = [];
  private defaultTaxRate: number = 0; // No hardcoded fallback

  static getInstance(): TaxService {
    if (!TaxService.instance) {
      TaxService.instance = new TaxService();
    }
    return TaxService.instance;
  }

  /**
   * Load tax rates from database
   */
  async loadTaxRates(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('tax_rates')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true });

      if (error) {
        console.error('Error loading tax rates:', error);
        return;
      }

      this.taxRates = data || [];
      console.log('📊 Tax rates loaded:', this.taxRates);
    } catch (error) {
      console.error('Error in loadTaxRates:', error);
    }
  }

  /**
   * Get tax rate for a specific location and product categories
   */
  async getTaxRate(
    location?: { state?: string; country?: string },
    productCategories?: string[]
  ): Promise<number> {
    // Load tax rates if not already loaded
    if (this.taxRates.length === 0) {
      await this.loadTaxRates();
    }

    // Try to find country-based tax rate
    if (location && location.country) {
      const countryRate = this.taxRates.find(rate => 
        rate.type === 'location_based' &&
        rate.location &&
        rate.location.country &&
        rate.location.country.toLowerCase() === location.country!.toLowerCase()
      );

      if (countryRate) {
        console.log(`📊 Using country-based tax rate: ${countryRate.rate}% for ${location.country}`);
        return countryRate.rate;
      }
    }

    // Try to find product-based tax rate
    if (productCategories && productCategories.length > 0) {
      const productRate = this.taxRates.find(rate => 
        rate.type === 'product_based' &&
        rate.product_categories &&
        productCategories.some(category => rate.product_categories!.includes(category))
      );

      if (productRate) {
        console.log(`📊 Using product-based tax rate: ${productRate.rate}% for categories: ${productCategories.join(', ')}`);
        return productRate.rate;
      }
    }

    // Use default tax rate
    const defaultRate = this.taxRates.find(rate => rate.type === 'default');
    if (defaultRate) {
      console.log(`📊 Using default tax rate: ${defaultRate.rate}%`);
      return defaultRate.rate;
    }

    // No fallback - return 0 if no tax rate found
    console.log(`📊 No tax rate found, returning 0%`);
    return 0;
  }

  /**
   * Calculate tax for an order
   */
  async calculateTax(
    baseAmount: number,
    location?: { state?: string; country?: string },
    productCategories?: string[]
  ): Promise<TaxCalculation> {
    const taxRate = await this.getTaxRate(location, productCategories);
    const taxAmount = baseAmount * (taxRate / 100);

    return {
      base_amount: baseAmount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      tax_breakdown: [{
        rate_name: 'Sales Tax',
        rate: taxRate,
        amount: taxAmount
      }]
    };
  }

  /**
   * Get tax rates for admin settings
   */
  async getTaxRates(): Promise<TaxRate[]> {
    if (this.taxRates.length === 0) {
      await this.loadTaxRates();
    }
    return this.taxRates;
  }

  /**
   * Save tax rate
   */
  async saveTaxRate(taxRate: Partial<TaxRate>): Promise<TaxRate | null> {
    try {
      const { data, error } = await this.supabase
        .from('tax_rates')
        .upsert({
          ...taxRate,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving tax rate:', error);
        return null;
      }

      // Reload tax rates
      await this.loadTaxRates();
      return data;
    } catch (error) {
      console.error('Error in saveTaxRate:', error);
      return null;
    }
  }

  /**
   * Delete tax rate
   */
  async deleteTaxRate(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('tax_rates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tax rate:', error);
        return false;
      }

      // Reload tax rates
      await this.loadTaxRates();
      return true;
    } catch (error) {
      console.error('Error in deleteTaxRate:', error);
      return false;
    }
  }

  /**
   * Get default tax rate from admin settings (fallback)
   */
  async getDefaultTaxRateFromSettings(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('system_settings')
        .select('payment_settings')
        .single();

      if (error || !data) {
        console.log('No system settings found, using fallback tax rate');
        return this.defaultTaxRate;
      }

      const paymentSettings = data.payment_settings;
      if (paymentSettings && typeof paymentSettings.taxRate === 'number') {
        console.log(`📊 Using tax rate from system settings: ${paymentSettings.taxRate}%`);
        return paymentSettings.taxRate;
      }

      return this.defaultTaxRate;
    } catch (error) {
      console.error('Error getting default tax rate from settings:', error);
      return this.defaultTaxRate;
    }
  }
}

// Export singleton instance
export const taxService = TaxService.getInstance();
