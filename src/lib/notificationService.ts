import { getSupabaseClient, getSupabaseSessionClient } from './auth';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS' | 'ORDER';
  is_read: boolean;
  metadata: any; // JSONB type, can be any object
  created_at: string;
}

class NotificationService {
  /**
   * Get the correct Supabase client based on storage type (same logic as AuthContext)
   */
  private getCorrectSupabaseClient() {
    const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
    const client = storageType === 'sessionStorage' ? getSupabaseSessionClient() : getSupabaseClient();
    // Using client type
    return client;
  }

  /**
   * Fetches notifications for a given user ID.
   * @param userId The ID of the user (supplier) to fetch notifications for.
   * @param limit Optional limit for the number of notifications to fetch.
   * @returns An array of Notification objects.
   */
  async getNotifications(userId: string, limit: number = 10): Promise<Notification[]> {
    // Fetching notifications for user
    
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    // Add a small delay to ensure any recent inserts are visible
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { data, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }

    // Found notifications
    
    // Raw query result
    
    return data as Notification[];
  }

  /**
   * Gets the count of unread notifications for a user.
   * @param userId The ID of the user (supplier).
   * @returns The count of unread notifications.
   */
  async getUnreadCount(userId: string): Promise<number> {
    // Getting unread count for user
    
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    const { count, error } = await supabaseClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    // Unread count
    return count || 0;
  }

  /**
   * Marks a specific notification as read.
   * @param notificationId The ID of the notification to mark as read.
   * @returns True if successful, false otherwise.
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    return true;
  }

  /**
   * Marks all notifications for a given user as read.
   * @param userId The ID of the user (supplier).
   * @returns True if successful, false otherwise.
   */
  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false); // Only update unread ones

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
    return true;
  }

  /**
   * Deletes a specific notification.
   * @param notificationId The ID of the notification to delete.
   * @returns True if successful, false otherwise.
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    const { error } = await supabaseClient
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
    return true;
  }

  /**
   * Creates a new notification.
   * @param notification The notification object to create.
   * @returns True if successful, false otherwise.
   */
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<boolean> {
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    const { error } = await supabaseClient
      .from('notifications')
      .insert(notification);

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }
    return true;
  }

  /**
   * Creates a notification for a seller when an order is placed for their products
   * This is a fallback method in case automatic triggers don't work
   * @param supplierId The ID of the supplier
   * @param orderData The order data
   * @returns True if successful, false otherwise
   */
  async createOrderNotification(supplierId: string, orderData: {
    orderId: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    itemCount: number;
  }): Promise<boolean> {
    // Creating order notification for supplier
    
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    const notification = {
      user_id: supplierId,
      title: 'New Order Received',
      message: `New order #${orderData.orderNumber} received from ${orderData.customerName} for ₦${orderData.totalAmount.toLocaleString()}`,
      type: 'ORDER' as const,
      is_read: false,
      metadata: {
        order_id: orderData.orderId,
        order_number: orderData.orderNumber,
        customer_name: orderData.customerName,
        total_amount: orderData.totalAmount,
        item_count: orderData.itemCount,
        created_at: new Date().toISOString()
      }
    };

    try {
      const { error } = await supabaseClient
        .from('notifications')
        .insert(notification);

      if (error) {
        console.error('Error creating order notification:', error);
        return false;
      }
      
      // Order notification created successfully
      return true;
    } catch (error) {
      console.error('Error creating order notification:', error);
      return false;
    }
  }

  /**
   * Debug method to check if notifications exist in the database
   * @param userId The ID of the user to check
   * @returns Raw database query result
   */
  async debugCheckNotifications(userId: string): Promise<any> {
    // Debug check for user
    
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    // Check all notifications for this user (no limit)
    const { data, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Debug query result
    
    // Also check if there are any notifications at all
    const { data: allData, error: allError } = await supabaseClient
      .from('notifications')
      .select('id, user_id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    // All recent notifications
    
    return { userNotifications: { data, error }, allNotifications: { allData, allError } };
  }

  /**
   * Creates a test notification for debugging purposes.
   * @param userId The ID of the supplier to create notification for.
   * @returns True if successful, false otherwise.
   */
  async createTestNotification(userId: string): Promise<boolean> {
    // Creating test notification for user
    
    const supabaseClient = this.getCorrectSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    const testNotification = {
      user_id: userId,
      title: 'Test Notification',
      message: 'This is a test notification to verify the seller notification system is working.',
      type: 'INFO' as const,
      is_read: false,
      metadata: { test: true, created_at: new Date().toISOString() }
    };

    try {
      const { error } = await supabaseClient
        .from('notifications')
        .insert(testNotification);

      if (error) {
        console.error('Error creating test notification:', error);
        return false;
      }
      
      // Test notification created successfully
      return true;
    } catch (error) {
      console.error('Error creating test notification:', error);
      return false;
    }
  }

  /**
   * Creates sample notifications for a supplier (for testing purposes).
   * @param userId The ID of the supplier to create notifications for.
   * @returns True if successful, false otherwise.
   */
  async createSampleNotifications(userId: string): Promise<boolean> {
    const sampleNotifications = [
      {
        user_id: userId,
        title: 'New Order Received',
        message: 'Order #ORD-001 has been placed for SunPower X-Series 400W',
        type: 'ORDER' as const,
        is_read: false,
        metadata: { order_id: 'ORD-001', product_name: 'SunPower X-Series 400W', amount: 1299.99 }
      },
      {
        user_id: userId,
        title: 'Low Stock Alert',
        message: 'Tesla Powerwall 2 is running low on stock (3 units remaining)',
        type: 'WARNING' as const,
        is_read: false,
        metadata: { product_id: 'PW-001', product_name: 'Tesla Powerwall 2', current_stock: 3, min_stock: 5 }
      },
      {
        user_id: userId,
        title: 'Payment Processed',
        message: 'Payment of $1,299.99 has been processed for order #ORD-001',
        type: 'SUCCESS' as const,
        is_read: false,
        metadata: { order_id: 'ORD-001', amount: 1299.99, payment_method: 'Credit Card' }
      },
      {
        user_id: userId,
        title: 'Product Approved',
        message: 'Your product "LG Solar Panel 400W" has been approved and is now live',
        type: 'SUCCESS' as const,
        is_read: true,
        metadata: { product_id: 'LG-001', product_name: 'LG Solar Panel 400W' }
      },
      {
        user_id: userId,
        title: 'Return Request',
        message: 'Customer has requested a return for order #ORD-002',
        type: 'ALERT' as const,
        is_read: false,
        metadata: { order_id: 'ORD-002', reason: 'Defective product', customer_name: 'John Doe' }
      }
    ];

    try {
      const supabaseClient = this.getCorrectSupabaseClient();
      if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
      }
      
      const { error } = await supabaseClient
        .from('notifications')
        .insert(sampleNotifications);

      if (error) {
        console.error('Error creating sample notifications:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error creating sample notifications:', error);
      return false;
    }
  }

  /**
   * Calculates the time elapsed since the notification was created.
   * @param createdAt The ISO string timestamp of creation.
   * @returns A human-readable string like "6m ago", "2h ago", "3d ago".
   */
  formatTimeAgo(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const seconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(months / 12);
    return `${years}y ago`;
  }

  /**
   * Gets the icon component name based on notification type.
   * @param type The type of notification.
   * @returns A string representing the icon name.
   */
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'SUCCESS':
      case 'ORDER':
        return 'CheckCircle'; // Green checkmark
      case 'WARNING':
        return 'AlertTriangle'; // Yellow exclamation
      case 'ALERT':
        return 'Bell'; // General alert
      case 'INFO':
      default:
        return 'Info'; // Blue info icon
    }
  }

  /**
   * Gets the color class for the notification icon background.
   * @param type The type of notification.
   * @returns Tailwind CSS class string.
   */
  getNotificationIconBgColor(type: Notification['type']): string {
    switch (type) {
      case 'SUCCESS':
      case 'ORDER':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'WARNING':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'ALERT':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'INFO':
      default:
        return 'bg-blue-100 dark:bg-blue-900/20';
    }
  }

  /**
   * Gets the color class for the notification icon itself.
   * @param type The type of notification.
   * @returns Tailwind CSS class string.
   */
  getNotificationIconColor(type: Notification['type']): string {
    switch (type) {
      case 'SUCCESS':
      case 'ORDER':
        return 'text-green-600 dark:text-green-400';
      case 'WARNING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'ALERT':
        return 'text-red-600 dark:text-red-400';
      case 'INFO':
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  }
}

export const notificationService = new NotificationService(); 