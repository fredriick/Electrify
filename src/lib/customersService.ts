import { supabase } from './auth';

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  state?: string;
  avatar_url?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role: string;
  // Computed fields from orders
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string;
  status: 'active' | 'inactive';
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  avgOrders: number;
}

class CustomersService {
  async getCustomers(supplierId: string): Promise<Customer[]> {
    const supabaseClient = supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Get all orders for this supplier
      const { data: orders, error: ordersError } = await supabaseClient
        .from('orders')
        .select('id, customer_id, total_amount, created_at')
        .eq('supplier_id', supplierId);

      if (ordersError) {
        console.error('Error fetching orders for customers:', ordersError);
        return [];
      }

      if (!orders || orders.length === 0) {
        return [];
      }

      // Get unique customer IDs
      const customerIds = Array.from(new Set((orders || []).map((order: any) => order.customer_id)));

      // Fetch customer details
      const { data: customers, error: customersError } = await supabaseClient
        .from('customers')
        .select('id, email, first_name, last_name, phone, country, state, avatar_url, is_verified, is_active, created_at, updated_at, role')
        .in('id', customerIds);

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        return [];
      }

      // Group orders by customer and calculate stats
      const customerStats: { [key: string]: { orders: any[]; totalSpent: number; lastOrder?: string } } = {};
      
      (orders || []).forEach((order: any) => {
        const customerId = order.customer_id;
        if (!customerStats[customerId]) {
          customerStats[customerId] = { orders: [], totalSpent: 0 };
        }
        
        customerStats[customerId].orders.push(order);
        customerStats[customerId].totalSpent += Number(order.total_amount);
        
        // Track last order date
        const orderDate = new Date(order.created_at);
        if (!customerStats[customerId].lastOrder || orderDate > new Date(customerStats[customerId].lastOrder)) {
          customerStats[customerId].lastOrder = order.created_at;
        }
      });

      // Convert to Customer objects
      const customersList: Customer[] = [];

      (customers || []).forEach((customer: any) => {
        const stats = customerStats[customer.id] || { orders: [], totalSpent: 0 };
        
        customersList.push({
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          country: customer.country,
          state: customer.state,
          avatar_url: customer.avatar_url,
          is_verified: customer.is_verified,
          is_active: customer.is_active,
          created_at: customer.created_at,
          updated_at: customer.updated_at,
          role: customer.role,
          totalOrders: stats.orders.length,
          totalSpent: stats.totalSpent,
          lastOrder: stats.lastOrder,
          status: customer.is_active ? 'active' : 'inactive'
        });
      });

      return customersList;
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }

  async getCustomerStats(supplierId: string): Promise<CustomerStats> {
    const supabaseClient = supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Get all orders for this supplier
      const { data: orders, error: ordersError } = await supabaseClient
        .from('orders')
        .select('customer_id, total_amount, created_at')
        .eq('supplier_id', supplierId);

      if (ordersError) {
        console.error('Error fetching orders for stats:', ordersError);
        return this.getDefaultStats();
      }

      // Calculate stats
      const uniqueCustomers = new Set((orders || []).map((order: any) => order.customer_id));
      const totalCustomers = uniqueCustomers.size;
      
      // Count active customers (those with orders in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeCustomers = new Set(
        (orders || [])
          .filter((order: any) => new Date(order.created_at) >= thirtyDaysAgo)
          .map((order: any) => order.customer_id)
      ).size;

      // Count new customers this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const newThisMonth = new Set(
        (orders || [])
          .filter((order: any) => new Date(order.created_at) >= thisMonth)
          .map((order: any) => order.customer_id)
      ).size;

      // Calculate average orders per customer
      const totalOrders = (orders || []).length;
      const avgOrders = totalCustomers > 0 ? totalOrders / totalCustomers : 0;

      return {
        totalCustomers,
        activeCustomers,
        newThisMonth,
        avgOrders: Math.round(avgOrders * 10) / 10 // Round to 1 decimal place
      };
    } catch (error) {
      console.error('Error calculating customer stats:', error);
      return this.getDefaultStats();
    }
  }

  private getDefaultStats(): CustomerStats {
    return {
      totalCustomers: 0,
      activeCustomers: 0,
      newThisMonth: 0,
      avgOrders: 0
    };
  }

  // Helper function to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Helper function to format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Helper function to get customer initials
  getCustomerInitials(firstName?: string, lastName?: string): string {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }
    return '?';
  }

  // Helper function to get customer full name
  getCustomerName(firstName?: string, lastName?: string): string {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }
    return 'Unknown Customer';
  }

  // Helper function to get customer location
  getCustomerLocation(country?: string, state?: string): string {
    if (country && state) {
      return `${state}, ${country}`;
    } else if (country) {
      return country;
    } else if (state) {
      return state;
    }
    return 'Unknown Location';
  }
}

export const customersService = new CustomersService(); 