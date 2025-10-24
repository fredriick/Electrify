'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface SuperAdminSearchResult {
  id: string;
  title: string;
  description: string;
  type: 'system' | 'user' | 'security' | 'analytics' | 'monitoring' | 'configuration' | 'audit' | 'backup' | 'network' | 'database' | 'api' | 'integration' | 'report' | 'alert' | 'log' | 'performance';
  href: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  timestamp?: string;
  status?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
}

interface SuperAdminSearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SuperAdminSearchResult[];
  isSearching: boolean;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  navigateToResult: (result: SuperAdminSearchResult) => void;
  clearSearch: () => void;
}

const SuperAdminSearchContext = createContext<SuperAdminSearchContextType | undefined>(undefined);

// Mock data for super admin search results
const mockSuperAdminSearchData: SuperAdminSearchResult[] = [
  // System Management
  {
    id: 'system-1',
    title: 'System Overview',
    description: 'Real-time system health and performance metrics',
    type: 'system',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Healthy'
  },
  {
    id: 'system-2',
    title: 'Server Status',
    description: 'All server instances and their current status',
    type: 'system',
    href: '/super-admin-dashboard',
    priority: 'critical',
    status: 'Monitoring'
  },
  {
    id: 'system-3',
    title: 'System Configuration',
    description: 'Global system settings and configurations',
    type: 'configuration',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Configured'
  },
  // User Management
  {
    id: 'user-1',
    title: 'User Management',
    description: 'Manage all users, roles, and permissions',
    type: 'user',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Active'
  },
  {
    id: 'user-2',
    title: 'Role Management',
    description: 'Define and manage user roles and permissions',
    type: 'user',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Configured'
  },
  {
    id: 'user-3',
    title: 'Access Control',
    description: 'Fine-grained access control and permissions',
    type: 'user',
    href: '/super-admin-dashboard',
    priority: 'critical',
    status: 'Secured'
  },
  // Security
  {
    id: 'security-1',
    title: 'Security Center',
    description: 'Comprehensive security monitoring and controls',
    type: 'security',
    href: '/super-admin-dashboard',
    priority: 'critical',
    status: 'Protected',
    severity: 'success'
  },
  {
    id: 'security-2',
    title: 'Threat Detection',
    description: 'Real-time threat detection and response',
    type: 'security',
    href: '/super-admin-dashboard',
    priority: 'critical',
    status: 'Active',
    severity: 'info'
  },
  {
    id: 'security-3',
    title: 'Firewall Management',
    description: 'Network firewall rules and configurations',
    type: 'security',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Enabled'
  },
  {
    id: 'security-4',
    title: 'SSL Certificates',
    description: 'SSL certificate management and renewal',
    type: 'security',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Valid'
  },
  // Analytics & Monitoring
  {
    id: 'analytics-1',
    title: 'System Analytics',
    description: 'Comprehensive system performance analytics',
    type: 'analytics',
    href: '/super-admin-dashboard',
    priority: 'medium',
    status: 'Collecting'
  },
  {
    id: 'analytics-2',
    title: 'Performance Metrics',
    description: 'Real-time performance monitoring and alerts',
    type: 'performance',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Monitoring'
  },
  {
    id: 'monitoring-1',
    title: 'System Monitoring',
    description: 'Real-time system health monitoring',
    type: 'monitoring',
    href: '/super-admin-dashboard',
    priority: 'critical',
    status: 'Active'
  },
  {
    id: 'monitoring-2',
    title: 'Resource Usage',
    description: 'CPU, memory, and storage utilization',
    type: 'monitoring',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Normal'
  },
  // Database & Storage
  {
    id: 'database-1',
    title: 'Database Management',
    description: 'Database administration and maintenance',
    type: 'database',
    href: '/super-admin-dashboard',
    priority: 'critical',
    status: 'Online'
  },
  {
    id: 'database-2',
    title: 'Backup Management',
    description: 'Automated backup and recovery systems',
    type: 'backup',
    href: '/super-admin-dashboard',
    priority: 'critical',
    status: 'Scheduled'
  },
  {
    id: 'database-3',
    title: 'Data Integrity',
    description: 'Data integrity checks and validation',
    type: 'database',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Valid'
  },
  // Network & API
  {
    id: 'network-1',
    title: 'Network Status',
    description: 'Network connectivity and performance',
    type: 'network',
    href: '/super-admin-dashboard',
    priority: 'critical',
    status: 'Connected'
  },
  {
    id: 'api-1',
    title: 'API Management',
    description: 'API endpoints and rate limiting',
    type: 'api',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Active'
  },
  {
    id: 'integration-1',
    title: 'Third-party Integrations',
    description: 'External service integrations status',
    type: 'integration',
    href: '/super-admin-dashboard',
    priority: 'medium',
    status: 'Connected'
  },
  // Reports & Alerts
  {
    id: 'report-1',
    title: 'System Reports',
    description: 'Comprehensive system reports and analytics',
    type: 'report',
    href: '/super-admin-dashboard',
    priority: 'medium',
    status: 'Generated'
  },
  {
    id: 'alert-1',
    title: 'Alert Management',
    description: 'System alerts and notification settings',
    type: 'alert',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Active'
  },
  {
    id: 'alert-2',
    title: 'Critical Alerts',
    description: 'High-priority system alerts',
    type: 'alert',
    href: '/super-admin-dashboard',
    priority: 'critical',
    status: 'Monitoring',
    severity: 'warning'
  },
  // Logs & Audit
  {
    id: 'log-1',
    title: 'System Logs',
    description: 'Comprehensive system logging and analysis',
    type: 'log',
    href: '/super-admin-dashboard',
    priority: 'medium',
    status: 'Recording'
  },
  {
    id: 'audit-1',
    title: 'Audit Trail',
    description: 'Complete audit trail and compliance logs',
    type: 'audit',
    href: '/super-admin-dashboard',
    priority: 'high',
    status: 'Tracking'
  },
  // Performance & Optimization
  {
    id: 'performance-1',
    title: 'Performance Optimization',
    description: 'System performance tuning and optimization',
    type: 'performance',
    href: '/super-admin-dashboard',
    priority: 'medium',
    status: 'Optimized'
  },
  {
    id: 'performance-2',
    title: 'Cache Management',
    description: 'Cache configuration and performance',
    type: 'performance',
    href: '/super-admin-dashboard',
    priority: 'medium',
    status: 'Active'
  }
];

export function SuperAdminSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SuperAdminSearchResult[]>([]);
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
      const filteredResults = mockSuperAdminSearchData.filter(item => {
        const searchLower = term.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.type.toLowerCase().includes(searchLower) ||
          (item.status && item.status.toLowerCase().includes(searchLower)) ||
          (item.severity && item.severity.toLowerCase().includes(searchLower))
        );
      });

      // Sort by priority and relevance
      const sortedResults = filteredResults.sort((a, b) => {
        // Priority order: critical > high > medium > low
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
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

      setSearchResults(sortedResults.slice(0, 12)); // Limit to 12 results
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

  const navigateToResult = useCallback((result: SuperAdminSearchResult) => {
    router.push(result.href);
    setShowSearchResults(false);
    setSearchTerm('');
  }, [router]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  }, []);

  const value: SuperAdminSearchContextType = {
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
    <SuperAdminSearchContext.Provider value={value}>
      {children}
    </SuperAdminSearchContext.Provider>
  );
}

export function useSuperAdminSearch() {
  const context = useContext(SuperAdminSearchContext);
  if (context === undefined) {
    throw new Error('useSuperAdminSearch must be used within a SuperAdminSearchProvider');
  }
  return context;
} 