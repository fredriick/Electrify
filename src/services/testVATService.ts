// Test VAT Service - Run this in browser console to debug
import { simpleTaxService } from './simpleTaxService';

export const testVATService = async () => {
  console.log('🧪 Testing VAT Service...');
  
  try {
    // Test 1: Load VAT rates
    console.log('🧪 Test 1: Loading VAT rates...');
    await simpleTaxService.loadCountryVAT();
    
    // Test 2: Get VAT rate for Nigeria
    console.log('🧪 Test 2: Getting VAT rate for Nigeria...');
    const vatRate = await simpleTaxService.getVATRate('Nigeria');
    console.log('🧪 VAT rate for Nigeria:', vatRate);
    
    // Test 3: Calculate VAT for sample order
    console.log('🧪 Test 3: Calculating VAT for sample order...');
    const taxCalc = await simpleTaxService.calculateVAT(10000, 'Nigeria', []);
    console.log('🧪 Tax calculation result:', taxCalc);
    
    // Test 4: Check if service is working
    console.log('🧪 Test 4: Service status check...');
    console.log('🧪 Service instance:', simpleTaxService);
    console.log('🧪 Supabase client:', !!simpleTaxService['supabase']);
    
    return {
      success: true,
      vatRate,
      taxCalc,
      message: 'VAT service test completed'
    };
    
  } catch (error) {
    console.error('❌ VAT service test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'VAT service test failed'
    };
  }
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testVATService = testVATService;
}


