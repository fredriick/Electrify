'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Shield,
  TrendingUp,
  Settings,
  LogIn,
  UserPlus,
  Key,
  ChevronLeft,
  ChevronRight,
  Crown,
  Heart,
  MessageSquare
} from 'lucide-react';

const navigation = [
  {
    title: 'Customer',
    items: [
      { name: 'Marketplace', href: '/', icon: ShoppingCart },
      { name: 'Cart', href: '/cart', icon: ShoppingCart },
      { name: 'Wishlist', href: '/wishlist', icon: Heart },
      { name: 'My Orders', href: '/my-orders', icon: Package },
      { name: 'My Quotes', href: '/my-quotes', icon: MessageSquare },
      { name: 'Login', href: '/login', icon: LogIn },
      { name: 'Register', href: '/register', icon: UserPlus },
    ]
  },
  {
    title: 'Supplier',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: TrendingUp },
      { name: 'Inventory', href: '/inventory', icon: Package },
      { name: 'Orders', href: '/orders', icon: ShoppingCart },
      { name: 'Payouts', href: '/payouts', icon: Settings },
    ]
  },
  {
    title: 'Admin',
    items: [
      { name: 'Admin Login', href: '/admin-login', icon: Shield },
      { name: 'Admin Dashboard', href: '/admin-dashboard', icon: Shield },
    ]
  },
  {
    title: 'Super Admin',
    items: [
      { name: 'Super Admin Login', href: '/super-admin-login', icon: Crown },
      { name: 'Super Admin Dashboard', href: '/super-admin-dashboard', icon: Crown },
      { name: 'System Settings', href: '/super-admin/settings', icon: Settings },
      { name: 'User Management', href: '/super-admin/users', icon: Users },
      { name: 'Security Overview', href: '/super-admin/security', icon: Shield },
      { name: 'Analytics', href: '/super-admin/analytics', icon: TrendingUp },
    ]
  },
  {
    title: 'Auth',
    items: [
      { name: 'Reset Password', href: '/reset-password', icon: Key },
      { name: 'Admin Reset Password', href: '/admin-reset-password', icon: Key },
      { name: 'Super Admin Reset Password', href: '/super-admin-reset-password', icon: Key },
    ]
  }
];

export default function Navigation() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { user, profile } = useAuth();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Only show navigation for admin users
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';
  
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={toggleExpanded}
        className="absolute -left-2 top-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
      >
        {isExpanded ? (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Navigation Panel */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-64" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center mb-4 flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg mr-3">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Navigation
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '300px' }}>
              <div className="space-y-4 pr-2 pb-4">
                {navigation.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-2 py-1 rounded text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Icon className="w-3 h-3 mr-2" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Icon */}
      {!isExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
            <span className="text-white font-bold text-xs">S</span>
          </div>
        </div>
      )}
    </div>
  );
} 
 
 
 
 
 