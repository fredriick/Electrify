import { getSupabaseClient } from './auth';

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joinDate: string;
  lastLogin: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  averageRating: number;
  lastOrderDate?: string;
  preferredPaymentMethod: string;
  isVerified: boolean;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  blockedCustomers: number;
  pendingVerification: number;
}

class AdminCustomerService {
  async getAllCustomers(): Promise<AdminCustomer[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminCustomerService: Fetching all customers...');

      // Fetch customers from customers table
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('❌ Error fetching customers:', customersError);
        throw customersError;
      }

      console.log('🔍 AdminCustomerService: Customers fetched:', customers?.length || 0);

      // Transform customers and fetch additional data
      const customersWithStats: AdminCustomer[] = await Promise.all(
        (customers || []).map(async (customer: any) => {
          // Fetch customer orders to calculate stats
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, total_amount, created_at, status')
            .eq('user_id', customer.id);

          if (ordersError) {
            console.warn('⚠️ Error fetching orders for customer:', customer.id, ordersError);
          }

          // Calculate customer stats
          const customerOrders = orders || [];
          const totalOrders = customerOrders.length;
          const totalSpent = customerOrders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
          const lastOrderDate = customerOrders.length > 0 
            ? customerOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : undefined;

          // Get location from customer data (using state and country if available)
          const location = customer.state && customer.country 
            ? `${customer.state}, ${customer.country}`
            : customer.country || 'Unknown Location';

          return {
            id: customer.id,
            name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown Customer',
            email: customer.email,
            phone: customer.phone || 'N/A',
            status: customer.is_active ? 'active' : 'inactive',
            joinDate: customer.created_at,
            lastLogin: customer.updated_at, // Using updated_at as proxy for last login
            location,
            totalOrders,
            totalSpent,
            averageRating: 0, // TODO: Implement rating system
            lastOrderDate,
            preferredPaymentMethod: 'Credit Card', // TODO: Get from payment preferences
            isVerified: customer.is_verified || false
          };
        })
      );

      console.log('✅ AdminCustomerService: Customers with stats processed:', customersWithStats.length);
      return customersWithStats;

    } catch (error) {
      console.error('❌ AdminCustomerService: Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async getCustomerStats(): Promise<CustomerStats> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminCustomerService: Fetching customer stats...');

      // Get all customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, is_active, is_verified');

      if (customersError) {
        console.error('❌ Error fetching customers for stats:', customersError);
        throw customersError;
      }

      // Get all orders for revenue calculation
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total_amount, status')
        .eq('status', 'SHIPPED'); // Only count shipped orders for revenue

      if (ordersError) {
        console.error('❌ Error fetching orders for stats:', ordersError);
        throw ordersError;
      }

      // Calculate stats
      const totalCustomers = customers?.length || 0;
      const activeCustomers = customers?.filter((c: any) => c.is_active).length || 0;
      const blockedCustomers = customers?.filter((c: any) => !c.is_active).length || 0;
      const pendingVerification = customers?.filter((c: any) => !c.is_verified).length || 0;

      console.log('✅ AdminCustomerService: Customer stats calculated:', {
        totalCustomers,
        activeCustomers,
        blockedCustomers,
        pendingVerification
      });

      return {
        totalCustomers,
        activeCustomers,
        blockedCustomers,
        pendingVerification
      };

    } catch (error) {
      console.error('❌ AdminCustomerService: Error fetching customer stats:', error);
      throw new Error('Failed to fetch customer stats');
    }
  }

  async updateCustomerStatus(customerId: string, status: 'active' | 'inactive'): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminCustomerService: Updating customer status:', { customerId, status });

      const { error } = await supabase
        .from('customers')
        .update({ is_active: status === 'active' })
        .eq('id', customerId);

      if (error) {
        console.error('❌ AdminCustomerService: Error updating customer status:', error);
        return false;
      }

      console.log('✅ AdminCustomerService: Customer status updated successfully');
      return true;

    } catch (error) {
      console.error('❌ AdminCustomerService: Error updating customer status:', error);
      return false;
    }
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminCustomerService: Deleting customer:', customerId);

      // Delete from customers table (this will cascade to users table)
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) {
        console.error('❌ AdminCustomerService: Error deleting customer:', error);
        return false;
      }

      console.log('✅ AdminCustomerService: Customer deleted successfully');
      return true;

    } catch (error) {
      console.error('❌ AdminCustomerService: Error deleting customer:', error);
      return false;
    }
  }
}

export const adminCustomerService = new AdminCustomerService();
