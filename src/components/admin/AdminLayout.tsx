'use client';

import { useState } from 'react';
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
  Shield,
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
  FileCheck2,
  DollarSign,
  MessageSquare,
  Globe
} from 'lucide-react';
import { AdminNotificationDropdown } from '@/components/ui/AdminNotificationDropdown';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { AdminSearchProvider } from '@/contexts/AdminSearchContext';
import { AdminSearchDropdown } from '@/components/ui/AdminSearchDropdown';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavigation = [
  {
    name: 'Dashboard',
    href: '/admin-dashboard',
    icon: LayoutDashboard,
    current: true
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    current: false,
    submenu: [
      {
        name: 'All Users',
        href: '/admin/users',
        current: false
      },
      {
        name: 'Customers',
        href: '/admin/users/customers',
        current: false
      },
      {
        name: 'Suppliers',
        href: '/admin/users/suppliers',
        current: false
      },
      {
        name: 'Admins',
        href: '/admin/users/admins',
        current: false
      }
    ]
  },
  {
    name: 'Document Approval',
    href: '/admin/document-approval',
    icon: FileCheck2,
    current: false,
    submenu: [
      {
        name: 'Seller Documents',
        href: '/admin/document-approval/sellers',
        current: false
      },
      {
        name: 'Business Licenses',
        href: '/admin/document-approval/business-licenses',
        current: false
      },
      {
        name: 'Bank Documents',
        href: '/admin/document-approval/bank-documents',
        current: false
      }
    ]
  },
  {
    name: 'Product Management',
    href: '/admin/products',
    icon: Package,
    current: false,
    submenu: [
      {
        name: 'All Products',
        href: '/admin/products',
        current: false
      },
      {
        name: 'Pending Approval',
        href: '/admin/products/pending',
        current: false
      },
      {
        name: 'Categories',
        href: '/admin/products/categories',
        current: false
      },
      {
        name: 'Fix Inconsistent Products',
        href: '/admin/products/fix-inconsistent',
        current: false
      }
    ]
  },
  {
    name: 'Order Management',
    href: '/admin/orders',
    icon: ShoppingCart,
    current: false,
    submenu: [
      {
        name: 'All Orders',
        href: '/admin/orders',
        current: false
      },
      {
        name: 'Pending Orders',
        href: '/admin/orders/pending',
        current: false
      },
      {
        name: 'Disputes & Refunds',
        href: '/admin/orders/disputes',
        current: false
      }
    ]
  },
  {
    name: 'Payout Management',
    href: '/admin/payouts',
    icon: DollarSign,
    current: false
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    current: false
  },
  {
    name: 'Custom Quotes',
    href: '/admin/custom-quotes',
    icon: MessageSquare,
    current: false
  },
  {
    name: 'System',
    href: '/admin/system',
    icon: Settings,
    current: false,
    submenu: [
      {
        name: 'System Settings',
        href: '/admin/system/settings',
        current: false
      },
      {
        name: 'Currency Management',
        href: '/admin/currency',
        current: false
      },
      {
        name: 'Shipping Fee Settings',
        href: '/admin/system/settings/shipping-fee',
        current: false
      },
      {
        name: 'System Status',
        href: '/admin/system-status',
        current: false
      },
      {
        name: 'Notifications',
        href: '/admin/notifications',
        current: false
      },
      {
        name: 'Database',
        href: '/admin/system/database',
        current: false
      },
      {
        name: 'Logs',
        href: '/admin/system/logs',
        current: false
      },
      {
        name: 'Security',
        href: '/admin/system/security',
        current: false
      },
      {
        name: 'Installation Services',
        href: '/admin/system/installation-services',
        current: false
      },
      {
        name: 'VAT Management',
        href: '/admin/vat-management',
        current: false
      },
      {
        name: 'Revenue Management',
        href: '/admin/revenue-management',
        current: false
      }
    ]
  }
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [documentApprovalMenuOpen, setDocumentApprovalMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);
  const [systemMenuOpen, setSystemMenuOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(clearUser());
    router.push('/admin-login');
  };

  // Helper to determine if a submenu should be open by default (if on a subroute)
  const isSubmenuActive = (submenu: { href: string }[] | undefined): boolean =>
    Array.isArray(submenu) && submenu.some((sub) => pathname === sub.href);

  return (
    <AdminSearchProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`z-50 bg-gray-900 dark:bg-gray-800 border-r border-gray-700 dark:border-gray-700 flex flex-col h-full
        fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:ml-0'
      } ${sidebarCollapsed ? 'w-20' : 'w-80'}
      lg:fixed lg:left-0 lg:top-0 lg:bottom-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-700 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg mr-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-white dark:text-white">
                Admin Panel
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden lg:flex p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href;

            // Special handling for items with submenus
            if (item.submenu) {
              // User Management submenu
              if (item.name === 'User Management') {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive || isSubmenuActive(item.submenu) ? 'bg-red-900/20 text-red-300' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      aria-expanded={userMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="user-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive || isSubmenuActive(item.submenu) ? 'text-red-400' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          <svg className={`ml-auto w-4 h-4 transition-transform ${userMenuOpen || isSubmenuActive(item.submenu) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
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
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                isSubActive ? 'bg-red-900/10 text-red-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Document Approval submenu
              if (item.name === 'Document Approval') {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setDocumentApprovalMenuOpen(!documentApprovalMenuOpen)}
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive || isSubmenuActive(item.submenu) ? 'bg-red-900/20 text-red-300' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      aria-expanded={documentApprovalMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="document-approval-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive || isSubmenuActive(item.submenu) ? 'text-red-400' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          <svg className={`ml-auto w-4 h-4 transition-transform ${documentApprovalMenuOpen || isSubmenuActive(item.submenu) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                    
                    {(documentApprovalMenuOpen || isSubmenuActive(item.submenu)) && !sidebarCollapsed && (
                      <div id="document-approval-menu" className="ml-6 mt-2 space-y-1">
                        {item.submenu?.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                isSubActive ? 'bg-red-900/10 text-red-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Product Management submenu
              if (item.name === 'Product Management') {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setProductMenuOpen(!productMenuOpen)}
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive || isSubmenuActive(item.submenu) ? 'bg-red-900/20 text-red-300' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      aria-expanded={productMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="product-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive || isSubmenuActive(item.submenu) ? 'text-red-400' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          <svg className={`ml-auto w-4 h-4 transition-transform ${productMenuOpen || isSubmenuActive(item.submenu) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
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
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                isSubActive ? 'bg-red-900/10 text-red-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Order Management submenu
              if (item.name === 'Order Management') {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setOrderMenuOpen(!orderMenuOpen)}
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive || isSubmenuActive(item.submenu) ? 'bg-red-900/20 text-red-300' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      aria-expanded={orderMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="order-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive || isSubmenuActive(item.submenu) ? 'text-red-400' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          <svg className={`ml-auto w-4 h-4 transition-transform ${orderMenuOpen || isSubmenuActive(item.submenu) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
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
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                isSubActive ? 'bg-red-900/10 text-red-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // System submenu
              if (item.name === 'System') {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setSystemMenuOpen(!systemMenuOpen)}
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive || isSubmenuActive(item.submenu) ? 'bg-red-900/20 text-red-300' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      aria-expanded={systemMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="system-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive || isSubmenuActive(item.submenu) ? 'text-red-400' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          <svg className={`ml-auto w-4 h-4 transition-transform ${systemMenuOpen || isSubmenuActive(item.submenu) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
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
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                isSubActive ? 'bg-red-900/10 text-red-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
            }

            // Default: no submenu or not special case
            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'bg-red-900/20 text-red-300' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`h-6 w-6 flex-shrink-0 ${
                      isActive ? 'text-red-400' : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

            {/* User Profile Section */}
            <div className="flex-shrink-0 p-4 border-t border-gray-700 dark:border-gray-700">
              {!sidebarCollapsed ? (
                <>
                  <button
                    className="flex items-center gap-3 w-full focus:outline-none"
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    aria-expanded={profileMenuOpen}
                    aria-controls="profile-account-menu"
                  >
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-base font-medium text-white">A</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-white">{user?.firstName || 'Admin'}</span>
                      <span className="text-xs text-gray-400">Administrator</span>
                    </div>
                    <svg className={`ml-auto w-4 h-4 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {profileMenuOpen && (
                    <div id="profile-account-menu" className="mt-3 ml-2 space-y-1">
                      <Link
                        href="/admin/profile"
                        className={`block px-4 py-2 text-sm rounded-lg transition-colors ${pathname === '/admin/profile' ? 'bg-red-900/10 text-red-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2 inline" />
                        Profile
                      </Link>

                      <Link
                        href="/admin/system/security"
                        className={`block px-4 py-2 text-sm rounded-lg transition-colors ${pathname === '/admin/system/security' ? 'bg-red-900/10 text-red-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Shield className="w-4 h-4 mr-2 inline" />
                        Security
                      </Link>

                      <Link
                        href="/admin/system/settings"
                        className={`block px-4 py-2 text-sm rounded-lg transition-colors ${pathname === '/admin/system/settings' ? 'bg-red-900/10 text-red-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
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
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-base font-medium text-white">A</span>
                  </div>
                  <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                    title="Expand sidebar"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Logout section */}
            <div className="flex-shrink-0 p-4 border-t border-gray-700 dark:border-gray-700">
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
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Admin Dashboard
                    </h1>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative hidden md:block">
                      <AdminSearchDropdown />
                    </div>

                    {/* Notifications */}
                    <AdminNotificationDropdown />

                    {/* System Status */}
                    <StatusIndicator />
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
      </AdminSearchProvider>
    );
  } 