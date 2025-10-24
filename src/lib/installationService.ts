import { getSupabaseClient } from './auth';

export interface InstallationService {
  id: string;
  name: string;
  description: string;
  base_price: number | null;
  supplier_price: number | null;
  price_adjustment_percent: number;
  is_custom: boolean;
  is_active: boolean;
  supplier_id: string;
  created_at: string;
  updated_at: string;
}

export interface CustomInstallationQuote {
  id: string;
  order_id: string;
  customer_id: string;
  supplier_id: string;
  requested_amount: number | null;
  quoted_amount: number | null;
  final_amount: number | null;
  status: 'pending' | 'quoted' | 'approved' | 'rejected';
  notes: string | null;
  customer_notes: string | null;
  created_at: string;
  updated_at: string;
  quoted_by: string | null;
  approved_by: string | null;
}

class InstallationServiceManager {
  private supabase = getSupabaseClient();

  // Get all active installation services for a supplier
  async getSupplierServices(supplierId: string): Promise<{ data: InstallationService[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('installation_services')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('is_active', true)
        .order('name');

      return { data, error };
    } catch (error) {
      console.error('Error fetching supplier installation services:', error);
      return { data: null, error };
    }
  }

  // Get all active installation services (for customers to see)
  async getAllActiveServices(): Promise<{ data: InstallationService[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('installation_services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      return { data, error };
    } catch (error) {
      console.error('Error fetching installation services:', error);
      return { data: null, error };
    }
  }

  // Update supplier's installation service price
  async updateSupplierPrice(serviceId: string, newPrice: number): Promise<{ data: InstallationService | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('installation_services')
        .update({ 
          supplier_price: newPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating supplier price:', error);
      return { data: null, error };
    }
  }

  // Admin: Update base prices for all suppliers
  async updateBasePrices(serviceName: string, newBasePrice: number): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('update_base_prices', {
          service_name: serviceName,
          new_base_price: newBasePrice
        });

      return { data, error };
    } catch (error) {
      console.error('Error updating base prices:', error);
      return { data: null, error };
    }
  }

  // Create default installation services for a new supplier
  async createDefaultServices(supplierId: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('create_default_installation_services', {
          supplier_uuid: supplierId
        });

      return { data, error };
    } catch (error) {
      console.error('Error creating default services:', error);
      return { data: null, error };
    }
  }

  // Custom Installation Quotes
  async createCustomQuote(quoteData: {
    order_id: string;
    customer_id: string;
    supplier_id: string;
    requested_amount?: number;
    customer_notes?: string;
  }): Promise<{ data: CustomInstallationQuote | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('custom_installation_quotes')
        .insert({
          ...quoteData,
          status: 'pending'
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating custom quote:', error);
      return { data: null, error };
    }
  }

  // Get custom quotes for a supplier
  async getSupplierQuotes(supplierId: string): Promise<{ data: CustomInstallationQuote[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('custom_installation_quotes')
        .select(`
          *,
          orders:order_id (
            id,
            order_number,
            total_amount,
            status
          ),
          customers:customer_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching supplier quotes:', error);
      return { data: null, error };
    }
  }

  // Get custom quotes for a customer
  async getCustomerQuotes(customerId: string): Promise<{ data: CustomInstallationQuote[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('custom_installation_quotes')
        .select(`
          *,
          orders:order_id (
            id,
            order_number,
            total_amount,
            status
          ),
          suppliers:supplier_id (
            id,
            business_name,
            contact_email
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching customer quotes:', error);
      return { data: null, error };
    }
  }

  // Update custom quote (supplier provides quote)
  async updateCustomQuote(quoteId: string, updateData: {
    quoted_amount?: number;
    notes?: string;
    status?: 'quoted' | 'approved' | 'rejected';
  }): Promise<{ data: CustomInstallationQuote | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('custom_installation_quotes')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating custom quote:', error);
      return { data: null, error };
    }
  }

  // Customer approves/rejects quote
  async approveRejectQuote(quoteId: string, action: 'approve' | 'reject', finalAmount?: number): Promise<{ data: CustomInstallationQuote | null; error: any }> {
    try {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        updated_at: new Date().toISOString()
      };

      if (action === 'approve' && finalAmount) {
        updateData.final_amount = finalAmount;
      }

      const { data, error } = await this.supabase
        .from('custom_installation_quotes')
        .update(updateData)
        .eq('id', quoteId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error approving/rejecting quote:', error);
      return { data: null, error };
    }
  }
}

export const installationService = new InstallationServiceManager();

