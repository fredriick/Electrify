'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { clearUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Menu,
  X,
  Crown,
  BarChart3,
  Activity,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Database,
  FileText,
  AlertTriangle,
  Shield,
  Zap,
  Globe,
  Server,
  Key,
  Eye,
  Trash2,
  Archive,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Tag,
  Mail,
  CreditCard,
  Wrench,
  MessageSquare,
  Info,
  TrendingUp,
  TrendingDown,
  Circle,
  ExternalLink
} from 'lucide-react';
import { SuperAdminSearchDropdown } from '@/components/ui/SuperAdminSearchDropdown';
import { LucideIcon } from 'lucide-react';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

interface SubMenuItem {
  name: string;
  href: string;
  current: boolean;
  icon?: LucideIcon;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  current: boolean;
  submenu?: SubMenuItem[];
}

const superAdminNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/super-admin-dashboard',
    icon: LayoutDashboard,
    current: true
  },
  {
    name: 'System Control',
    href: '/super-admin/system',
    icon: Crown,
    current: false,
    submenu: [
      {
        name: 'System Overview',
        href: '/super-admin/system',
        current: false,
        icon: Activity
      },
      {
        name: 'Shipping Fee Settings',
        href: '/super-admin/system/settings/shipping-fee',
        current: false,
        icon: Settings
      },
      {
        name: 'Server Management',
        href: '/super-admin/system/servers',
        current: false,
        icon: Server
      },
      {
        name: 'Database Control',
        href: '/super-admin/system/database',
        current: false,
        icon: Database
      },
      {
        name: 'API Management',
        href: '/super-admin/system/api',
        current: false,
        icon: Key
      }
    ]
  },
  {
    name: 'User Management',
    href: '/super-admin/users',
    icon: Users,
    current: false,
    submenu: [
      {
        name: 'All Users',
        href: '/super-admin/users',
        current: false,
        icon: Users
      },
      {
        name: 'Customers',
        href: '/super-admin/users/customers',
        current: false,
        icon: User
      },
      {
        name: 'Suppliers',
        href: '/super-admin/users/suppliers',
        current: false,
        icon: Package
      },
      {
        name: 'Admins',
        href: '/super-admin/users/admins',
        current: false,
        icon: Shield
      },
      {
        name: 'Super Admins',
        href: '/super-admin/users/super-admins',
        current: false,
        icon: Crown
      }
    ]
  },
  {
    name: 'Security',
    href: '/super-admin/security',
    icon: Shield,
    current: false,
    submenu: [
      {
        name: 'Security Overview',
        href: '/super-admin/security',
        current: false,
        icon: Shield
      },
      {
        name: 'Security Alerts',
        href: '/super-admin/security/alerts',
        current: false,
        icon: AlertTriangle
      },
      {
        name: 'Threat Management',
        href: '/super-admin/security/threats',
        current: false,
        icon: AlertCircle
      },
      {
        name: 'Access Logs',
        href: '/super-admin/security/logs',
        current: false,
        icon: FileText
      },
      {
        name: 'IP Restrictions',
        href: '/super-admin/security/ip',
        current: false,
        icon: Globe
      },
      {
        name: 'Two-Factor Auth',
        href: '/super-admin/security/2fa',
        current: false,
        icon: Key
      },
      {
        name: 'Encryption Keys',
        href: '/super-admin/security/keys',
        current: false,
        icon: Key
      }
    ]
  },
  {
    name: 'Product Management',
    href: '/super-admin/products',
    icon: Package,
    current: false,
    submenu: [
      {
        name: 'All Products',
        href: '/super-admin/products',
        current: false,
        icon: Package
      },
      {
        name: 'Pending Approval',
        href: '/super-admin/products/pending',
        current: false,
        icon: Clock
      },
      {
        name: 'Categories',
        href: '/super-admin/products/categories',
        current: false,
        icon: Tag
      },
      {
        name: 'Bulk Operations',
        href: '/super-admin/products/bulk',
        current: false,
        icon: Archive
      }
    ]
  },
  {
    name: 'Order Management',
    href: '/super-admin/orders',
    icon: ShoppingCart,
    current: false,
    submenu: [
      {
        name: 'All Orders',
        href: '/super-admin/orders',
        current: false,
        icon: Package
      },
      {
        name: 'Pending Orders',
        href: '/super-admin/orders/pending',
        current: false,
        icon: Clock
      },
      {
        name: 'Disputes',
        href: '/super-admin/orders/disputes',
        current: false,
        icon: AlertTriangle
      },
      {
        name: 'Refunds',
        href: '/super-admin/orders/refunds',
        current: false,
        icon: RefreshCw
      }
    ]
  },
  {
    name: 'Analytics',
    href: '/super-admin/analytics',
    icon: BarChart3,
    current: false
  },
  {
    name: 'System Settings',
    href: '/super-admin/settings',
    icon: Settings,
    current: false,
    submenu: [
      {
        name: 'General Settings',
        href: '/super-admin/settings',
        current: false,
        icon: Settings
      },
      {
        name: 'Email Configuration',
        href: '/super-admin/settings/email',
        current: false,
        icon: Mail
      },
      {
        name: 'Payment Settings',
        href: '/super-admin/settings/payments',
        current: false,
        icon: CreditCard
      },
      {
        name: 'Backup & Restore',
        href: '/super-admin/settings/backup',
        current: false,
        icon: Archive
      },
      {
        name: 'Maintenance Mode',
        href: '/super-admin/settings/maintenance',
        current: false,
        icon: Wrench
      }
    ]
  }
];

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [systemMenuOpen, setSystemMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [securityMenuOpen, setSecurityMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [activityMenuOpen, setActivityMenuOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  // Mock notification data
  const notifications = [
    {
      id: 1,
      title: "New User Registration",
      message: "A new supplier has registered and is pending approval",
      type: "info",
      time: "2 minutes ago",
      read: false
    },
    {
      id: 2,
      title: "Security Alert",
      message: "Unusual login activity detected from new IP address",
      type: "warning",
      time: "5 minutes ago",
      read: false
    },
    {
      id: 3,
      title: "System Update",
      message: "Database backup completed successfully",
      type: "success",
      time: "10 minutes ago",
      read: true
    },
    {
      id: 4,
      title: "Order Dispute",
      message: "New dispute filed for order #ORD-2024-001",
      type: "error",
      time: "15 minutes ago",
      read: false
    },
    {
      id: 5,
      title: "Payment Processing",
      message: "Payment gateway maintenance scheduled for tonight",
      type: "info",
      time: "1 hour ago",
      read: true
    }
  ];

  // Mock activity data
  const activities = [
    {
      id: 1,
      action: "User Login",
      user: "admin@electrify.com",
      details: "Successful login from 192.168.1.100",
      time: "1 minute ago",
      status: "success"
    },
    {
      id: 2,
      action: "Product Created",
      user: "supplier@example.com",
      details: "New solar panel product added to catalog",
      time: "3 minutes ago",
      status: "info"
    },
    {
      id: 3,
      action: "Order Processed",
      user: "system",
      details: "Order #ORD-2024-002 marked as shipped",
      time: "5 minutes ago",
      status: "success"
    },
    {
      id: 4,
      action: "Security Scan",
      user: "system",
      details: "Automated security scan completed - no threats found",
      time: "10 minutes ago",
      status: "success"
    },
    {
      id: 5,
      action: "Database Backup",
      user: "system",
      details: "Daily backup completed successfully",
      time: "15 minutes ago",
      status: "info"
    },
    {
      id: 6,
      action: "Failed Login",
      user: "unknown@example.com",
      details: "Failed login attempt from 203.45.67.89",
      time: "20 minutes ago",
      status: "error"
    }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Refs for dropdowns
  const notificationRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationMenuOpen(false);
      }
      if (activityRef.current && !activityRef.current.contains(event.target as Node)) {
        setActivityMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(clearUser());
    router.push('/super-admin-login');
  };

  // Helper to determine if a submenu should be open by default (if on a subroute)
  const isSubmenuActive = (submenu: { href: string }[] | undefined): boolean =>
    Array.isArray(submenu) && submenu.some((sub) => pathname === sub.href);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`z-50 bg-gradient-to-b from-purple-900 to-indigo-900 border-r border-purple-700 flex flex-col h-full
        fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:ml-0'
      } ${sidebarCollapsed ? 'w-20' : 'w-80'}
      lg:fixed lg:left-0 lg:top-0 lg:bottom-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-purple-700 flex-shrink-0">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl mr-3 relative">
              <Crown className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Zap className="w-2 h-2 text-yellow-900" />
              </div>
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-white">
                Super Admin
              </h1>
            )}
          </div>
          
          <div className="flex items-center">
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden lg:flex p-2 rounded-md text-purple-300 hover:text-white hover:bg-purple-700/50"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-purple-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="space-y-2">
            {superAdminNavigation.map((item) => {
              const isActive = pathname === item.href || (item.submenu && item.submenu.some(sub => pathname === sub.href));
              const hasSubmenu = item.submenu && item.submenu.length > 0;

              // Handle different submenu types
              if (item.name === 'System Control') {
                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                        isActive ? 'bg-purple-700/50 text-white' : 'text-purple-200 hover:bg-purple-700/30 hover:text-white'
                      }`}
                      onClick={() => setSystemMenuOpen((open) => !open)}
                      aria-expanded={systemMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="system-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          {systemMenuOpen || isSubmenuActive(item.submenu) ? (
                            <ChevronUp className="ml-auto w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-auto w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>
                    
                    {(systemMenuOpen || isSubmenuActive(item.submenu)) && !sidebarCollapsed && (
                      <div id="system-menu" className="ml-6 mt-2 space-y-1">
                        {item.submenu?.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors flex items-center ${
                                isSubActive ? 'bg-purple-600/30 text-white' : 'text-purple-300 hover:bg-purple-700/30 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.icon && (
                                <subItem.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                              )}
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.name === 'User Management') {
                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                        isActive ? 'bg-purple-700/50 text-white' : 'text-purple-200 hover:bg-purple-700/30 hover:text-white'
                      }`}
                      onClick={() => setUserMenuOpen((open) => !open)}
                      aria-expanded={userMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="user-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          {userMenuOpen || isSubmenuActive(item.submenu) ? (
                            <ChevronUp className="ml-auto w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-auto w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>
                    
                    {(userMenuOpen || isSubmenuActive(item.submenu)) && !sidebarCollapsed && (
                      <div id="user-menu" className="ml-6 mt-2 space-y-1">
                        {item.submenu?.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors flex items-center ${
                                isSubActive ? 'bg-purple-600/30 text-white' : 'text-purple-300 hover:bg-purple-700/30 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.icon && (
                                <subItem.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                              )}
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.name === 'Security') {
                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                        isActive ? 'bg-purple-700/50 text-white' : 'text-purple-200 hover:bg-purple-700/30 hover:text-white'
                      }`}
                      onClick={() => setSecurityMenuOpen((open) => !open)}
                      aria-expanded={securityMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="security-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          {securityMenuOpen || isSubmenuActive(item.submenu) ? (
                            <ChevronUp className="ml-auto w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-auto w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>
                    
                    {(securityMenuOpen || isSubmenuActive(item.submenu)) && !sidebarCollapsed && (
                      <div id="security-menu" className="ml-6 mt-2 space-y-1">
                        {item.submenu?.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors flex items-center ${
                                isSubActive ? 'bg-purple-600/30 text-white' : 'text-purple-300 hover:bg-purple-700/30 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.icon && (
                                <subItem.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                              )}
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.name === 'Product Management') {
                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                        isActive ? 'bg-purple-700/50 text-white' : 'text-purple-200 hover:bg-purple-700/30 hover:text-white'
                      }`}
                      onClick={() => setProductMenuOpen((open) => !open)}
                      aria-expanded={productMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="product-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          {productMenuOpen || isSubmenuActive(item.submenu) ? (
                            <ChevronUp className="ml-auto w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-auto w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>
                    {(productMenuOpen || isSubmenuActive(item.submenu)) && !sidebarCollapsed && (
                      <div id="product-menu" className="ml-6 mt-2 space-y-1">
                        {item.submenu?.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors flex items-center ${
                                isSubActive ? 'bg-purple-600/30 text-white' : 'text-purple-300 hover:bg-purple-700/30 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.icon && (
                                <subItem.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                              )}
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.name === 'Order Management') {
                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                        isActive ? 'bg-purple-700/50 text-white' : 'text-purple-200 hover:bg-purple-700/30 hover:text-white'
                      }`}
                      onClick={() => setOrderMenuOpen((open) => !open)}
                      aria-expanded={orderMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="order-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          {orderMenuOpen || isSubmenuActive(item.submenu) ? (
                            <ChevronUp className="ml-auto w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-auto w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>
                    
                    {(orderMenuOpen || isSubmenuActive(item.submenu)) && !sidebarCollapsed && (
                      <div id="order-menu" className="ml-6 mt-2 space-y-1">
                        {item.submenu?.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors flex items-center ${
                                isSubActive ? 'bg-purple-600/30 text-white' : 'text-purple-300 hover:bg-purple-700/30 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.icon && (
                                <subItem.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                              )}
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.name === 'System Settings') {
                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                        isActive ? 'bg-purple-700/50 text-white' : 'text-purple-200 hover:bg-purple-700/30 hover:text-white'
                      }`}
                      onClick={() => setSettingsMenuOpen((open) => !open)}
                      aria-expanded={settingsMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="settings-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          {settingsMenuOpen || isSubmenuActive(item.submenu) ? (
                            <ChevronUp className="ml-auto w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-auto w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>
                    
                    {(settingsMenuOpen || isSubmenuActive(item.submenu)) && !sidebarCollapsed && (
                      <div id="settings-menu" className="ml-6 mt-2 space-y-1">
                        {item.submenu?.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors flex items-center ${
                                isSubActive ? 'bg-purple-600/30 text-white' : 'text-purple-300 hover:bg-purple-700/30 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.icon && (
                                <subItem.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                              )}
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Default: no submenu or not special case
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive ? 'bg-purple-700/50 text-white' : 'text-purple-200 hover:bg-purple-700/30 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={`h-6 w-6 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="flex-shrink-0 p-4 border-t border-purple-700">
          {!sidebarCollapsed ? (
            <>
              <button
                className="flex items-center gap-3 w-full focus:outline-none"
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-expanded={profileMenuOpen}
                aria-controls="profile-account-menu"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center relative">
                  <Crown className="w-6 h-6 text-white" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Zap className="w-2 h-2 text-yellow-900" />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-white">{user?.firstName || 'Super Admin'}</span>
                  <span className="text-xs text-purple-300">Super Administrator</span>
                </div>
                {profileMenuOpen ? (
                  <ChevronUp className="ml-auto w-4 h-4" />
                ) : (
                  <ChevronDown className="ml-auto w-4 h-4" />
                )}
              </button>
              
              {profileMenuOpen && (
                <div id="profile-account-menu" className="mt-3 ml-2 space-y-1">
                  <Link
                    href="/super-admin/profile"
                    className={`block px-4 py-2 text-sm rounded-lg transition-colors ${pathname === '/super-admin/profile' ? 'bg-purple-600/30 text-white' : 'text-purple-300 hover:bg-purple-700/30 hover:text-white'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2 inline" />
                    Profile
                  </Link>

                  <Link
                    href="/super-admin/settings"
                    className={`block px-4 py-2 text-sm rounded-lg transition-colors ${pathname === '/super-admin/settings' ? 'bg-purple-600/30 text-white' : 'text-purple-300 hover:bg-purple-700/30 hover:text-white'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2 inline" />
                    Settings
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center relative">
                <Crown className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="w-2 h-2 text-yellow-900" />
                </div>
              </div>
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 rounded-md text-purple-300 hover:text-white hover:bg-purple-700/50"
                title="Expand sidebar"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Logout section */}
        <div className="flex-shrink-0 p-4 border-t border-purple-700">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-900/20 rounded-lg transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className={`h-6 w-6 ${sidebarCollapsed ? '' : 'mr-3'}`} />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'}
      `}>
        {/* Top Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mr-3"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Super Admin Dashboard
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                  <SuperAdminSearchDropdown />
                </div>

                {/* System Status */}
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-700 dark:text-green-300 font-medium">System Online</span>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  
                  {notificationMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                          <button className="text-sm text-blue-600 hover:text-blue-700">Mark all read</button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                                !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === 'error' ? 'bg-red-500' :
                                  notification.type === 'warning' ? 'bg-yellow-500' :
                                  notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                }`}></div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No notifications
                          </div>
                        )}
                      </div>
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity */}
                <div className="relative" ref={activityRef}>
                  <button 
                    onClick={() => setActivityMenuOpen(!activityMenuOpen)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Activity className="w-5 h-5" />
                  </button>
                  
                  {activityMenuOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                          <button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {activities.length > 0 ? (
                          activities.map((activity) => (
                            <div 
                              key={activity.id} 
                              className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  activity.status === 'error' ? 'bg-red-500' :
                                  activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                }`}></div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.user}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.details}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No recent activity
                          </div>
                        )}
                      </div>
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View activity log
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 