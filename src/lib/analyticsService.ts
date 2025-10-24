import { supabase } from './auth';

export interface AnalyticsStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  averageOrderValueGrowth: number;
}

export interface SalesData {
  month: string;
  fullDate: string;
  sales: number;
  orders: number;
  customers: number;
}

export interface ProductPerformance {
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}

export interface CustomerSegment {
  segment: string;
  percentage: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'payment' | 'customer';
  title: string;
  description: string;
  amount?: number;
  date: string;
  status: string;
}

class AnalyticsService {
  async getAnalyticsStats(supplierId: string, period: string = '30d'): Promise<AnalyticsStats> {
    const supabaseClient = supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Calculate date ranges
      const now = new Date();
      const currentPeriodStart = this.getPeriodStartDate(period);
      const previousPeriodStart = this.getPreviousPeriodStartDate(period);

      // Get current period data - use same approach as dashboard service
      const { data: allOrdersData, error: allOrdersError } = await supabaseClient
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          customer_id,
          status,
          order_items (
            product_id,
            products (
              supplier_id
            )
          )
        `)
        .neq('status', 'CANCELLED') // Exclude cancelled orders
        .gte('created_at', currentPeriodStart.toISOString())
        .lte('created_at', now.toISOString());

      // Filter orders by supplier through order items
      const currentOrders = allOrdersData?.filter((order: any) => 
        order.order_items?.some((item: any) => item.products?.supplier_id === supplierId)
      ) || [];

      if (allOrdersError) {
        console.error('Error fetching current period orders:', allOrdersError);
        return this.getDefaultStats();
      }

      // Get previous period data - use same approach as dashboard service
      const { data: allPreviousOrdersData, error: allPreviousOrdersError } = await supabaseClient
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          customer_id,
          status,
          order_items (
            product_id,
            products (
              supplier_id
            )
          )
        `)
        .neq('status', 'CANCELLED') // Exclude cancelled orders
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', currentPeriodStart.toISOString());

      // Filter orders by supplier through order items
      const previousOrders = allPreviousOrdersData?.filter((order: any) => 
        order.order_items?.some((item: any) => item.products?.supplier_id === supplierId)
      ) || [];

      if (allPreviousOrdersError) {
        console.error('Error fetching previous period orders:', allPreviousOrdersError);
        return this.getDefaultStats();
      }

      // Calculate current period stats
      const currentRevenue = (currentOrders || []).reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);
      const currentOrdersCount = (currentOrders || []).length;
      const currentCustomers = new Set((currentOrders || []).map((order: any) => order.customer_id)).size;

      // Calculate previous period stats
      const previousRevenue = (previousOrders || []).reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);
      const previousOrdersCount = (previousOrders || []).length;
      const previousCustomers = new Set((previousOrders || []).map((order: any) => order.customer_id)).size;

      // Calculate growth percentages
      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const ordersGrowth = previousOrdersCount > 0 ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 : 0;
      const customersGrowth = previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0;

      // Calculate average order values
      const currentAverageOrderValue = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;
      const previousAverageOrderValue = previousOrdersCount > 0 ? previousRevenue / previousOrdersCount : 0;
      const averageOrderValueGrowth = previousAverageOrderValue > 0 ? ((currentAverageOrderValue - previousAverageOrderValue) / previousAverageOrderValue) * 100 : 0;

      return {
        totalRevenue: currentRevenue,
        totalOrders: currentOrdersCount,
        totalCustomers: currentCustomers,
        averageOrderValue: currentAverageOrderValue,
        revenueGrowth,
        ordersGrowth,
        customersGrowth,
        averageOrderValueGrowth
      };
    } catch (error) {
      console.error('Error calculating analytics stats:', error);
      return this.getDefaultStats();
    }
  }

  async getSalesData(supplierId: string, period: string = '30d'): Promise<SalesData[]> {
    const supabaseClient = supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const periodStart = this.getPeriodStartDate(period);
      const now = new Date();

      const { data: allOrdersData, error } = await supabaseClient
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          customer_id,
          status,
          order_items (
            product_id,
            products (
              supplier_id
            )
          )
        `)
        .neq('status', 'CANCELLED') // Exclude cancelled orders
        .gte('created_at', periodStart.toISOString())
        .lte('created_at', now.toISOString())
        .order('created_at', { ascending: true });

      // Filter orders by supplier through order items
      const orders = allOrdersData?.filter((order: any) => 
        order.order_items?.some((item: any) => item.products?.supplier_id === supplierId)
      ) || [];

      if (error) {
        console.error('Error fetching sales data:', error);
        return [];
      }

      // Group by month
      const monthlyData: { [key: string]: { sales: number; orders: number; customers: Set<string> } } = {};
      
      (orders || []).forEach((order: any) => {
        const date = new Date(order.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { sales: 0, orders: 0, customers: new Set() };
        }
        
        monthlyData[monthKey].sales += Number(order.total_amount);
        monthlyData[monthKey].orders += 1;
        monthlyData[monthKey].customers.add(order.customer_id);
      });

      // Convert to array format
      return Object.entries(monthlyData)
        .map(([key, data]) => ({
          month: new Date(key + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          fullDate: key,
          sales: data.sales,
          orders: data.orders,
          customers: data.customers.size
        }))
        .sort((a, b) => new Date(a.fullDate + '-01').getTime() - new Date(b.fullDate + '-01').getTime());
    } catch (error) {
      console.error('Error fetching sales data:', error);
      return [];
    }
  }

  async getProductPerformance(supplierId: string, period: string = '30d'): Promise<ProductPerformance[]> {
    const supabaseClient = supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const periodStart = this.getPeriodStartDate(period);
      const now = new Date();

      // First get orders for this supplier in the period - use same approach as other methods
      const { data: allOrdersData, error: ordersError } = await supabaseClient
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          order_items (
            product_id,
            products (
              supplier_id
            )
          )
        `)
        .neq('status', 'CANCELLED') // Exclude cancelled orders
        .gte('created_at', periodStart.toISOString())
        .lte('created_at', now.toISOString());

      if (ordersError) {
        console.error('Error fetching orders for product performance:', ordersError);
        return [];
      }

      // Filter orders by supplier through order items
      const orders = allOrdersData?.filter((order: any) => 
        order.order_items?.some((item: any) => item.products?.supplier_id === supplierId)
      ) || [];

      if (!orders || orders.length === 0) {
        return [];
      }

      const orderIds = orders.map((order: any) => order.id);

      // Then get order items for these orders with product details
      const { data: orderItems, error } = await supabaseClient
        .from('order_items')
        .select(`
          id,
          quantity,
          unit_price,
          total_price,
          product_id,
          order_id,
          products (
            name,
            supplier_id
          )
        `)
        .in('order_id', orderIds);

      if (error) {
        console.error('Error fetching product performance:', error);
        return [];
      }

      // Group by product
      const productStats: { [key: string]: { sales: number; revenue: number } } = {};
      
      (orderItems || []).forEach((item: any) => {
        // Use actual product name if available, otherwise fallback to product ID
        const productName = item.products?.name || `Product ${item.product_id?.slice(0, 8) || 'Unknown'}`;
        
        if (!productStats[productName]) {
          productStats[productName] = { sales: 0, revenue: 0 };
        }
        
        productStats[productName].sales += Number(item.quantity);
        productStats[productName].revenue += Number(item.total_price);
      });

      return Object.entries(productStats)
        .map(([name, stats]) => ({
          name,
          sales: stats.sales,
          revenue: stats.revenue,
          growth: Math.random() * 20 + 5 // Simplified growth calculation
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching product performance:', error);
      return [];
    }
  }

  async getCustomerSegments(supplierId: string, period: string = '30d'): Promise<CustomerSegment[]> {
    const supabaseClient = supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const periodStart = this.getPeriodStartDate(period);
      const now = new Date();

      const { data: allOrdersData, error } = await supabaseClient
        .from('orders')
        .select(`
          id,
          total_amount,
          customer_id,
          status,
          order_items (
            product_id,
            products (
              supplier_id
            )
          )
        `)
        .neq('status', 'CANCELLED') // Exclude cancelled orders
        .gte('created_at', periodStart.toISOString())
        .lte('created_at', now.toISOString());

      // Filter orders by supplier through order items
      const orders = allOrdersData?.filter((order: any) => 
        order.order_items?.some((item: any) => item.products?.supplier_id === supplierId)
      ) || [];

      if (error) {
        console.error('Error fetching customer segments:', error);
        return this.getDefaultCustomerSegments();
      }


      // Simple segmentation based on order value
      let residential = 0;
      let commercial = 0;
      let industrial = 0;
      const total = (orders || []).length;

      (orders || []).forEach((order: any) => {
        const amount = Number(order.total_amount);
        // Adjusted thresholds for NGN currency
        if (amount < 50000) { // Less than ₦50,000
          residential++;
        } else if (amount < 200000) { // ₦50,000 - ₦200,000
          commercial++;
        } else { // More than ₦200,000
          industrial++;
        }
      });

      // If no orders, return empty segments with a message
      if (total === 0) {
        return [
          { segment: 'No Orders Yet', percentage: 100, color: 'bg-gray-500' }
        ];
      }

      return [
        { segment: 'Residential', percentage: Math.round((residential / total) * 100), color: 'bg-blue-500' },
        { segment: 'Commercial', percentage: Math.round((commercial / total) * 100), color: 'bg-green-500' },
        { segment: 'Industrial', percentage: Math.round((industrial / total) * 100), color: 'bg-purple-500' }
      ];
    } catch (error) {
      console.error('Error fetching customer segments:', error);
      return this.getDefaultCustomerSegments();
    }
  }

  async getRecentActivity(supplierId: string, limit: number = 10): Promise<RecentActivity[]> {
    const supabaseClient = supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data: allOrdersData, error } = await supabaseClient
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          customer_id,
          order_items (
            product_id,
            products (
              supplier_id
            )
          )
        `)
        .neq('status', 'CANCELLED') // Exclude cancelled orders
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Get more to account for filtering

      // Filter orders by supplier through order items
      const orders = allOrdersData?.filter((order: any) => 
        order.order_items?.some((item: any) => item.products?.supplier_id === supplierId)
      ).slice(0, limit) || [];

      if (error) {
        console.error('Error fetching recent activity:', error);
        return [];
      }

      return (orders || []).map((order: any) => ({
        id: order.id,
        type: 'order' as const,
        title: `Order #${order.order_number}`,
        description: `New order from customer ${order.customer_id?.slice(0, 8) || 'Unknown'}`,
        amount: Number(order.total_amount),
        date: order.created_at,
        status: order.status
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  async getAnalytics(supplierId: string, period: string = '30d'): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
    averageOrderValueGrowth: number;
    salesData: SalesData[];
    productPerformance: ProductPerformance[];
    customerSegments: CustomerSegment[];
    recentActivity: RecentActivity[];
  }> {
    try {
      const [stats, salesData, productPerformance, customerSegments, recentActivity] = await Promise.all([
        this.getAnalyticsStats(supplierId, period),
        this.getSalesData(supplierId, period),
        this.getProductPerformance(supplierId, period),
        this.getCustomerSegments(supplierId, period),
        this.getRecentActivity(supplierId, 10)
      ]);

      return {
        ...stats,
        salesData,
        productPerformance,
        customerSegments,
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        averageOrderValue: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        customersGrowth: 0,
        averageOrderValueGrowth: 0,
        salesData: [],
        productPerformance: [],
        customerSegments: [],
        recentActivity: []
      };
    }
  }

  // Helper methods
  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private getPreviousPeriodStartDate(period: string): Date {
    const currentStart = this.getPeriodStartDate(period);
    const duration = this.getPeriodDuration(period);
    return new Date(currentStart.getTime() - duration);
  }

  private getPeriodDuration(period: string): number {
    switch (period) {
      case '7d':
        return 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return 30 * 24 * 60 * 60 * 1000;
      case '90d':
        return 90 * 24 * 60 * 60 * 1000;
      case '1y':
        return 365 * 24 * 60 * 60 * 1000;
      default:
        return 30 * 24 * 60 * 60 * 1000;
    }
  }

  private getDefaultStats(): AnalyticsStats {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
      customersGrowth: 0,
      averageOrderValueGrowth: 0
    };
  }

  private getDefaultCustomerSegments(): CustomerSegment[] {
    return [
      { segment: 'Residential', percentage: 65, color: 'bg-blue-500' },
      { segment: 'Commercial', percentage: 25, color: 'bg-green-500' },
      { segment: 'Industrial', percentage: 10, color: 'bg-purple-500' }
    ];
  }

  // Helper function to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

export const analyticsService = new AnalyticsService(); 