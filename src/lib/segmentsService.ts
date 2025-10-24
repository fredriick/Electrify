import { supabase } from './auth';

export interface CustomerSegment {
  name: string;
  description: string;
  customers: number;
  percentage: number;
  color: string;
  totalSpent: number;
  averageOrderValue: number;
}

export interface SegmentStats {
  totalCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  segments: CustomerSegment[];
}

class SegmentsService {
  async getCustomerSegments(supplierId: string): Promise<SegmentStats> {
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
        console.error('Error fetching orders for segments:', ordersError);
        return this.getDefaultStats();
      }

      if (!orders || orders.length === 0) {
        return this.getDefaultStats();
      }

      // Get unique customer IDs
      const customerIds = Array.from(new Set((orders || []).map((order: any) => order.customer_id)));

      // Fetch customer details
      const { data: customers, error: customersError } = await supabaseClient
        .from('customers')
        .select('id, email, first_name, last_name, country, state')
        .in('id', customerIds);

      if (customersError) {
        console.error('Error fetching customers for segments:', customersError);
        return this.getDefaultStats();
      }

      // Group orders by customer and calculate stats
      const customerStats: { [key: string]: { orders: any[]; totalSpent: number } } = {};
      
      (orders || []).forEach((order: any) => {
        const customerId = order.customer_id;
        if (!customerStats[customerId]) {
          customerStats[customerId] = { orders: [], totalSpent: 0 };
        }
        
        customerStats[customerId].orders.push(order);
        customerStats[customerId].totalSpent += Number(order.total_amount);
      });

      // Segment customers based on order value and location
      const segments = this.segmentCustomers(customers || [], customerStats);

      // Calculate overall stats
      const totalCustomers = (customers || []).length;
      const totalRevenue = (orders || []).reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);
      const averageOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

      return {
        totalCustomers,
        totalRevenue,
        averageOrderValue,
        segments
      };
    } catch (error) {
      console.error('Error calculating customer segments:', error);
      return this.getDefaultStats();
    }
  }

  private segmentCustomers(customers: any[], customerStats: { [key: string]: { orders: any[]; totalSpent: number } }): CustomerSegment[] {
    const segments = {
      residential: { customers: 0, totalSpent: 0, orders: 0 },
      commercial: { customers: 0, totalSpent: 0, orders: 0 },
      industrial: { customers: 0, totalSpent: 0, orders: 0 }
    };

    customers.forEach(customer => {
      const stats = customerStats[customer.id] || { orders: [], totalSpent: 0 };
      const totalSpent = stats.totalSpent;
      const orderCount = stats.orders.length;

      // Segment based on order value and frequency
      if (totalSpent < 1000 || orderCount === 1) {
        segments.residential.customers++;
        segments.residential.totalSpent += totalSpent;
        segments.residential.orders += orderCount;
      } else if (totalSpent < 5000) {
        segments.commercial.customers++;
        segments.commercial.totalSpent += totalSpent;
        segments.commercial.orders += orderCount;
      } else {
        segments.industrial.customers++;
        segments.industrial.totalSpent += totalSpent;
        segments.industrial.orders += orderCount;
      }
    });

    const totalCustomers = customers.length;

    return [
      {
        name: 'Residential',
        description: 'Homeowners and individuals purchasing for personal use.',
        customers: segments.residential.customers,
        percentage: totalCustomers > 0 ? Math.round((segments.residential.customers / totalCustomers) * 100) : 0,
        color: 'bg-blue-500',
        totalSpent: segments.residential.totalSpent,
        averageOrderValue: segments.residential.customers > 0 ? segments.residential.totalSpent / segments.residential.customers : 0
      },
      {
        name: 'Commercial',
        description: 'Businesses and organizations purchasing for commercial properties.',
        customers: segments.commercial.customers,
        percentage: totalCustomers > 0 ? Math.round((segments.commercial.customers / totalCustomers) * 100) : 0,
        color: 'bg-green-500',
        totalSpent: segments.commercial.totalSpent,
        averageOrderValue: segments.commercial.customers > 0 ? segments.commercial.totalSpent / segments.commercial.customers : 0
      },
      {
        name: 'Industrial',
        description: 'Large-scale buyers and industrial clients.',
        customers: segments.industrial.customers,
        percentage: totalCustomers > 0 ? Math.round((segments.industrial.customers / totalCustomers) * 100) : 0,
        color: 'bg-purple-500',
        totalSpent: segments.industrial.totalSpent,
        averageOrderValue: segments.industrial.customers > 0 ? segments.industrial.totalSpent / segments.industrial.customers : 0
      }
    ];
  }

  private getDefaultStats(): SegmentStats {
    return {
      totalCustomers: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      segments: [
        {
          name: 'Residential',
          description: 'Homeowners and individuals purchasing for personal use.',
          customers: 0,
          percentage: 0,
          color: 'bg-blue-500',
          totalSpent: 0,
          averageOrderValue: 0
        },
        {
          name: 'Commercial',
          description: 'Businesses and organizations purchasing for commercial properties.',
          customers: 0,
          percentage: 0,
          color: 'bg-green-500',
          totalSpent: 0,
          averageOrderValue: 0
        },
        {
          name: 'Industrial',
          description: 'Large-scale buyers and industrial clients.',
          customers: 0,
          percentage: 0,
          color: 'bg-purple-500',
          totalSpent: 0,
          averageOrderValue: 0
        }
      ]
    };
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
}

export const segmentsService = new SegmentsService(); 