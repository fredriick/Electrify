'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Clock, AlertCircle, Info, User, Store, Shield, ShoppingCart, Package, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { adminNotificationService, AdminNotification } from '@/lib/adminNotificationService';


export function AdminNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.is_read).length;

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Set up periodic refresh for notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Fetch all notifications instead of just recent ones
      const allNotifications = await adminNotificationService.getAllNotifications(50); // Get last 50 notifications
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Keep empty array on error
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const success = await adminNotificationService.markAsRead(id);
      if (success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id ? { ...notification, is_read: true } : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const success = await adminNotificationService.markAllAsRead();
      if (success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const success = await adminNotificationService.deleteNotification(id);
      if (success) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'user': return <User className="w-4 h-4" />;
      case 'product': return <Package className="w-4 h-4" />;
      case 'order': return <ShoppingCart className="w-4 h-4" />;
      case 'system': return <Info className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'payment': return <Store className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'critical') return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
    
    switch (type) {
      case 'SUCCESS': return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      case 'WARNING': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'ALERT': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'INFO': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-700/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    return adminNotificationService.formatTimeAgo(timestamp);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'critical') return notification.priority === 'critical';
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium z-20 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {criticalCount > 0 && unreadCount === 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse z-10"></span>
        )}
        {criticalCount > 0 && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-600 rounded-full animate-pulse z-10"></span>
        )}
        {/* Fallback indicator for any notifications (even if all read) */}
        {notifications.length > 0 && unreadCount === 0 && criticalCount === 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full z-10"></span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[calc(100vh-8rem)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotifications}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Refresh notifications"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'unread' 
                  ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'critical' 
                  ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Critical ({criticalCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-16rem)]">
            {loading ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getNotificationColor(notification.type, notification.priority || 'low')} ${
                      !notification.is_read ? 'bg-white dark:bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.category || 'system')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <span className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority || 'low')}`}></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        {/* Show user info if available */}
                        {notification.user_name && notification.user_name !== 'Unknown User' && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            From: {notification.user_name} ({notification.user_type})
                          </p>
                        )}
                        {/* Action buttons based on notification type */}
                        {notification.type === 'ORDER' && (
                          <button
                            onClick={() => {
                              markAsRead(notification.id);
                              window.location.href = '/admin/orders';
                            }}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium mt-2"
                          >
                            View Orders
                          </button>
                        )}
                        {notification.type === 'PAYOUT' && (
                          <button
                            onClick={() => {
                              markAsRead(notification.id);
                              window.location.href = '/admin/payouts';
                            }}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium mt-2"
                          >
                            View Payouts
                          </button>
                        )}
                        {notification.type === 'USER_ACTIVITY' && (
                          <button
                            onClick={() => {
                              markAsRead(notification.id);
                              window.location.href = '/admin/users';
                            }}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium mt-2"
                          >
                            View Users
                          </button>
                        )}
                        {notification.type === 'PRODUCT_UPDATE' && (
                          <button
                            onClick={() => {
                              markAsRead(notification.id);
                              window.location.href = '/admin/products';
                            }}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium mt-2"
                          >
                            View Products
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0">
            <Link
              href="/admin/notifications"
              className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium block text-center py-1"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 