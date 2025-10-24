import { getSupabaseClient } from './auth';

export interface AdminSupplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joinDate: string;
  lastLogin: string;
  location: string;
  company: string;
  totalProducts: number;
  totalSales: number;
  averageRating: number;
  commissionRate: number;
  isVerified: boolean;
  isPremium: boolean;
  categories: string[];
  lastOrderDate?: string;
}

export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  pendingVerification: number;
  totalProducts: number;
}

class AdminSupplierService {
  async getAllSuppliers(): Promise<AdminSupplier[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminSupplierService: Fetching all suppliers...');

      // Fetch suppliers from suppliers table
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (suppliersError) {
        console.error('❌ Error fetching suppliers:', suppliersError);
        throw suppliersError;
      }

      console.log('🔍 AdminSupplierService: Suppliers fetched:', suppliers?.length || 0);

      // Transform suppliers and fetch additional data
      const suppliersWithStats: AdminSupplier[] = await Promise.all(
        (suppliers || []).map(async (supplier: any) => {
          // Fetch supplier products to calculate stats
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, created_at')
            .eq('supplier_id', supplier.id);

          if (productsError) {
            console.warn('⚠️ Error fetching products for supplier:', supplier.id, productsError);
          }

          // Fetch supplier orders to calculate sales
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
              id,
              total_amount,
              created_at,
              status,
              order_items!inner(
                product_id,
                products!inner(
                  supplier_id
                )
              )
            `)
            .eq('order_items.products.supplier_id', supplier.id)
            .eq('status', 'SHIPPED'); // Only count shipped orders for sales

          if (ordersError) {
            console.warn('⚠️ Error fetching orders for supplier:', supplier.id, ordersError);
          }

          // Calculate supplier stats
          const supplierProducts = products || [];
          const supplierOrders = orders || [];
          const totalProducts = supplierProducts.length;
          const totalSales = supplierOrders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
          const lastOrderDate = supplierOrders.length > 0 
            ? supplierOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : undefined;

          // Get location from supplier data (using state and country if available)
          const location = supplier.state && supplier.country 
            ? `${supplier.state}, ${supplier.country}`
            : supplier.country || 'Unknown Location';

          // Determine company name based on account type
          const company = supplier.account_type === 'company' 
            ? supplier.company_name || 'Unknown Company'
            : `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim() || 'Individual Seller';

          // Determine supplier name
          const name = supplier.account_type === 'company' 
            ? supplier.contact_person || `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim() || 'Unknown Contact'
            : `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim() || 'Unknown Supplier';

          // Get phone number based on account type
          const phone = supplier.account_type === 'company' 
            ? supplier.company_phone || supplier.individual_phone || 'N/A'
            : supplier.individual_phone || supplier.company_phone || 'N/A';

          // Determine status based on verification and active status
          let status: 'active' | 'inactive' | 'pending' | 'suspended' = 'active';
          if (!supplier.is_active) {
            status = 'inactive';
          } else if (!supplier.is_verified) {
            status = 'pending';
          } else if (supplier.verification_status === 'suspended') {
            status = 'suspended';
          }

          // Get categories from products (simplified for now)
          const categories = ['Solar Panels', 'Inverters', 'Batteries']; // TODO: Get from actual product categories

          return {
            id: supplier.id,
            name,
            email: supplier.email,
            phone,
            status,
            joinDate: supplier.created_at,
            lastLogin: supplier.updated_at, // Using updated_at as proxy for last login
            location,
            company,
            totalProducts,
            totalSales,
            averageRating: 0, // TODO: Implement rating system
            commissionRate: 8.5, // TODO: Get from actual commission rates
            isVerified: supplier.is_verified || false,
            isPremium: false, // TODO: Implement premium status
            categories,
            lastOrderDate
          };
        })
      );

      console.log('✅ AdminSupplierService: Suppliers with stats processed:', suppliersWithStats.length);
      return suppliersWithStats;

    } catch (error) {
      console.error('❌ AdminSupplierService: Error fetching suppliers:', error);
      throw new Error('Failed to fetch suppliers');
    }
  }

  async getSupplierStats(): Promise<SupplierStats> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminSupplierService: Fetching supplier stats...');

      // Get all suppliers
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, is_active, is_verified');

      if (suppliersError) {
        console.error('❌ Error fetching suppliers for stats:', suppliersError);
        throw suppliersError;
      }

      // Get total products count
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id');

      if (productsError) {
        console.error('❌ Error fetching products for stats:', productsError);
        throw productsError;
      }

      // Calculate stats
      const totalSuppliers = suppliers?.length || 0;
      const activeSuppliers = suppliers?.filter((s: any) => s.is_active).length || 0;
      const pendingVerification = suppliers?.filter((s: any) => !s.is_verified).length || 0;
      const totalProducts = products?.length || 0;

      console.log('✅ AdminSupplierService: Supplier stats calculated:', {
        totalSuppliers,
        activeSuppliers,
        pendingVerification,
        totalProducts
      });

      return {
        totalSuppliers,
        activeSuppliers,
        pendingVerification,
        totalProducts
      };

    } catch (error) {
      console.error('❌ AdminSupplierService: Error fetching supplier stats:', error);
      throw new Error('Failed to fetch supplier stats');
    }
  }

  async updateSupplierStatus(supplierId: string, status: 'active' | 'inactive'): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminSupplierService: Updating supplier status:', { supplierId, status });

      const { error } = await supabase
        .from('suppliers')
        .update({ is_active: status === 'active' })
        .eq('id', supplierId);

      if (error) {
        console.error('❌ AdminSupplierService: Error updating supplier status:', error);
        return false;
      }

      console.log('✅ AdminSupplierService: Supplier status updated successfully');
      return true;

    } catch (error) {
      console.error('❌ AdminSupplierService: Error updating supplier status:', error);
      return false;
    }
  }

  async deleteSupplier(supplierId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminSupplierService: Deleting supplier:', supplierId);

      // Delete from suppliers table (this will cascade to users table)
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) {
        console.error('❌ AdminSupplierService: Error deleting supplier:', error);
        return false;
      }

      console.log('✅ AdminSupplierService: Supplier deleted successfully');
      return true;

    } catch (error) {
      console.error('❌ AdminSupplierService: Error deleting supplier:', error);
      return false;
    }
  }
}

export const adminSupplierService = new AdminSupplierService();


