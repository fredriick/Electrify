'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'user' | 'product' | 'order' | 'page' | 'setting' | 'notification' | 'log' | 'security';
  href: string;
  priority?: 'high' | 'medium' | 'low';
  timestamp?: string;
  status?: string;
}

interface AdminSearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  navigateToResult: (result: SearchResult) => void;
  clearSearch: () => void;
}

const AdminSearchContext = createContext<AdminSearchContextType | undefined>(undefined);

// Mock data for search results
const mockSearchData: SearchResult[] = [
  // Users
  {
    id: 'user-1',
    title: 'John Smith',
    description: 'Customer - Premium Plan',
    type: 'user',
    href: '/admin/users',
    priority: 'high',
    status: 'Active'
  },
  {
    id: 'user-2',
    title: 'Sarah Johnson',
    description: 'Supplier - SolarTech Inc',
    type: 'user',
    href: '/admin/users/suppliers',
    priority: 'medium',
    status: 'Verified'
  },
  {
    id: 'user-3',
    title: 'Mike Wilson',
    description: 'Admin - System Administrator',
    type: 'user',
    href: '/admin/users/admins',
    priority: 'high',
    status: 'Active'
  },
  // Products
  {
    id: 'product-1',
    title: 'Solar Panel Pro 400W',
    description: 'High-efficiency solar panel',
    type: 'product',
    href: '/admin/products',
    priority: 'high',
    status: 'In Stock'
  },
  {
    id: 'product-2',
    title: 'Inverter Max 5000W',
    description: 'Grid-tie inverter system',
    type: 'product',
    href: '/admin/products',
    priority: 'medium',
    status: 'Low Stock'
  },
  {
    id: 'product-3',
    title: 'Battery Storage 10kWh',
    description: 'Lithium-ion battery system',
    type: 'product',
    href: '/admin/products',
    priority: 'high',
    status: 'Out of Stock'
  },
  // Orders
  {
    id: 'order-1',
    title: 'Order #12345',
    description: 'Pending - Solar Panel Installation',
    type: 'order',
    href: '/admin/orders/pending',
    priority: 'high',
    status: 'Pending'
  },
  {
    id: 'order-2',
    title: 'Order #12346',
    description: 'Completed - Inverter Setup',
    type: 'order',
    href: '/admin/orders',
    priority: 'low',
    status: 'Completed'
  },
  {
    id: 'order-3',
    title: 'Dispute #789',
    description: 'Customer complaint - Delivery delay',
    type: 'order',
    href: '/admin/orders/disputes',
    priority: 'high',
    status: 'Open'
  },
  // Pages
  {
    id: 'page-1',
    title: 'Dashboard',
    description: 'Admin dashboard overview',
    type: 'page',
    href: '/admin-dashboard',
    priority: 'medium'
  },
  {
    id: 'page-2',
    title: 'Analytics',
    description: 'System analytics and reports',
    type: 'page',
    href: '/admin/analytics',
    priority: 'medium'
  },
  {
    id: 'page-3',
    title: 'System Status',
    description: 'Real-time system monitoring',
    type: 'page',
    href: '/admin/system-status',
    priority: 'high'
  },
  // Settings
  {
    id: 'setting-1',
    title: 'System Settings',
    description: 'Configure system parameters',
    type: 'setting',
    href: '/admin/system/settings',
    priority: 'medium'
  },
  {
    id: 'setting-2',
    title: 'Database Management',
    description: 'Database backup and maintenance',
    type: 'setting',
    href: '/admin/system/database',
    priority: 'high'
  },
  {
    id: 'setting-3',
    title: 'Security Settings',
    description: 'Security and access controls',
    type: 'setting',
    href: '/admin/system/security',
    priority: 'high'
  },
  // Notifications
  {
    id: 'notification-1',
    title: 'System Alert',
    description: 'High CPU usage detected',
    type: 'notification',
    href: '/admin/notifications',
    priority: 'high',
    timestamp: '2 minutes ago'
  },
  {
    id: 'notification-2',
    title: 'New User Registration',
    description: 'Sarah Johnson registered as supplier',
    type: 'notification',
    href: '/admin/notifications',
    priority: 'medium',
    timestamp: '5 minutes ago'
  },
  // Logs
  {
    id: 'log-1',
    title: 'Error Log',
    description: 'Database connection timeout',
    type: 'log',
    href: '/admin/system/logs',
    priority: 'high',
    timestamp: '10 minutes ago'
  },
  {
    id: 'log-2',
    title: 'Access Log',
    description: 'Admin login from 192.168.1.100',
    type: 'log',
    href: '/admin/system/logs',
    priority: 'low',
    timestamp: '15 minutes ago'
  },
  // Security
  {
    id: 'security-1',
    title: 'Failed Login Attempt',
    description: 'Multiple failed logins from IP 203.0.113.1',
    type: 'security',
    href: '/admin/system/security',
    priority: 'high',
    timestamp: '1 hour ago'
  },
  {
    id: 'security-2',
    title: 'Suspicious Activity',
    description: 'Unusual data access pattern detected',
    type: 'security',
    href: '/admin/system/security',
    priority: 'high',
    timestamp: '2 hours ago'
  }
];

export function AdminSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const router = useRouter();

  // Search function
  const performSearch = useCallback((term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const filteredResults = mockSearchData.filter(item => {
        const searchLower = term.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.type.toLowerCase().includes(searchLower) ||
          (item.status && item.status.toLowerCase().includes(searchLower))
        );
      });

      // Sort by priority and relevance
      const sortedResults = filteredResults.sort((a, b) => {
        // Priority order: high > medium > low
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'low'];
        const bPriority = priorityOrder[b.priority || 'low'];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // If same priority, sort by title match
        const aTitleMatch = a.title.toLowerCase().includes(term.toLowerCase());
        const bTitleMatch = b.title.toLowerCase().includes(term.toLowerCase());
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        
        return a.title.localeCompare(b.title);
      });

      setSearchResults(sortedResults.slice(0, 10)); // Limit to 10 results
      setIsSearching(false);
    }, 300);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  // Show results when search term changes
  useEffect(() => {
    if (searchTerm.trim() && searchResults.length > 0) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchTerm, searchResults]);

  const navigateToResult = useCallback((result: SearchResult) => {
    router.push(result.href);
    setShowSearchResults(false);
    setSearchTerm('');
  }, [router]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  }, []);

  const value: AdminSearchContextType = {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    showSearchResults,
    setShowSearchResults,
    navigateToResult,
    clearSearch
  };

  return (
    <AdminSearchContext.Provider value={value}>
      {children}
    </AdminSearchContext.Provider>
  );
}

export function useAdminSearch() {
  const context = useContext(AdminSearchContext);
  if (context === undefined) {
    throw new Error('useAdminSearch must be used within an AdminSearchProvider');
  }
  return context;
} 