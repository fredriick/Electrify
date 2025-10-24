import { getSupabaseClient } from '@/lib/auth';

export interface CountryVAT {
  id: string;
  country: string;
  vat_rate: number; // Percentage (e.g., 7.50 for 7.5%)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxCalculation {
  base_amount: number;
  vat_rate: number;
  vat_amount: number;
  tax_inclusive_amount?: number; // If extracting VAT from price
  calculation_method: 'tax_exclusive' | 'tax_inclusive';
  is_exempt: boolean;
}

export class SimpleTaxService {
  private supabase = getSupabaseClient();
  private static instance: SimpleTaxService;
  private countryVAT: CountryVAT[] = [];
  private defaultVATRate: number = 7.50; // Nigeria default
  private productTaxCache: Map<string, { tax_exempt: boolean; tax_inclusive: boolean }> = new Map();

  static getInstance(): SimpleTaxService {
    if (!SimpleTaxService.instance) {
      SimpleTaxService.instance = new SimpleTaxService();
    }
    return SimpleTaxService.instance;
  }

  /**
   * Load country VAT rates from database
   */
  async loadCountryVAT(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('country_vat')
        .select('*')
        .eq('is_active', true)
        .order('country');

      if (error) {
        return;
      }

      this.countryVAT = data || [];
    } catch (error) {
      // Error loading VAT rates
    }
  }

  /**
   * Get VAT rate for a specific country
   */
  async getVATRate(country?: string): Promise<number> {
    // Load VAT rates if not already loaded
    if (this.countryVAT.length === 0) {
      await this.loadCountryVAT();
    }

    // Try to find country-specific VAT rate
    if (country) {
      const countryRate = this.countryVAT.find(vat => 
        vat.country.toLowerCase() === country.toLowerCase()
      );

      if (countryRate) {
        return countryRate.vat_rate;
      }
    }

    // Use default VAT rate (Nigeria)
    return this.defaultVATRate;
  }

  /**
   * Get tax information for multiple products in a single API call
   */
  async getProductsTaxInfo(productIds: string[]): Promise<Map<string, { tax_exempt: boolean; tax_inclusive: boolean }>> {
    const result = new Map<string, { tax_exempt: boolean; tax_inclusive: boolean }>();
    
    // Check cache first
    const uncachedIds: string[] = [];
    for (const productId of productIds) {
      if (this.productTaxCache.has(productId)) {
        result.set(productId, this.productTaxCache.get(productId)!);
      } else {
        uncachedIds.push(productId);
      }
    }
    
    // Fetch uncached products
    if (uncachedIds.length > 0) {
      try {
        const { data, error } = await this.supabase
          .from('products')
          .select('id, tax_exempt, tax_inclusive')
          .in('id', uncachedIds);
        
        if (error) {
          // Fallback: set default values for uncached products
          for (const productId of uncachedIds) {
            const defaultInfo = { tax_exempt: false, tax_inclusive: false };
            result.set(productId, defaultInfo);
            this.productTaxCache.set(productId, defaultInfo);
          }
          return result;
        }
        
        // Process fetched data
        if (data) {
          for (const product of data) {
            const taxInfo = {
              tax_exempt: product.tax_exempt || false,
              tax_inclusive: product.tax_inclusive || false
            };
            result.set(product.id, taxInfo);
            this.productTaxCache.set(product.id, taxInfo);
          }
        }
        
        // Set default values for any products not found in the response
        for (const productId of uncachedIds) {
          if (!result.has(productId)) {
            const defaultInfo = { tax_exempt: false, tax_inclusive: false };
            result.set(productId, defaultInfo);
            this.productTaxCache.set(productId, defaultInfo);
          }
        }
        
      } catch (error) {
        // Fallback: set default values for all uncached products
        for (const productId of uncachedIds) {
          const defaultInfo = { tax_exempt: false, tax_inclusive: false };
          result.set(productId, defaultInfo);
          this.productTaxCache.set(productId, defaultInfo);
        }
      }
    }
    
    return result;
  }

  /**
   * Check if product is tax exempt
   */
  async isProductTaxExempt(productId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('tax_exempt')
        .eq('id', productId)
        .single();

      if (error) {
        return false;
      }

      return data?.tax_exempt || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if product pricing is tax-inclusive
   */
  async isProductTaxInclusive(productId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('tax_inclusive')
        .eq('id', productId)
        .single();

      if (error) {
        return false;
      }

      return data?.tax_inclusive || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate VAT for an order (simplified flow)
   */
  async calculateVAT(
    baseAmount: number,
    country?: string,
    productIds?: string[]
  ): Promise<TaxCalculation> {
    // Get VAT rate for country
    const vatRate = await this.getVATRate(country);

    // Get tax information for all products in a single API call
    let isExempt = false;
    let hasTaxInclusiveProducts = false;
    
    if (productIds && productIds.length > 0) {
      const productsTaxInfo = await this.getProductsTaxInfo(productIds);
      
      for (const productId of productIds) {
        const taxInfo = productsTaxInfo.get(productId);
        if (taxInfo) {
          if (taxInfo.tax_exempt) {
            isExempt = true;
          }
          if (taxInfo.tax_inclusive) {
            hasTaxInclusiveProducts = true;
          }
        }
      }
    }

    // If exempt, return 0% VAT
    if (isExempt) {
      return {
        base_amount: baseAmount,
        vat_rate: 0,
        vat_amount: 0,
        calculation_method: 'tax_exclusive',
        is_exempt: true
      };
    }

    // Calculate VAT
    if (hasTaxInclusiveProducts) {
      // Extract VAT from tax-inclusive price
      const taxInclusiveAmount = baseAmount;
      const vatAmount = baseAmount * (vatRate / (100 + vatRate));
      const baseAmountExclusive = baseAmount - vatAmount;

      return {
        base_amount: baseAmountExclusive,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        tax_inclusive_amount: taxInclusiveAmount,
        calculation_method: 'tax_inclusive',
        is_exempt: false
      };
    } else {
      // Add VAT to tax-exclusive price
      const vatAmount = baseAmount * (vatRate / 100);
      
      const result = {
        base_amount: baseAmount,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        calculation_method: 'tax_exclusive' as const,
        is_exempt: false
      };
      
      return result;
    }
  }

  /**
   * Clear product tax cache (useful for testing or when product tax info changes)
   */
  clearProductTaxCache(): void {
    this.productTaxCache.clear();
  }

  /**
   * Get country VAT rates for admin management
   */
  async getCountryVATRates(): Promise<CountryVAT[]> {
    if (this.countryVAT.length === 0) {
      await this.loadCountryVAT();
    }
    return this.countryVAT;
  }

  /**
   * Save country VAT rate
   */
  async saveCountryVATRate(vatData: Partial<CountryVAT>): Promise<CountryVAT | null> {
    try {
      const { data, error } = await this.supabase
        .from('country_vat')
        .upsert({
          ...vatData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return null;
      }

      // Reload VAT rates
      await this.loadCountryVAT();
      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete country VAT rate
   */
  async deleteCountryVATRate(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('country_vat')
        .delete()
        .eq('id', id);

      if (error) {
        return false;
      }

      // Reload VAT rates
      await this.loadCountryVAT();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update product tax exemption status
   */
  async updateProductTaxExemption(productId: string, isExempt: boolean): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('products')
        .update({ tax_exempt: isExempt })
        .eq('id', productId);

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update product tax inclusivity status
   */
  async updateProductTaxInclusivity(productId: string, isInclusive: boolean): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('products')
        .update({ tax_inclusive: isInclusive })
        .eq('id', productId);

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const simpleTaxService = SimpleTaxService.getInstance();

