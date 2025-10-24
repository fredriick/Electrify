import { getSupabaseClient } from '@/lib/auth';

export interface ShippingRate {
  id: string;
  supplier_id: string;
  rate_type: 'flat' | 'weight_based' | 'location_based';
  name: string;
  description?: string;
  flat_rate_amount?: number;
  flat_rate_type?: 'per_item' | 'per_order';
  base_weight_kg?: number;
  base_weight_rate?: number;
  additional_weight_kg?: number;
  additional_weight_rate?: number;
  location_rates?: Array<{state?: string; country?: string; rate: number}>;
  location_rate_type?: 'per_item' | 'per_order'; // New field for location-based rates
  location_base_item_rate?: number; // Base rate for first item in location-based per-item pricing
  location_additional_item_rate?: number; // Additional rate for each extra item
  location_base_weight_kg?: number; // Base weight included in location-based pricing
  location_base_weight_rate?: number; // Base rate for base weight
  location_additional_weight_kg?: number; // Additional weight increment
  location_additional_weight_rate?: number; // Rate for each additional weight increment
  min_order_amount?: number;
  max_order_amount?: number;
  estimated_days_min?: number;
  estimated_days_max?: number;
  is_active: boolean;
  is_default: boolean;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    weight_kg?: number;
    supplier_id: string;
  };
}

export interface ShippingCalculation {
  supplier_id: string;
  supplier_name: string;
  shipping_rate?: ShippingRate;
  shipping_amount: number;
  shipping_method: string;
  estimated_days_min?: number;
  estimated_days_max?: number;
  item_count?: number;
  total_weight_kg?: number;
  subtotal?: number;
  failure_reason?: string;
  available_rates?: Array<{
    id: string;
    name: string;
    rate_type: string;
    min_order_amount: number;
    max_order_amount: number;
    location_rates?: Array<{state?: string; country?: string; rate: number}>;
  }>;
}

export interface ShippingBreakdown {
  calculations: ShippingCalculation[];
  total_shipping_amount: number;
  total_estimated_days_min: number;
  total_estimated_days_max: number;
}

export class ShippingService {
  private supabase = getSupabaseClient();

  /**
   * Calculate shipping costs for all suppliers in the cart
   */
  async calculateShippingForCart(
    cartItems: CartItem[],
    shippingAddress: {
      state?: string;
      country?: string;
    }
  ): Promise<ShippingBreakdown> {
    // Group cart items by supplier
    const itemsBySupplier = this.groupItemsBySupplier(cartItems);
    
    const calculations: ShippingCalculation[] = [];
    let totalShippingAmount = 0;
    let totalEstimatedDaysMin = 0;
    let totalEstimatedDaysMax = 0;

    // Calculate shipping for each supplier
    for (const [supplierId, items] of Object.entries(itemsBySupplier)) {
      const calculation = await this.calculateSupplierShipping(
        supplierId,
        items,
        shippingAddress
      );
      
      if (calculation) {
        calculations.push(calculation);
        totalShippingAmount += calculation.shipping_amount;
        totalEstimatedDaysMin = Math.max(totalEstimatedDaysMin, calculation.estimated_days_min || 1);
        totalEstimatedDaysMax = Math.max(totalEstimatedDaysMax, calculation.estimated_days_max || 7);
      }
    }

    return {
      calculations,
      total_shipping_amount: totalShippingAmount,
      total_estimated_days_min: totalEstimatedDaysMin,
      total_estimated_days_max: totalEstimatedDaysMax
    };
  }

  /**
   * Group cart items by supplier
   */
  private groupItemsBySupplier(cartItems: CartItem[]): Record<string, CartItem[]> {
    return cartItems.reduce((acc, item) => {
      const supplierId = item.product.supplier_id;
      if (!acc[supplierId]) {
        acc[supplierId] = [];
      }
      acc[supplierId].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  }

  /**
   * Calculate shipping for a specific supplier
   */
  private async calculateSupplierShipping(
    supplierId: string,
    items: CartItem[],
    shippingAddress: { state?: string; country?: string }
  ): Promise<ShippingCalculation | null> {
    try {
      // Get supplier info
      const { data: supplier } = await this.supabase
        .from('suppliers')
        .select('id, company_name, state')
        .eq('id', supplierId)
        .single();

      if (!supplier) {
        return null;
      }

      // Get active shipping rates for this supplier
      const { data: shippingRates } = await this.supabase
        .from('supplier_shipping_rates')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (!shippingRates || shippingRates.length === 0) {
        return null;
      }


      // Calculate totals for this supplier
      const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const totalWeight = items.reduce((sum, item) => sum + ((item.product.weight_kg || 0) * item.quantity), 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      

      // Find the best shipping rate
      const bestRate = this.findBestShippingRate(shippingRates, subtotal, totalWeight, shippingAddress, supplier.state);

      if (!bestRate) {
        // Return detailed failure information
        return {
          supplier_id: supplierId,
          supplier_name: supplier.company_name || 'Unknown Supplier',
          shipping_amount: 0,
          shipping_method: 'No suitable rate found',
          failure_reason: this.getShippingFailureReason(shippingRates, subtotal, totalWeight, shippingAddress, supplier.state),
          available_rates: shippingRates.map((rate: ShippingRate) => ({
            id: rate.id,
            name: rate.name,
            rate_type: rate.rate_type,
            min_order_amount: rate.min_order_amount,
            max_order_amount: rate.max_order_amount,
            location_rates: rate.location_rates
          }))
        };
      }


      // Calculate shipping amount
      const shippingAmount = this.calculateShippingAmount(bestRate, subtotal, totalWeight, itemCount, shippingAddress);

      return {
        supplier_id: supplierId,
        supplier_name: supplier.company_name,
        shipping_rate: bestRate,
        shipping_amount: shippingAmount,
        shipping_method: bestRate.name,
        estimated_days_min: bestRate.estimated_days_min || 1,
        estimated_days_max: bestRate.estimated_days_max || 7,
        item_count: itemCount,
        total_weight_kg: totalWeight,
        subtotal: subtotal
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Get detailed failure reason for shipping calculation
   */
  private getShippingFailureReason(
    rates: ShippingRate[],
    subtotal: number,
    totalWeight: number,
    shippingAddress: { state?: string; country?: string },
    supplierState?: string
  ): string {
    const isSameState = supplierState && shippingAddress.state && 
                       supplierState.toLowerCase() === shippingAddress.state.toLowerCase();
    
    // Check for location issues FIRST (highest priority)
    if (isSameState) {
      const flatRates = rates.filter(rate => rate.rate_type === 'flat');
      if (flatRates.length === 0) {
        return `No same-state delivery rates available for ${shippingAddress.state}`;
      }
    } else {
      const locationRates = rates.filter(rate => rate.rate_type === 'location_based');
      if (locationRates.length === 0) {
        return `We currently don't deliver to ${shippingAddress.state || shippingAddress.country || 'your location'}. Please contact us or choose a different delivery address.`;
      }
      
      // Check if location rates have matching locations
      const hasMatchingLocation = locationRates.some(rate => 
        rate.location_rates?.some(locRate => 
          (shippingAddress.state && locRate.state && 
           locRate.state.toLowerCase() === shippingAddress.state.toLowerCase()) ||
          (shippingAddress.country && locRate.country && 
           locRate.country.toLowerCase() === shippingAddress.country.toLowerCase())
        )
      );
      
      if (!hasMatchingLocation) {
        return `We currently don't deliver to ${shippingAddress.state || shippingAddress.country || 'your location'}. Please contact us or choose a different delivery address.`;
      }
    }
    
    // Check for minimum order amount issues (after location validation)
    const minOrderIssues = rates.filter(rate => 
      rate.min_order_amount && rate.min_order_amount > 0 && subtotal < rate.min_order_amount
    );
    
    if (minOrderIssues.length > 0) {
      const minAmount = Math.min(...minOrderIssues.map(rate => rate.min_order_amount!));
      return `Order subtotal (₦${subtotal.toFixed(2)}) is below minimum order amount (₦${minAmount.toFixed(2)})`;
    }
    
    // Check for maximum order amount issues
    const maxOrderIssues = rates.filter(rate => 
      rate.max_order_amount && rate.max_order_amount > 0 && subtotal > rate.max_order_amount
    );
    
    if (maxOrderIssues.length > 0) {
      const maxAmount = Math.max(...maxOrderIssues.map(rate => rate.max_order_amount!));
      return `Order subtotal (₦${subtotal.toFixed(2)}) exceeds maximum order amount (₦${maxAmount.toFixed(2)})`;
    }
    
    return 'No suitable shipping rates found for this order';
  }

  /**
   * Find the best shipping rate based on order criteria
   */
  private findBestShippingRate(
    rates: ShippingRate[],
    subtotal: number,
    totalWeight: number,
    shippingAddress: { state?: string; country?: string },
    supplierState?: string
  ): ShippingRate | null {
    
    // Determine if customer and supplier are in the same state
    const isSameState = supplierState && shippingAddress.state && 
                       supplierState.toLowerCase() === shippingAddress.state.toLowerCase();
    
    // Filter rates that meet minimum requirements
    const eligibleRates = rates.filter(rate => {
      // Check minimum order amount
      if (rate.min_order_amount && subtotal < rate.min_order_amount) {
        return false;
      }
      
      // Check maximum order amount
      if (rate.max_order_amount && subtotal > rate.max_order_amount) {
        return false;
      }

      // Apply location-based rate selection logic
      if (rate.rate_type === 'flat') {
        // Flat rates should only be used when customer and supplier are in the same state
        if (!isSameState) {
          return false;
        }
      } else if (rate.rate_type === 'location_based') {
        // Location-based rates should be used for different states
        if (isSameState) {
          // Lower priority for same state (prefer flat rates)
        }
        
        if (!rate.location_rates) {
          return false;
        }
        
        
        const hasLocationRate = rate.location_rates.some(locationRate => {
          if (shippingAddress.state && locationRate.state && 
              locationRate.state.toLowerCase() === shippingAddress.state.toLowerCase()) {
            return true;
          }
          if (shippingAddress.country && locationRate.country && 
              locationRate.country.toLowerCase() === shippingAddress.country.toLowerCase()) {
            return true;
          }
          return false;
        });
        
        if (!hasLocationRate) {
          return false;
        } else {
          // Rate has matching location rate
        }
      }

      return true;
    });
    
    if (eligibleRates.length === 0) {
      return null;
    }

    // Priority logic: Same state = prefer flat rates, Different states = prefer location-based rates
    if (isSameState) {
      // Same state: prioritize flat rates over location-based rates
      const flatRates = eligibleRates.filter(rate => rate.rate_type === 'flat');
      const locationRates = eligibleRates.filter(rate => rate.rate_type === 'location_based');
      
      
      // Prefer flat rates for same state
      if (flatRates.length > 0) {
        const defaultFlatRate = flatRates.find(rate => rate.is_default);
        if (defaultFlatRate) {
          return defaultFlatRate;
        }
        return flatRates[0];
      }
      
      // Fallback to location-based rates if no flat rates available
      if (locationRates.length > 0) {
        const defaultLocationRate = locationRates.find(rate => rate.is_default);
        if (defaultLocationRate) {
          return defaultLocationRate;
        }
        return locationRates[0];
      }
    } else {
      // Different states: prioritize location-based rates
      const locationRates = eligibleRates.filter(rate => rate.rate_type === 'location_based');
      const flatRates = eligibleRates.filter(rate => rate.rate_type === 'flat');
      
      
      // Prefer location-based rates for different states
      if (locationRates.length > 0) {
        const defaultLocationRate = locationRates.find(rate => rate.is_default);
        if (defaultLocationRate) {
          return defaultLocationRate;
        }
        return locationRates[0];
      }
      
      // Fallback to flat rates if no location rates available
      if (flatRates.length > 0) {
        const defaultFlatRate = flatRates.find(rate => rate.is_default);
        if (defaultFlatRate) {
          return defaultFlatRate;
        }
        return flatRates[0];
      }
    }

    // Final fallback: return first eligible rate
    return eligibleRates[0];
  }

  /**
   * Calculate the actual shipping amount based on rate type
   */
  private calculateShippingAmount(
    rate: ShippingRate,
    subtotal: number,
    totalWeight: number,
    itemCount: number,
    shippingAddress: { state?: string; country?: string }
  ): number {

    switch (rate.rate_type) {
      case 'flat':
        const flatAmount = rate.flat_rate_amount || 0;
        const flatRateType = rate.flat_rate_type || 'per_item';
        
        let flatShipping;
        if (flatRateType === 'per_item') {
          // Charge per item: ₦500 × 3 items = ₦1,500
          flatShipping = flatAmount * itemCount;
        } else {
          // Charge per order: ₦500 regardless of quantity
          flatShipping = flatAmount;
        }
        
        return flatShipping;

      case 'weight_based':
        if (!rate.base_weight_kg || !rate.base_weight_rate) {
          return 0;
        }

        let shippingAmount = rate.base_weight_rate;
        
        if (totalWeight > rate.base_weight_kg && rate.additional_weight_kg && rate.additional_weight_rate) {
          const additionalWeight = totalWeight - rate.base_weight_kg;
          const additionalCharges = Math.ceil(additionalWeight / rate.additional_weight_kg) * rate.additional_weight_rate;
          shippingAmount += additionalCharges;
        }

        return shippingAmount;

      case 'location_based':
        // Check if we have granular location fields configured
        const hasGranularFields = rate.location_base_item_rate !== undefined && rate.location_additional_item_rate !== undefined;
        
        // If we have granular fields, we can proceed even without location_rates array
        if (!rate.location_rates && !hasGranularFields) {
          return 0;
        }

        // Find matching location rate (only if location_rates exists)
        let baseLocationRate = 0;
        if (rate.location_rates && rate.location_rates.length > 0) {
          for (const locationRate of rate.location_rates) {
            if (shippingAddress.state && locationRate.state && 
                locationRate.state.toLowerCase() === shippingAddress.state.toLowerCase()) {
              baseLocationRate = locationRate.rate;
              break;
            }
            if (shippingAddress.country && locationRate.country && 
                locationRate.country.toLowerCase() === shippingAddress.country.toLowerCase()) {
              baseLocationRate = locationRate.rate;
              break;
            }
          }

          // Fallback to first available rate
          if (baseLocationRate === 0) {
            baseLocationRate = rate.location_rates[0]?.rate || 0;
          }
        }

        // Apply location_rate_type (per_item or per_order)
        const locationRateType = rate.location_rate_type || 'per_item'; // Default to per_item
        let locationShipping;
        
        if (locationRateType === 'per_item') {
          // Use the new per-item pricing structure if available (including ₦0.00 rates)
          if (rate.location_base_item_rate !== undefined && rate.location_additional_item_rate !== undefined) {
            if (itemCount === 1) {
              locationShipping = rate.location_base_item_rate;
            } else {
              locationShipping = rate.location_base_item_rate + (rate.location_additional_item_rate * (itemCount - 1));
            }
          } else {
            // Fallback to simple per-item calculation using original location_rates
            locationShipping = baseLocationRate * itemCount;
          }
        } else {
          locationShipping = baseLocationRate; // per_order - fixed rate regardless of quantity
        }

        // Add weight-based pricing for location rates if configured and has non-zero values
        if (rate.location_base_weight_kg !== undefined && rate.location_base_weight_rate !== undefined && 
            rate.location_additional_weight_kg !== undefined && rate.location_additional_weight_rate !== undefined &&
            (rate.location_base_weight_kg > 0 || rate.location_base_weight_rate > 0 || 
             rate.location_additional_weight_kg > 0 || rate.location_additional_weight_rate > 0)) {
          
          const baseWeight = rate.location_base_weight_kg;
          const baseWeightRate = rate.location_base_weight_rate;
          const additionalWeight = rate.location_additional_weight_kg;
          const additionalWeightRate = rate.location_additional_weight_rate;
          
          if (totalWeight > baseWeight && additionalWeight > 0) {
            const excessWeight = totalWeight - baseWeight;
            const additionalWeightCharges = Math.ceil(excessWeight / additionalWeight);
            const weightShipping = baseWeightRate + (additionalWeightRate * additionalWeightCharges);
            
            
            // Add weight shipping to the base location shipping
            locationShipping += weightShipping;
          } else if (totalWeight > baseWeight && additionalWeight === 0) {
            // If additional weight increment is 0, just charge the base weight rate
            locationShipping += baseWeightRate;
          } else {
            // Weight within base limit, no additional charge
          }
        }
        
        return locationShipping;

      default:
        return 0;
    }
  }

  /**
   * Get shipping rates for a specific supplier (for admin interface)
   */
  async getSupplierShippingRates(supplierId: string): Promise<ShippingRate[]> {
    const { data, error } = await this.supabase
      .from('supplier_shipping_rates')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  /**
   * Create or update shipping rate for a supplier
   */
  async saveShippingRate(rateData: Partial<ShippingRate>): Promise<ShippingRate | null> {
    try {
      let result;
      
      if (rateData.id) {
        // Update existing rate
        const { data, error } = await this.supabase
          .from('supplier_shipping_rates')
          .update({
            ...rateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', rateData.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new rate
        const { data, error } = await this.supabase
          .from('supplier_shipping_rates')
          .insert(rateData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      return null;
    }
  }

  /**
   * Test function to debug shipping calculation
   * Can be called from browser console: window.shippingService.testShippingCalculation()
   */
  async testShippingCalculation(): Promise<void> {
    // Test data
    const testCartItems = [
      {
        id: 'test-item-1',
        quantity: 2,
        product: {
          id: 'test-product-1',
          name: 'Test Product',
          price: 100,
          supplier_id: '76f44bfe-e4ee-482c-96cc-faa91d48ada5', // Use your actual supplier ID
          weight_kg: 1
        }
      }
    ];
    
    const testAddress = {
      state: 'Lagos',
      country: 'Nigeria'
    };
    
    try {
      const result = await this.calculateShippingForCart(testCartItems, testAddress);
    } catch (error) {
      // Test error
    }
  }

  /**
   * Debug function to check supplier shipping rates
   * Can be called from browser console: window.shippingService.debugSupplierRates('supplier-id')
   */
  async debugSupplierRates(supplierId: string): Promise<void> {
    try {
      // Get supplier info
      const { data: supplier } = await this.supabase
        .from('suppliers')
        .select('id, company_name, state')
        .eq('id', supplierId)
        .single();
      
      if (!supplier) {
        return;
      }
      
      // Get all shipping rates (active and inactive)
      const { data: allRates } = await this.supabase
        .from('supplier_shipping_rates')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('is_default', { ascending: false });
      
      // Get only active rates
      const { data: activeRates } = await this.supabase
        .from('supplier_shipping_rates')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('is_active', true)
        .order('is_default', { ascending: false });
      
    } catch (error) {
      // Debug error
    }
  }
}

export const shippingService = new ShippingService();

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).shippingService = shippingService;
}
