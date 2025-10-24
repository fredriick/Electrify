import { getSupabaseClient } from './auth';

export interface SupplierProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  country: string | null;
  state: string | null;
  avatar_url: string | null;
  account_type: 'individual' | 'company';
  individual_first_name: string | null;
  individual_last_name: string | null;
  individual_phone: string | null;
  company_name: string | null;
  company_description: string | null;
  company_phone: string | null;
  company_website: string | null;
  company_address: string | null;
  contact_person: string | null;
  contact_person_phone: string | null;
  contact_person_email: string | null;
  business_license: string | null;
  tax_id: string | null;
  business_registration_number: string | null;
  business_type: string | null;
  industry_category: string | null;
  payment_info: any;
  bank_account_info: any;
  is_verified: boolean;
  is_active: boolean;
  verification_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verification_documents: any;
  notification_preferences: any;
  user_preferences: any;
  shop_name: string | null;
  created_at: string;
  updated_at: string;
  role: string;
}

export interface UpdateSupplierProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  state?: string;
  avatar_url?: string;
  account_type?: 'individual' | 'company';
  individual_first_name?: string;
  individual_last_name?: string;
  individual_phone?: string;
  company_name?: string;
  company_description?: string;
  company_phone?: string;
  company_website?: string;
  company_address?: string;
  contact_person?: string;
  contact_person_phone?: string;
  contact_person_email?: string;
  business_license?: string;
  tax_id?: string;
  business_registration_number?: string;
  business_type?: string;
  industry_category?: string;
  payment_info?: any;
  bank_account_info?: any;
  notification_preferences?: any;
  user_preferences?: any;
  shop_name?: string;
}

class SupplierService {
  private supabase = getSupabaseClient();

  async getSupplierProfile(userId: string): Promise<SupplierProfile | null> {
    try {
      console.log('SupplierService: Attempting to fetch supplier profile for user ID:', userId)
      
      const { data, error } = await this.supabase
        .from('suppliers')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('SupplierService: Error fetching supplier profile:', error);
        if (error.code === 'PGRST116') {
          console.log('SupplierService: PGRST116 error - no rows returned. This means the supplier profile does not exist for user ID:', userId);
        }
        return null;
      }

      console.log('SupplierService: Successfully fetched supplier profile:', data);
      return data;
    } catch (error) {
      console.error('SupplierService: Exception while fetching supplier profile:', error);
      return null;
    }
  }

  async updateSupplierProfile(userId: string, updates: UpdateSupplierProfileData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 SupplierService: Updating profile for user:', userId);
      console.log('🔍 SupplierService: Updates to apply:', updates);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      console.log('🔍 SupplierService: Final update data:', updateData);
      
      const { data, error } = await this.supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', userId)
        .select('id, user_preferences'); // Select the updated data to verify

      if (error) {
        console.error('❌ SupplierService: Error updating supplier profile:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ SupplierService: Update successful, returned data:', data);
      
      return { success: true };
    } catch (error) {
      console.error('❌ SupplierService: Exception updating supplier profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  async getSupplierStats(userId: string): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
  } | null> {
    try {
      // Get total products
      const { data: products, error: productsError } = await this.supabase
        .from('products')
        .select('id')
        .eq('supplier_id', userId);

      if (productsError) {
        console.error('Error fetching products:', productsError);
        return null;
      }

      // Get total orders and revenue
      const { data: orders, error: ordersError } = await this.supabase
        .from('orders')
        .select('total_amount, status')
        .eq('supplier_id', userId);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return null;
      }

      // Get average rating
      const { data: reviews, error: reviewsError } = await this.supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', userId); // This should be product_id, but we need to join with products

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        return null;
      }

      const totalProducts = products?.length || 0;
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0;
      const averageRating = reviews?.length > 0 
        ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / reviews.length 
        : 0;

      return {
        totalProducts,
        totalOrders,
        totalRevenue,
        averageRating
      };
    } catch (error) {
      console.error('Error fetching supplier stats:', error);
      return null;
    }
  }
}

export const supplierService = new SupplierService(); 