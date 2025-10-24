'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Settings, 
  LogOut,
  Menu,
  X,
  Store,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  MessageSquare,
  Truck,
  Bell
} from 'lucide-react';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    current: true
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    current: false
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    current: false
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    current: false,
    submenu: [
      {
        name: 'All Orders',
        href: '/orders',
        current: false
      },
      {
        name: 'Returns & Refunds',
        href: '/returns',
        current: false
      }
    ]
  },
  {
    name: 'Payouts',
    href: '/payouts',
    icon: DollarSign,
    current: false
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    current: false
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    current: false,
    submenu: [
      {
        name: 'All Customers',
        href: '/customers',
        current: false
      },
      {
        name: 'Segments',
        href: '/customers/segments',
        current: false
      }
    ]
  },
  {
    name: 'Installation Services',
    href: '/installation-services',
    icon: Settings,
    current: false
  },
  {
    name: 'Custom Quotes',
    href: '/custom-quotes',
    icon: MessageSquare,
    current: false
  },
  {
    name: 'Shipping',
    href: '/shipping',
    icon: Truck,
    current: false
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(false);
  const [customersMenuOpen, setCustomersMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();

  // Note: Authorization is handled by SupplierProtectedRoute wrapper
  // No need for duplicate checks here

  // Get store name from user profile
  const storeName = profile?.shop_name || profile?.business_name || 'Electrify Solar Store';

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    if (profile?.first_name) {
      return profile.first_name.charAt(0).toUpperCase();
    }
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return profile.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/sell');
    } catch (error) {
      // Show user-friendly error message
      alert('Logout failed. Please try again.');
      // Fallback: redirect anyway to ensure user can't access protected content
      router.push('/sell');
    }
  };

  // Click outside handler for profile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Helper to determine if a submenu should be open by default (if on a subroute)
  const isSubmenuActive = (submenu: { href: string }[] | undefined): boolean =>
    Array.isArray(submenu) && submenu.some((sub) => pathname === sub.href);

  // Get page title based on current pathname
  const getPageTitle = () => {
    const currentNav = navigation.find(item => 
      item.href === pathname || (item.submenu && item.submenu.some(sub => sub.href === pathname))
    );
    return currentNav ? currentNav.name : 'Dashboard';
  };

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
      <aside className={`z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full
        fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:ml-0'
      } ${sidebarCollapsed ? 'w-20' : 'w-80'}
      lg:fixed lg:left-0 lg:top-0 lg:bottom-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg mr-3">
              <Store className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Seller Hub
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden lg:flex p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.submenu && item.submenu.some(sub => pathname === sub.href));
              const hasSubmenu = item.submenu && item.submenu.length > 0;

              // Expand/collapse logic for Orders and Customers
              if (item.name === 'Orders') {
                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                        isActive ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      onClick={() => setOrdersMenuOpen((open) => !open)}
                      aria-expanded={ordersMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="orders-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          <svg className={`ml-auto w-4 h-4 transition-transform ${ordersMenuOpen || isSubmenuActive(item.submenu) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </>
                      )}
                    </button>
                    
                    {!sidebarCollapsed && (ordersMenuOpen || isSubmenuActive(item.submenu)) && item.submenu && (
                      <div id="orders-menu" className="ml-6 mt-2 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                isSubActive ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
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
              if (item.name === 'Customers') {
                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                        isActive ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      onClick={() => setCustomersMenuOpen((open) => !open)}
                      aria-expanded={customersMenuOpen || isSubmenuActive(item.submenu)}
                      aria-controls="customers-menu"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          <svg className={`ml-auto w-4 h-4 transition-transform ${customersMenuOpen || isSubmenuActive(item.submenu) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </>
                      )}
                    </button>
                    
                    {!sidebarCollapsed && (customersMenuOpen || isSubmenuActive(item.submenu)) && item.submenu && (
                      <div id="customers-menu" className="ml-6 mt-2 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                isSubActive ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
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

              // Default: no submenu or not Orders/Customers
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={`h-6 w-6 flex-shrink-0 ${
                        isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                  {/* Submenu for other items (if any) */}
                  {!sidebarCollapsed && item.submenu && (ordersMenuOpen || isSubmenuActive(item.submenu)) && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                              isSubActive ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
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
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed ? (
            <>
              <button
                className="flex items-center gap-3 w-full focus:outline-none"
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-expanded={profileMenuOpen}
                aria-controls="profile-account-menu"
              >
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                  {profile?.shop_logo ? (
                    <img 
                      src={profile.shop_logo} 
                      alt="Shop Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">{getUserInitials()}</span>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{storeName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Seller Account</span>
                </div>
                <svg className={`ml-auto w-4 h-4 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {profileMenuOpen && (
                <div id="profile-account-menu" className="mt-3 ml-2 space-y-1">
                  <Link
                    href="/profile"
                    className={`block px-4 py-2 text-sm rounded-lg transition-colors ${pathname === '/profile' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2 inline" />
                    Profile
                  </Link>

                  <Link
                    href="/security"
                    className={`block px-4 py-2 text-sm rounded-lg transition-colors ${pathname === '/supplier/security' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Shield className="w-4 h-4 mr-2 inline" />
                    Security
                  </Link>

                  <Link
                    href="/account-settings"
                    className={`block px-4 py-2 text-sm rounded-lg transition-colors ${pathname === '/account-settings' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
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
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.shop_logo ? (
                  <img 
                    src={profile.shop_logo} 
                    alt="Shop Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-base font-medium text-gray-700 dark:text-gray-300">{getUserInitials()}</span>
                )}
              </div>
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Expand sidebar"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Logout section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${
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
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getPageTitle()}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationDropdown />
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 