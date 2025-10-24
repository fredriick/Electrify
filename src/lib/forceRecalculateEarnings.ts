import { sellerEarningsService } from './sellerEarningsService';
import { dashboardService } from './dashboardService';

/**
 * Force recalculate seller earnings and clear all caches
 * This can be called from the browser console to debug earnings issues
 */
export async function forceRecalculateEarnings(supplierId: string) {
  console.log('🔄 Force recalculating earnings for supplier:', supplierId);
  
  try {
    // Clear all dashboard caches
    dashboardService.clearAllCache();
    console.log('✅ Dashboard cache cleared');
    
    // Force recalculate seller earnings
    const success = await sellerEarningsService.recalculateSellerEarnings(supplierId);
    console.log('✅ Seller earnings recalculated:', success);
    
    // Get updated earnings
    const earnings = await sellerEarningsService.getSellerEarnings(supplierId);
    console.log('📊 Updated earnings:', earnings);
    
    return earnings;
  } catch (error) {
    console.error('❌ Error force recalculating earnings:', error);
    return null;
  }
}

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).forceRecalculateEarnings = forceRecalculateEarnings;
}
