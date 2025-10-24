'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { installationService, InstallationService } from '@/lib/installationService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  Settings, 
  DollarSign, 
  Edit3, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';

interface SupplierPricing {
  supplier_id: string;
  supplier_name: string;
  basic_price: number;
  premium_price: number;
  basic_adjustment: number;
  premium_adjustment: number;
}

export default function InstallationServicesPage() {
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [basePrices, setBasePrices] = useState({
    basic: 299.99,
    premium: 599.99
  });
  const [supplierPricing, setSupplierPricing] = useState<SupplierPricing[]>([]);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current pricing data
  const fetchPricingData = async () => {
    try {
      setLoading(true);
      
      // Get all installation services to extract base prices and supplier pricing
      const { data: services, error } = await installationService.getAllActiveServices();
      
      if (error) {
        console.error('Error fetching services:', error);
        setMessage({ type: 'error', text: 'Failed to load pricing data' });
        return;
      }

      if (services && services.length > 0) {
        // Group by supplier and extract pricing
        const pricingMap = new Map<string, SupplierPricing>();
        
        services.forEach(service => {
          if (!service.supplier_id) return;
          
          if (!pricingMap.has(service.supplier_id)) {
            pricingMap.set(service.supplier_id, {
              supplier_id: service.supplier_id,
              supplier_name: `Supplier ${service.supplier_id.slice(0, 8)}`, // Fallback name
              basic_price: 0,
              premium_price: 0,
              basic_adjustment: 0,
              premium_adjustment: 0
            });
          }
          
          const pricing = pricingMap.get(service.supplier_id)!;
          
          if (service.name === 'Basic Installation') {
            pricing.basic_price = service.supplier_price || service.base_price || 0;
            pricing.basic_adjustment = service.price_adjustment_percent || 0;
          } else if (service.name === 'Premium Installation') {
            pricing.premium_price = service.supplier_price || service.base_price || 0;
            pricing.premium_adjustment = service.price_adjustment_percent || 0;
          }
        });
        
        setSupplierPricing(Array.from(pricingMap.values()));
        
        // Set base prices from first service (they should all be the same)
        const basicService = services.find(s => s.name === 'Basic Installation');
        const premiumService = services.find(s => s.name === 'Premium Installation');
        
        if (basicService?.base_price) setBasePrices(prev => ({ ...prev, basic: basicService.base_price! }));
        if (premiumService?.base_price) setBasePrices(prev => ({ ...prev, premium: premiumService.base_price! }));
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      setMessage({ type: 'error', text: 'Failed to load pricing data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingData();
  }, []);

  // Update base prices
  const handleUpdateBasePrice = async (serviceType: 'basic' | 'premium', newPrice: number) => {
    try {
      setSaving(true);
      setMessage(null);
      
      const serviceName = serviceType === 'basic' ? 'Basic Installation' : 'Premium Installation';
      
      const { error } = await installationService.updateBasePrices(serviceName, newPrice);
      
      if (error) {
        console.error('Error updating base price:', error);
        setMessage({ type: 'error', text: `Failed to update ${serviceType} installation price` });
        return;
      }
      
      setBasePrices(prev => ({ ...prev, [serviceType]: newPrice }));
      setMessage({ type: 'success', text: `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} installation price updated successfully` });
      
      // Refresh data to get updated supplier pricing
      await fetchPricingData();
    } catch (error) {
      console.error('Error updating base price:', error);
      setMessage({ type: 'error', text: 'Failed to update base price' });
    } finally {
      setSaving(false);
    }
  };

  // Start editing a price
  const startEditing = (supplierId: string, serviceType: 'basic' | 'premium') => {
    const pricing = supplierPricing.find(p => p.supplier_id === supplierId);
    if (pricing) {
      const currentPrice = serviceType === 'basic' ? pricing.basic_price : pricing.premium_price;
      setEditingPrice(`${supplierId}-${serviceType}`);
      setTempPrice(currentPrice);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingPrice(null);
    setTempPrice(0);
  };

  // Save edited price
  const saveEditedPrice = async (supplierId: string, serviceType: 'basic' | 'premium') => {
    try {
      setSaving(true);
      setMessage(null);
      
      // Find the service ID for this supplier and service type
      const { data: services } = await installationService.getAllActiveServices();
      const service = services?.find(s => 
        s.supplier_id === supplierId && 
        s.name === (serviceType === 'basic' ? 'Basic Installation' : 'Premium Installation')
      );
      
      if (!service) {
        setMessage({ type: 'error', text: 'Service not found' });
        return;
      }
      
      const { error } = await installationService.updateSupplierPrice(service.id, tempPrice);
      
      if (error) {
        console.error('Error updating supplier price:', error);
        setMessage({ type: 'error', text: 'Failed to update supplier price' });
        return;
      }
      
      setMessage({ type: 'success', text: 'Supplier price updated successfully' });
      setEditingPrice(null);
      
      // Refresh data
      await fetchPricingData();
    } catch (error) {
      console.error('Error updating supplier price:', error);
      setMessage({ type: 'error', text: 'Failed to update supplier price' });
    } finally {
      setSaving(false);
    }
  };

  // Calculate price limits
  const getPriceLimits = (basePrice: number) => {
    const adjustment = 0.20; // 20%
    return {
      min: basePrice * (1 - adjustment),
      max: basePrice * (1 + adjustment)
    };
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Installation Services Pricing
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage base prices and monitor supplier pricing adjustments
                </p>
              </div>
              <button
                onClick={fetchPricingData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          )}

          {/* Base Prices Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Base Prices (Admin Controlled)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Installation */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Basic Installation
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.01"
                      value={basePrices.basic}
                      onChange={(e) => setBasePrices(prev => ({ ...prev, basic: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={() => handleUpdateBasePrice('basic', basePrices.basic)}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Update
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Standard installation with basic mounting system
                  </p>
                </div>
              </div>

              {/* Premium Installation */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Premium Installation
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.01"
                      value={basePrices.premium}
                      onChange={(e) => setBasePrices(prev => ({ ...prev, premium: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={() => handleUpdateBasePrice('premium', basePrices.premium)}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Update
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Professional installation with premium components
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Pricing Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Supplier Pricing (Read-Only)
            </h2>
            
            {supplierPricing.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No supplier pricing data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Basic Installation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Premium Installation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {supplierPricing.map((pricing) => {
                      const basicLimits = getPriceLimits(basePrices.basic);
                      const premiumLimits = getPriceLimits(basePrices.premium);
                      
                      return (
                        <tr key={pricing.supplier_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {pricing.supplier_name}
                          </td>
                          
                          {/* Basic Installation */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {editingPrice === `${pricing.supplier_id}-basic` ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                  onClick={() => saveEditedPrice(pricing.supplier_id, 'basic')}
                                  disabled={saving || tempPrice < basicLimits.min || tempPrice > basicLimits.max}
                                  className="p-1 text-green-600 hover:text-green-700 disabled:text-gray-400"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatCurrency(pricing.basic_price)}</span>
                                {pricing.basic_adjustment !== 0 && (
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    pricing.basic_adjustment > 0 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {pricing.basic_adjustment > 0 ? '+' : ''}{pricing.basic_adjustment.toFixed(1)}%
                                  </span>
                                )}
                                <button
                                  onClick={() => startEditing(pricing.supplier_id, 'basic')}
                                  className="p-1 text-blue-600 hover:text-blue-700"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Range: {formatCurrency(basicLimits.min)} - {formatCurrency(basicLimits.max)}
                            </div>
                          </td>
                          
                          {/* Premium Installation */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {editingPrice === `${pricing.supplier_id}-premium` ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                  onClick={() => saveEditedPrice(pricing.supplier_id, 'premium')}
                                  disabled={saving || tempPrice < premiumLimits.min || tempPrice > premiumLimits.max}
                                  className="p-1 text-green-600 hover:text-green-700 disabled:text-gray-400"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatCurrency(pricing.premium_price)}</span>
                                {pricing.premium_adjustment !== 0 && (
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    pricing.premium_adjustment > 0 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {pricing.premium_adjustment > 0 ? '+' : ''}{pricing.premium_adjustment.toFixed(1)}%
                                  </span>
                                )}
                                <button
                                  onClick={() => startEditing(pricing.supplier_id, 'premium')}
                                  className="p-1 text-blue-600 hover:text-blue-700"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Range: {formatCurrency(premiumLimits.min)} - {formatCurrency(premiumLimits.max)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">
                                ID: {pricing.supplier_id.slice(0, 8)}...
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}

