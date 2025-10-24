'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  X, 
  Shield, 
  Settings, 
  Users, 
  BarChart3, 
  Activity, 
  Database, 
  Network, 
  Zap, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  Clock,
  Star,
  Server,
  Lock,
  Eye,
  Cpu,
  HardDrive,
  Wifi,
  Globe,
  Bell,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Info,
  Crown
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  href: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  status?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
}

// Mock search data
const searchData: SearchResult[] = [
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
    href: '/super-admin/users',
    priority: 'high',
    status: 'Active'
  },
  {
    id: 'user-2',
    title: 'Role Management',
    description: 'Define and manage user roles and permissions',
    type: 'user',
    href: '/super-admin/users',
    priority: 'high',
    status: 'Configured'
  },
  {
    id: 'user-3',
    title: 'Access Control',
    description: 'Fine-grained access control and permissions',
    type: 'user',
    href: '/super-admin/security',
    priority: 'critical',
    status: 'Secured'
  },
  {
    id: 'user-4',
    title: 'Customer Management',
    description: 'Manage customer accounts and profiles',
    type: 'user',
    href: '/super-admin/users/customers',
    priority: 'medium',
    status: 'Active'
  },
  {
    id: 'user-5',
    title: 'Supplier Management',
    description: 'Manage supplier accounts and relationships',
    type: 'user',
    href: '/super-admin/users/suppliers',
    priority: 'medium',
    status: 'Active'
  },
  // Security
  {
    id: 'security-1',
    title: 'Security Center',
    description: 'Comprehensive security monitoring and controls',
    type: 'security',
    href: '/super-admin/security',
    priority: 'critical',
    status: 'Protected',
    severity: 'success'
  },
  {
    id: 'security-2',
    title: 'Threat Detection',
    description: 'Real-time threat detection and response',
    type: 'security',
    href: '/super-admin/security',
    priority: 'critical',
    status: 'Active',
    severity: 'info'
  },
  {
    id: 'security-3',
    title: 'Firewall Management',
    description: 'Network firewall rules and configurations',
    type: 'security',
    href: '/super-admin/security',
    priority: 'high',
    status: 'Enabled'
  },
  {
    id: 'security-4',
    title: 'Access Logs',
    description: 'User access and authentication logs',
    type: 'security',
    href: '/super-admin/security/logs',
    priority: 'high',
    status: 'Recording'
  },
  {
    id: 'security-5',
    title: 'IP Restrictions',
    description: 'IP whitelist and blacklist management',
    type: 'security',
    href: '/super-admin/security/ip',
    priority: 'medium',
    status: 'Configured'
  },
  // Analytics & Monitoring
  {
    id: 'analytics-1',
    title: 'System Analytics',
    description: 'Comprehensive system performance analytics',
    type: 'analytics',
    href: '/super-admin/analytics',
    priority: 'medium',
    status: 'Collecting'
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
    title: 'Performance Metrics',
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
    href: '/super-admin/system',
    priority: 'critical',
    status: 'Online'
  },
  {
    id: 'backup-1',
    title: 'Backup Management',
    description: 'Automated backup and recovery systems',
    type: 'backup',
    href: '/super-admin/settings',
    priority: 'critical',
    status: 'Scheduled'
  },
  {
    id: 'backup-2',
    title: 'Data Recovery',
    description: 'Restore data from backups',
    type: 'backup',
    href: '/super-admin/settings/backup',
    priority: 'high',
    status: 'Ready'
  },
  // Network & API
  {
    id: 'network-1',
    title: 'Network Status',
    description: 'Network connectivity and performance',
    type: 'network',
    href: '/super-admin/system',
    priority: 'critical',
    status: 'Connected'
  },
  {
    id: 'api-1',
    title: 'API Management',
    description: 'API endpoints and rate limiting',
    type: 'api',
    href: '/super-admin/system',
    priority: 'high',
    status: 'Active'
  },
  {
    id: 'api-2',
    title: 'API Documentation',
    description: 'API documentation and testing',
    type: 'api',
    href: '/super-admin/system/api',
    priority: 'medium',
    status: 'Available'
  },
  // Products & Orders
  {
    id: 'product-1',
    title: 'Product Management',
    description: 'Manage all products and categories',
    type: 'product',
    href: '/super-admin/products',
    priority: 'high',
    status: 'Active'
  },
  {
    id: 'product-2',
    title: 'Product Categories',
    description: 'Manage product categories and classifications',
    type: 'product',
    href: '/super-admin/products/categories',
    priority: 'medium',
    status: 'Configured'
  },
  {
    id: 'product-3',
    title: 'Pending Approvals',
    description: 'Products awaiting approval',
    type: 'product',
    href: '/super-admin/products/pending',
    priority: 'high',
    status: 'Pending'
  },
  {
    id: 'order-1',
    title: 'Order Management',
    description: 'Manage all orders and transactions',
    type: 'order',
    href: '/super-admin/orders',
    priority: 'high',
    status: 'Active'
  },
  {
    id: 'order-2',
    title: 'Pending Orders',
    description: 'Orders awaiting processing',
    type: 'order',
    href: '/super-admin/orders/pending',
    priority: 'high',
    status: 'Pending'
  },
  {
    id: 'order-3',
    title: 'Order Disputes',
    description: 'Handle customer disputes and refunds',
    type: 'order',
    href: '/super-admin/orders/disputes',
    priority: 'critical',
    status: 'Open'
  },
  // Settings & Configuration
  {
    id: 'settings-1',
    title: 'General Settings',
    description: 'System-wide configuration settings',
    type: 'configuration',
    href: '/super-admin/settings',
    priority: 'high',
    status: 'Configured'
  },
  {
    id: 'settings-2',
    title: 'Email Configuration',
    description: 'Email server and notification settings',
    type: 'configuration',
    href: '/super-admin/settings/email',
    priority: 'medium',
    status: 'Active'
  },
  {
    id: 'settings-3',
    title: 'Payment Settings',
    description: 'Payment gateway configurations',
    type: 'configuration',
    href: '/super-admin/settings/payments',
    priority: 'high',
    status: 'Configured'
  },
  {
    id: 'settings-4',
    title: 'Maintenance Mode',
    description: 'Enable/disable maintenance mode',
    type: 'configuration',
    href: '/super-admin/settings',
    priority: 'critical',
    status: 'Disabled'
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'system':
      return <Server className="w-4 h-4" />;
    case 'user':
      return <Users className="w-4 h-4" />;
    case 'security':
      return <Shield className="w-4 h-4" />;
    case 'analytics':
      return <BarChart3 className="w-4 h-4" />;
    case 'monitoring':
      return <Activity className="w-4 h-4" />;
    case 'configuration':
      return <Settings className="w-4 h-4" />;
    case 'audit':
      return <Eye className="w-4 h-4" />;
    case 'backup':
      return <HardDrive className="w-4 h-4" />;
    case 'network':
      return <Network className="w-4 h-4" />;
    case 'database':
      return <Database className="w-4 h-4" />;
    case 'api':
      return <Globe className="w-4 h-4" />;
    case 'integration':
      return <Zap className="w-4 h-4" />;
    case 'report':
      return <FileText className="w-4 h-4" />;
    case 'alert':
      return <Bell className="w-4 h-4" />;
    case 'log':
      return <FileText className="w-4 h-4" />;
    case 'performance':
      return <TrendingUp className="w-4 h-4" />;
    case 'product':
      return <FileText className="w-4 h-4" />;
    case 'order':
      return <FileText className="w-4 h-4" />;
    default:
      return <Search className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'system':
      return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
    case 'user':
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
    case 'security':
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
    case 'analytics':
      return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
    case 'monitoring':
      return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
    case 'configuration':
      return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20';
    case 'audit':
      return 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/20';
    case 'backup':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20';
    case 'network':
      return 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/20';
    case 'database':
      return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20';
    case 'api':
      return 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/20';
    case 'integration':
      return 'text-lime-600 dark:text-lime-400 bg-lime-100 dark:bg-lime-900/20';
    case 'report':
      return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700';
    case 'alert':
      return 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/20';
    case 'log':
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    case 'performance':
      return 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/20';
    case 'product':
      return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20';
    case 'order':
      return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'critical':
      return <AlertTriangle className="w-3 h-3 text-red-500 fill-current" />;
    case 'high':
      return <Star className="w-3 h-3 text-orange-500 fill-current" />;
    case 'medium':
      return <Star className="w-3 h-3 text-yellow-500 fill-current" />;
    case 'low':
      return <Star className="w-3 h-3 text-gray-400 fill-current" />;
    default:
      return null;
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'error':
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
    case 'info':
      return <Info className="w-3 h-3 text-blue-500" />;
    case 'success':
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Healthy':
    case 'Active':
    case 'Online':
    case 'Connected':
    case 'Valid':
    case 'Protected':
    case 'Secured':
    case 'Enabled':
    case 'Configured':
    case 'Optimized':
    case 'Recording':
    case 'Tracking':
    case 'Collecting':
    case 'Monitoring':
    case 'Normal':
    case 'Scheduled':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'Pending':
    case 'Warning':
    case 'Low Stock':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'Critical':
    case 'Error':
    case 'Failed':
    case 'Offline':
    case 'Disconnected':
    case 'Invalid':
    case 'Out of Stock':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    case 'In Stock':
    case 'Available':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export function SuperAdminSearchDropdown() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Search function
  const performSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const filteredResults = searchData.filter(item => {
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

      setSearchResults(sortedResults.slice(0, 10)); // Limit to 10 results
      setIsSearching(false);
    }, 200);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Show results when search term changes
  useEffect(() => {
    if (searchTerm.trim() && searchResults.length > 0) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchTerm, searchResults]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSearchResults) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && searchResults[selectedIndex]) {
            handleResultClick(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSearchResults(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearchResults, searchResults, selectedIndex]);

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputFocus = () => {
    if (searchTerm.trim() && searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    setShowSearchResults(false);
    setSearchTerm('');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search super admin panel..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-72 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showSearchResults && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            {isSearching ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3"></div>
                <p className="text-sm font-medium">Searching super admin systems...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      selectedIndex === index ? 'bg-gray-50 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Type Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {result.title}
                          </h4>
                          {result.priority && (
                            <div className="flex-shrink-0">
                              {getPriorityIcon(result.priority)}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {result.description}
                        </p>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                            {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                          </span>
                          {result.status && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                              {result.status}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : searchTerm.trim() ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">No super admin results found</p>
                <p className="text-xs">Try searching for "system", "security", "users", etc.</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 