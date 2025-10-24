import { getSupabaseClient } from './auth';

export interface AdminNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS' | 'ORDER' | 'PAYOUT' | 'USER_ACTIVITY' | 'PRODUCT_UPDATE' | 'SECURITY' | 'SYSTEM';
  is_read: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
  // Additional fields for admin view
  user_type?: 'CUSTOMER' | 'SUPPLIER' | 'ADMIN' | 'SUPER_ADMIN';
  user_name?: string;
  user_email?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'user' | 'product' | 'order' | 'system' | 'security' | 'payment';
}

export interface NotificationStats {
  total: number;
  unread: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byCategory: {
    user: number;
    product: number;
    order: number;
    system: number;
    security: number;
    payment: number;
  };
  byType: {
    INFO: number;
    WARNING: number;
    ALERT: number;
    SUCCESS: number;
    ORDER: number;
  };
}

class AdminNotificationService {
  /**
   * Get all notifications for admin dashboard
   */
  async getAllNotifications(limit: number = 50): Promise<AdminNotification[]> {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Get notifications without user join since we use role-specific tables
      console.log('🔔 AdminNotificationService: Fetching notifications...');
      const { data: notifications, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw new Error('Failed to fetch notifications');
      }

      console.log('🔔 AdminNotificationService: Raw notifications:', notifications?.length || 0);

      // Transform notifications and try to get user information from role-specific tables
      const transformedNotifications: AdminNotification[] = [];
      
      for (const notification of notifications || []) {
        let userInfo: {
          user_type: 'CUSTOMER' | 'SUPPLIER' | 'ADMIN' | 'SUPER_ADMIN';
          user_name: string;
          user_email: string;
        } = {
          user_type: 'CUSTOMER',
          user_name: 'Unknown User',
          user_email: 'No email'
        };

        // Try to get user info from role-specific tables
        if (notification.user_id) {
          try {
            // Try customers table
            const { data: customer } = await supabaseClient
              .from('customers')
              .select('first_name, last_name, email')
              .eq('id', notification.user_id)
              .single();
            
            if (customer) {
              userInfo = {
                user_type: 'CUSTOMER',
                user_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer',
                user_email: customer.email || 'No email'
              };
            } else {
              // Try suppliers table
              const { data: supplier } = await supabaseClient
                .from('suppliers')
                .select('first_name, last_name, email, company_name')
                .eq('id', notification.user_id)
                .single();
              
              if (supplier) {
                userInfo = {
                  user_type: 'SUPPLIER' as const,
                  user_name: supplier.company_name || `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim() || 'Supplier',
                  user_email: supplier.email || 'No email'
                };
              } else {
                // Try admins table
                const { data: admin } = await supabaseClient
                  .from('admins')
                  .select('first_name, last_name, email')
                  .eq('id', notification.user_id)
                  .single();
                
                if (admin) {
                  userInfo = {
                    user_type: 'ADMIN',
                    user_name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Admin',
                    user_email: admin.email || 'No email'
                  };
                }
              }
            }
          } catch (userError) {
            console.log('Could not fetch user info for notification:', notification.id);
          }
        }

        const priority = this.determinePriority(notification.type, notification.metadata);
        const category = this.determineCategory(notification.type, notification.metadata);

        transformedNotifications.push({
          ...notification,
          ...userInfo,
          priority,
          category
        });
      }

      console.log('🔔 AdminNotificationService: Transformed notifications:', transformedNotifications.length);
      return transformedNotifications;
    } catch (error) {
      console.error('Error in getAllNotifications:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics for admin dashboard
   */
  async getNotificationStats(): Promise<NotificationStats> {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data: notifications, error } = await supabaseClient
        .from('notifications')
        .select('type, metadata, is_read');

      if (error) {
        console.error('Error fetching notification stats:', error);
        throw new Error('Failed to fetch notification statistics');
      }

      const stats: NotificationStats = {
        total: notifications?.length || 0,
        unread: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        byCategory: {
          user: 0,
          product: 0,
          order: 0,
          system: 0,
          security: 0,
          payment: 0
        },
        byType: {
          INFO: 0,
          WARNING: 0,
          ALERT: 0,
          SUCCESS: 0,
          ORDER: 0
        }
      };

      (notifications || []).forEach((notification: any) => {
        // Count unread
        if (!notification.is_read) {
          stats.unread++;
        }

        // Count by type
        if (notification.type && stats.byType.hasOwnProperty(notification.type)) {
          stats.byType[notification.type as keyof typeof stats.byType]++;
        }

        // Determine priority and category
        const priority = this.determinePriority(notification.type, notification.metadata);
        const category = this.determineCategory(notification.type, notification.metadata);

        // Count by priority
        if (priority && stats.hasOwnProperty(priority)) {
          stats[priority as keyof typeof stats]++;
        }
        if (category && stats.byCategory.hasOwnProperty(category)) {
          stats.byCategory[category as keyof typeof stats.byCategory]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error in getNotificationStats:', error);
      throw error;
    }
  }

  /**
   * Get recent notifications for admin dashboard (last 24 hours)
   */
  async getRecentNotifications(hours: number = 24): Promise<AdminNotification[]> {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hours);

      const { data: notifications, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .gte('created_at', cutoffTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching recent notifications:', error);
        throw new Error('Failed to fetch recent notifications');
      }

      // Transform notifications (same logic as getAllNotifications)
      const transformedNotifications: AdminNotification[] = [];
      
      for (const notification of notifications || []) {
        let userInfo: {
          user_type: 'CUSTOMER' | 'SUPPLIER' | 'ADMIN' | 'SUPER_ADMIN';
          user_name: string;
          user_email: string;
        } = {
          user_type: 'CUSTOMER',
          user_name: 'Unknown User',
          user_email: 'No email'
        };

        // Try to get user info from role-specific tables
        if (notification.user_id) {
          try {
            // Try customers table
            const { data: customer } = await supabaseClient
              .from('customers')
              .select('first_name, last_name, email')
              .eq('id', notification.user_id)
              .single();
            
            if (customer) {
              userInfo = {
                user_type: 'CUSTOMER',
                user_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer',
                user_email: customer.email || 'No email'
              };
            } else {
              // Try suppliers table
              const { data: supplier } = await supabaseClient
                .from('suppliers')
                .select('first_name, last_name, email, company_name')
                .eq('id', notification.user_id)
                .single();
              
              if (supplier) {
                userInfo = {
                  user_type: 'SUPPLIER' as const,
                  user_name: supplier.company_name || `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim() || 'Supplier',
                  user_email: supplier.email || 'No email'
                };
              } else {
                // Try admins table
                const { data: admin } = await supabaseClient
                  .from('admins')
                  .select('first_name, last_name, email')
                  .eq('id', notification.user_id)
                  .single();
                
                if (admin) {
                  userInfo = {
                    user_type: 'ADMIN',
                    user_name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Admin',
                    user_email: admin.email || 'No email'
                  };
                }
              }
            }
          } catch (userError) {
            console.log('Could not fetch user info for recent notification:', notification.id);
          }
        }

        const priority = this.determinePriority(notification.type, notification.metadata);
        const category = this.determineCategory(notification.type, notification.metadata);

        transformedNotifications.push({
          ...notification,
          ...userInfo,
          priority,
          category
        });
      }

      return transformedNotifications;
    } catch (error) {
      console.error('Error in getRecentNotifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await supabaseClient
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await supabaseClient
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await supabaseClient
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return false;
    }
  }

  /**
   * Create notification for admin (system notifications)
   */
  async createAdminNotification(
    title: string,
    message: string,
    type: AdminNotification['type'],
    metadata: any = {},
    priority: AdminNotification['priority'] = 'medium'
  ): Promise<boolean> {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Create notification for all admins
      const { data: admins, error: adminError } = await supabaseClient
        .from('admins')
        .select('id');

      if (adminError) {
        console.error('Error fetching admins:', adminError);
        return false;
      }

      const notifications = (admins || []).map((admin: any) => ({
        user_id: admin.id,
        title,
        message,
        type,
        is_read: false,
        metadata: {
          ...metadata,
          priority,
          created_by: 'system'
        }
      }));

      const { error } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error creating admin notifications:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createAdminNotification:', error);
      return false;
    }
  }

  /**
   * Create notification for specific user
   */
  async createUserNotification(
    userId: string,
    title: string,
    message: string,
    type: AdminNotification['type'],
    metadata: any = {}
  ): Promise<boolean> {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          is_read: false,
          metadata
        });

      if (error) {
        console.error('Error creating user notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createUserNotification:', error);
      return false;
    }
  }

  /**
   * Helper method to determine user type from role
   */
  private getUserType(role?: string): AdminNotification['user_type'] {
    switch (role?.toUpperCase()) {
      case 'CUSTOMER':
        return 'CUSTOMER';
      case 'SUPPLIER':
        return 'SUPPLIER';
      case 'ADMIN':
        return 'ADMIN';
      case 'SUPER_ADMIN':
        return 'SUPER_ADMIN';
      default:
        return 'CUSTOMER';
    }
  }

  /**
   * Helper method to determine priority based on type and metadata
   */
  private determinePriority(type: string, metadata: any): AdminNotification['priority'] {
    // Critical priority
    if (type === 'ALERT' && metadata?.critical) return 'critical';
    if (type === 'WARNING' && metadata?.security_issue) return 'critical';
    
    // High priority
    if (type === 'ORDER') return 'high';
    if (type === 'ALERT') return 'high';
    if (metadata?.high_value) return 'high';
    
    // Medium priority
    if (type === 'WARNING') return 'medium';
    if (type === 'SUCCESS' && metadata?.important) return 'medium';
    
    // Low priority
    return 'low';
  }

  /**
   * Helper method to determine category based on type and metadata
   */
  private determineCategory(type: string, metadata: any): AdminNotification['category'] {
    if (type === 'ORDER') return 'order';
    if (metadata?.product_id || metadata?.product_name) return 'product';
    if (metadata?.payment_id || metadata?.payment_amount) return 'payment';
    if (metadata?.security_issue || metadata?.login_attempts) return 'security';
    if (metadata?.system_maintenance || metadata?.server_issue) return 'system';
    if (metadata?.user_registration || metadata?.user_verification) return 'user';
    
    // Default based on type
    switch (type) {
      case 'ORDER':
        return 'order';
      case 'WARNING':
        return 'system';
      case 'ALERT':
        return 'security';
      case 'SUCCESS':
        return 'user';
      default:
        return 'system';
    }
  }

  /**
   * Format time ago
   */
  formatTimeAgo(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  /**
   * Get notification icon based on category
   */
  getNotificationIcon(category: string): string {
    switch (category) {
      case 'user': return 'Users';
      case 'product': return 'Package';
      case 'order': return 'ShoppingCart';
      case 'system': return 'Server';
      case 'security': return 'Shield';
      case 'payment': return 'CreditCard';
      default: return 'Bell';
    }
  }

  /**
   * Get notification color based on type and priority
   */
  getNotificationColor(type: string, priority: string): string {
    if (priority === 'critical') return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
    if (priority === 'high') return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
    if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
    if (priority === 'low') return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
    
    switch (type) {
      case 'SUCCESS':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      case 'WARNING':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'ALERT':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }
}

export const adminNotificationService = new AdminNotificationService();
