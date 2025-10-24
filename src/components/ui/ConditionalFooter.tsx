'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on dashboard pages and checkout flow
  const isDashboardPage = pathname.startsWith('/dashboard') || 
                         pathname.startsWith('/admin-dashboard') ||
                         pathname.startsWith('/admin/') ||
                         pathname.startsWith('/inventory') ||
                         pathname.startsWith('/orders') ||
                         pathname.startsWith('/payouts') ||
                         pathname.startsWith('/analytics') ||
                         pathname.startsWith('/customers') ||
                         pathname.startsWith('/installation-services') ||
                         pathname.startsWith('/custom-quotes') ||
                         pathname.startsWith('/shipping') ||
                         pathname.startsWith('/returns') ||
                         pathname.startsWith('/notifications') ||
                         pathname.startsWith('/profile') ||
                         pathname.startsWith('/security') ||
                         pathname.startsWith('/account-settings') ||
                         pathname.startsWith('/checkout');

  if (isDashboardPage) {
    return null;
  }

  return <Footer />;
}


