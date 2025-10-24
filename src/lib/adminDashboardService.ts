import { supabase } from './auth';

export interface AdminDashboardStats {
  totalRevenue: number;
  activeUsers: number;
  productsListed: number;
  pendingOrders: number;
  // Percentage changes
  revenueChange: number;
  usersChange: number;
  productsChange: number;
  ordersChange: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'product' | 'user' | 'payment' | 'review';
  message: string;
  time: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  created_at: string;
}

export interface SystemMetric {
  name: string;
  value: string;
  status: 'excellent' | 'good' | 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentActivities: RecentActivity[];
  systemMetrics: SystemMetric[];
}

class AdminDashboardService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(period: string, method: string): string {
    return `${method}-${period}`;
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getDashboardStats(period: string = '7d'): Promise<AdminDashboardStats> {
    const cacheKey = this.getCacheKey(period, 'stats');
    const cachedData = this.getCachedData(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      console.log('🔍 AdminDashboardService: Fetching stats for period:', period);
      
      // Calculate date ranges
      const now = new Date();
      let currentStartDate = new Date();
      let previousStartDate = new Date();
      let previousEndDate = new Date();
      
      switch (period) {
        case '7d':
          currentStartDate.setDate(now.getDate() - 7);
          previousEndDate.setDate(now.getDate() - 7);
          previousStartDate.setDate(now.getDate() - 14);
          break;
        case '30d':
          currentStartDate.setDate(now.getDate() - 30);
          previousEndDate.setDate(now.getDate() - 30);
          previousStartDate.setDate(now.getDate() - 60);
          break;
        case '90d':
          currentStartDate.setDate(now.getDate() - 90);
          previousEndDate.setDate(now.getDate() - 90);
          previousStartDate.setDate(now.getDate() - 180);
          break;
        case '1y':
          currentStartDate.setFullYear(now.getFullYear() - 1);
          previousEndDate.setFullYear(now.getFullYear() - 1);
          previousStartDate.setFullYear(now.getFullYear() - 2);
          break;
        default:
          currentStartDate.setDate(now.getDate() - 7);
          previousEndDate.setDate(now.getDate() - 7);
          previousStartDate.setDate(now.getDate() - 14);
      }

      // Get current period data
      console.log('🔍 AdminDashboardService: Fetching current period data from:', currentStartDate.toISOString());
      
      const [currentOrders, currentUsers, currentProducts] = await Promise.all([
        // Current period orders (only SHIPPED orders for revenue - matching orders page logic)
        supabase
          .from('orders')
          .select('total_amount, status')
          .gte('created_at', currentStartDate.toISOString())
          .eq('status', 'SHIPPED'),
        
        // Current period users - use customers table instead of users
        supabase
          .from('customers')
          .select('id, created_at')
          .gte('created_at', currentStartDate.toISOString()),
        
        // Current period products
        supabase
          .from('products')
          .select('id, created_at')
          .gte('created_at', currentStartDate.toISOString())
      ]);

      // Get previous period data for comparison
      const [previousOrders, previousUsers, previousProducts] = await Promise.all([
        // Previous period orders - only SHIPPED orders
        supabase
          .from('orders')
          .select('total_amount, status')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', previousEndDate.toISOString())
          .eq('status', 'SHIPPED'),
        
        // Previous period users - use customers table instead of users
        supabase
          .from('customers')
          .select('id, created_at')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', previousEndDate.toISOString()),
        
        // Previous period products
        supabase
          .from('products')
          .select('id, created_at')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', previousEndDate.toISOString())
      ]);

      // Get pending orders count - try different approaches to avoid 400 error
      let pendingOrdersData = null;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status')
          .limit(100); // Get more orders to filter in JS if needed
        
        if (data && !error) {
          // Filter for pending orders in JavaScript
          pendingOrdersData = data.filter((order: any) => {
            const status = order.status?.toUpperCase();
            return status === 'PENDING';
          });
          console.log('🔍 AdminDashboardService: Pending orders found via JS filtering:', pendingOrdersData.length);
        } else {
          console.log('🔍 AdminDashboardService: Error fetching orders for pending count:', error);
        }
      } catch (error) {
        console.log('🔍 AdminDashboardService: Exception fetching pending orders:', error);
      }

      // Log query results for debugging
      console.log('🔍 AdminDashboardService: Query results:', {
        currentOrders: currentOrders.data?.length || 0,
        currentUsers: currentUsers.data?.length || 0,
        currentProducts: currentProducts.data?.length || 0,
        pendingOrders: pendingOrdersData?.length || 0,
        ordersError: currentOrders.error,
        usersError: currentUsers.error,
        productsError: currentProducts.error
      });

      // Log detailed order data for debugging
      if (currentOrders.data && currentOrders.data.length > 0) {
        console.log('🔍 AdminDashboardService: Current period orders:', currentOrders.data);
      } else {
        console.log('🔍 AdminDashboardService: No orders found in current period');
      }

      // Calculate current period metrics
      let currentRevenue = currentOrders.data?.reduce((sum: number, order: any) => 
        sum + (order.total_amount || 0), 0) || 0;
      let currentUsersCount = currentUsers.data?.length || 0;
      let currentProductsCount = currentProducts.data?.length || 0;
      const currentPendingOrders = pendingOrdersData?.length || 0;

      // If no revenue in current period, get total revenue as fallback (like orders page)
      if (currentRevenue === 0) {
        console.log('🔍 AdminDashboardService: No revenue in current period, fetching total revenue...');
        
        const { data: allSuccessfulOrders, error: allOrdersError } = await supabase
          .from('orders')
          .select('total_amount, status')
          .eq('status', 'SHIPPED');
        
        console.log('🔍 AdminDashboardService: All successful orders query:', {
          data: allSuccessfulOrders,
          error: allOrdersError,
          count: allSuccessfulOrders?.length || 0
        });
        
        const totalRevenue = allSuccessfulOrders?.reduce((sum: number, order: any) => 
          sum + (order.total_amount || 0), 0) || 0;
        
        console.log('🔍 AdminDashboardService: Total revenue from all successful orders:', totalRevenue);
        
        // Also check ALL orders to see what statuses exist
        const { data: allOrders, error: allOrdersError2 } = await supabase
          .from('orders')
          .select('total_amount, status, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
        
        console.log('🔍 AdminDashboardService: All orders (last 10):', {
          data: allOrders,
          error: allOrdersError2,
          count: allOrders?.length || 0
        });

        // Log the actual order data to see what statuses exist
        if (allOrders && allOrders.length > 0) {
          console.log('🔍 AdminDashboardService: Sample order data:', allOrders[0]);
          console.log('🔍 AdminDashboardService: All order statuses:', allOrders.map((o: any) => o.status));
          console.log('🔍 AdminDashboardService: All orders with amounts:', allOrders.map((o: any) => ({
            id: o.id,
            status: o.status,
            total_amount: o.total_amount,
            created_at: o.created_at
          })));
        }
        
        // If status filtering failed, try getting all orders and filter in JavaScript
        if (totalRevenue === 0 && allOrders && allOrders.length > 0) {
          console.log('🔍 AdminDashboardService: Status filtering failed, calculating revenue from all orders...');
          
          const successfulOrders = allOrders.filter((order: any) => {
            const status = order.status?.toUpperCase();
            // Only include SHIPPED orders (matching the orders page logic)
            // DELIVERED orders are treated as refunded on the orders page
            return status === 'SHIPPED';
          });
          
          const jsCalculatedRevenue = successfulOrders.reduce((sum: number, order: any) => 
            sum + (order.total_amount || 0), 0);
          
          console.log('🔍 AdminDashboardService: JavaScript calculated revenue:', jsCalculatedRevenue);
          console.log('🔍 AdminDashboardService: Successful orders found:', successfulOrders.length);
          console.log('🔍 AdminDashboardService: Successful orders details:', successfulOrders.map((o: any) => ({
            id: o.id,
            status: o.status,
            total_amount: o.total_amount
          })));
          
          if (jsCalculatedRevenue > 0) {
            currentRevenue = jsCalculatedRevenue;
          }
        }

        // Use total revenue if current period revenue is 0
        if (totalRevenue > 0) {
          currentRevenue = totalRevenue;
        }
      }

      // If no data in current period, get total counts as fallback
      if (currentUsersCount === 0 || currentProductsCount === 0) {
        console.log('🔍 AdminDashboardService: No data in current period, fetching total counts...');
        
        const [totalUsersCount, totalProductsCount] = await Promise.all([
          supabase.from('customers').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true })
        ]);
        
        const finalUsersCount = currentUsersCount || totalUsersCount.count || 0;
        const finalProductsCount = currentProductsCount || totalProductsCount.count || 0;
        
        console.log('🔍 AdminDashboardService: Using total counts:', {
          users: finalUsersCount,
          products: finalProductsCount
        });
        
        // Update the counts
        currentUsersCount = finalUsersCount;
        currentProductsCount = finalProductsCount;
      }

      // Calculate previous period metrics
      const previousRevenue = previousOrders.data?.reduce((sum: number, order: any) => 
        sum + (order.total_amount || 0), 0) || 0;
      const previousUsersCount = previousUsers.data?.length || 0;
      const previousProductsCount = previousProducts.data?.length || 0;

      // Calculate percentage changes
      const revenueChange = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : currentRevenue > 0 ? 100 : 0;
      
      const usersChange = previousUsersCount > 0 
        ? ((currentUsersCount - previousUsersCount) / previousUsersCount) * 100 
        : currentUsersCount > 0 ? 100 : 0;
      
      const productsChange = previousProductsCount > 0 
        ? ((currentProductsCount - previousProductsCount) / previousProductsCount) * 100 
        : currentProductsCount > 0 ? 100 : 0;

      // For pending orders, we'll use a simple comparison (this could be improved)
      const ordersChange = -3.2; // Placeholder - could be calculated based on order processing time

      const stats: AdminDashboardStats = {
        totalRevenue: currentRevenue,
        activeUsers: currentUsersCount,
        productsListed: currentProductsCount,
        pendingOrders: currentPendingOrders,
        revenueChange: Math.round(revenueChange * 10) / 10,
        usersChange: Math.round(usersChange * 10) / 10,
        productsChange: Math.round(productsChange * 10) / 10,
        ordersChange: ordersChange
      };

      this.setCachedData(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      return {
        totalRevenue: 0,
        activeUsers: 0,
        productsListed: 0,
        pendingOrders: 0,
        revenueChange: 0,
        usersChange: 0,
        productsChange: 0,
        ordersChange: 0
      };
    }
  }

  async getRecentActivities(limit: number = 5): Promise<RecentActivity[]> {
    const cacheKey = this.getCacheKey('recent', 'activities');
    const cachedData = this.getCachedData(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      // Get recent orders - simplified query to avoid join issues
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, order_number, created_at, status, customer_id')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Get recent products - simplified query
      const { data: recentProducts } = await supabase
        .from('products')
        .select('id, name, created_at, supplier_id')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Get recent users - use customers table
      const { data: recentUsers } = await supabase
        .from('customers')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Combine and format activities
      const activities: RecentActivity[] = [];

      // Add order activities
      recentOrders?.forEach((order: any) => {
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          message: `New order ${order.order_number} placed`,
          time: this.getTimeAgo(order.created_at),
          status: order.status === 'PENDING' ? 'pending' : 'completed',
          created_at: order.created_at
        });
      });

      // Add product activities
      recentProducts?.forEach((product: any) => {
        activities.push({
          id: `product-${product.id}`,
          type: 'product',
          message: `New product "${product.name}" added`,
          time: this.getTimeAgo(product.created_at),
          status: 'approved',
          created_at: product.created_at
        });
      });

      // Add user activities
      recentUsers?.forEach((user: any) => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user',
          message: `New customer "${user.email}" registered`,
          time: this.getTimeAgo(user.created_at),
          status: 'pending',
          created_at: user.created_at
        });
      });

      // Sort by creation date and limit
      const sortedActivities = activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);

      this.setCachedData(cacheKey, sortedActivities);
      return sortedActivities;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  async getSystemMetrics(): Promise<SystemMetric[]> {
    const cacheKey = this.getCacheKey('system', 'metrics');
    const cachedData = this.getCachedData(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      // Get basic system metrics from database
      const [ordersCount, productsCount, usersCount] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true })
      ]);

      // Calculate metrics (simplified)
      const totalOrders = ordersCount.count || 0;
      const totalProducts = productsCount.count || 0;
      const totalUsers = usersCount.count || 0;

      // Calculate error rate (simplified - using mock data since error_logs table doesn't exist)
      const errorRate = 0.12; // Mock error rate

      const metrics: SystemMetric[] = [
        {
          name: 'Server Load',
          value: '68%', // This would need actual server monitoring
          status: 'normal',
          trend: 'stable'
        },
        {
          name: 'Database Performance',
          value: '92%', // This would need actual DB monitoring
          status: 'excellent',
          trend: 'up'
        },
        {
          name: 'API Response Time',
          value: '145ms', // This would need actual API monitoring
          status: 'good',
          trend: 'down'
        },
        {
          name: 'Error Rate',
          value: `${errorRate.toFixed(2)}%`,
          status: errorRate < 1 ? 'excellent' : errorRate < 5 ? 'good' : 'warning',
          trend: 'down'
        }
      ];

      this.setCachedData(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      return [
        {
          name: 'Server Load',
          value: '68%',
          status: 'normal',
          trend: 'stable'
        },
        {
          name: 'Database Performance',
          value: '92%',
          status: 'excellent',
          trend: 'up'
        },
        {
          name: 'API Response Time',
          value: '145ms',
          status: 'good',
          trend: 'down'
        },
        {
          name: 'Error Rate',
          value: '0.12%',
          status: 'excellent',
          trend: 'down'
        }
      ];
    }
  }

  async getDashboardData(period: string = '7d'): Promise<AdminDashboardData> {
    try {
      const [stats, recentActivities, systemMetrics] = await Promise.all([
        this.getDashboardStats(period),
        this.getRecentActivities(),
        this.getSystemMetrics()
      ]);

      return {
        stats,
        recentActivities,
        systemMetrics
      };
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      return {
        stats: {
          totalRevenue: 0,
          activeUsers: 0,
          productsListed: 0,
          pendingOrders: 0,
          revenueChange: 0,
          usersChange: 0,
          productsChange: 0,
          ordersChange: 0
        },
        recentActivities: [],
        systemMetrics: []
      };
    }
  }

  private getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  // Public method to clear cache (useful for manual refresh)
  public clearAllCache(): void {
    this.cache.clear();
  }
}

export const adminDashboardService = new AdminDashboardService();

