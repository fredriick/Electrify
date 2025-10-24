'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { shippingService, ShippingRate } from '@/services/shippingService';
import { Plus, Edit, Trash2, Package, Weight, MapPin, DollarSign } from 'lucide-react';

export default function SupplierShippingPage() {
  const { user, profile } = useAuth();
  const { formatCurrency } = useCurrency();
  
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    rate_type: 'flat' as 'flat' | 'weight_based' | 'location_based',
    name: '',
    description: '',
    flat_rate_amount: 0,
    flat_rate_type: 'per_item' as 'per_item' | 'per_order',
    base_weight_kg: 0,
    base_weight_rate: 0,
    additional_weight_kg: 0,
    additional_weight_rate: 0,
    location_rates: [] as Array<{state?: string; country?: string; rate: number}>,
    min_order_amount: 0,
    max_order_amount: 0,
    estimated_days_min: 1,
    estimated_days_max: 7,
    is_default: false
  });

  useEffect(() => {
    if (profile?.id) {
      fetchShippingRates();
    }
  }, [profile?.id]);

  const fetchShippingRates = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const rates = await shippingService.getSupplierShippingRates(profile.id);
      setShippingRates(rates);
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) return;
    
    try {
      const rateData = {
        ...formData,
        supplier_id: profile.id,
        location_rates: formData.location_rates.length > 0 ? formData.location_rates : undefined
      };
      
      if (editingRate) {
        (rateData as any).id = editingRate.id;
      }
      
      const savedRate = await shippingService.saveShippingRate(rateData);
      
      if (savedRate) {
        await fetchShippingRates();
        resetForm();
        alert(editingRate ? 'Shipping rate updated successfully!' : 'Shipping rate created successfully!');
      }
    } catch (error) {
      console.error('Error saving shipping rate:', error);
      alert('Error saving shipping rate. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      rate_type: 'flat',
      name: '',
      description: '',
      flat_rate_amount: 0,
      flat_rate_type: 'per_item',
      base_weight_kg: 0,
      base_weight_rate: 0,
      additional_weight_kg: 0,
      additional_weight_rate: 0,
      location_rates: [],
      min_order_amount: 0,
      max_order_amount: 0,
      estimated_days_min: 1,
      estimated_days_max: 7,
      is_default: false
    });
    setEditingRate(null);
    setShowForm(false);
  };

  const handleEdit = (rate: ShippingRate) => {
    setEditingRate(rate);
    setFormData({
      rate_type: rate.rate_type,
      name: rate.name,
      description: rate.description || '',
      flat_rate_amount: rate.flat_rate_amount || 0,
      flat_rate_type: rate.flat_rate_type || 'per_item',
      base_weight_kg: rate.base_weight_kg || 0,
      base_weight_rate: rate.base_weight_rate || 0,
      additional_weight_kg: rate.additional_weight_kg || 0,
      additional_weight_rate: rate.additional_weight_rate || 0,
      location_rates: rate.location_rates || [],
      min_order_amount: rate.min_order_amount || 0,
      max_order_amount: rate.max_order_amount || 0,
      estimated_days_min: rate.estimated_days_min || 1,
      estimated_days_max: rate.estimated_days_max || 7,
      is_default: rate.is_default
    });
    setShowForm(true);
  };

  const addLocationRate = () => {
    setFormData(prev => ({
      ...prev,
      location_rates: [...prev.location_rates, { rate: 0 }]
    }));
  };

  const updateLocationRate = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      location_rates: prev.location_rates.map((rate, i) => 
        i === index ? { ...rate, [field]: value } : rate
      )
    }));
  };

  const removeLocationRate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      location_rates: prev.location_rates.filter((_, i) => i !== index)
    }));
  };

  if (!profile || profile.role !== 'SUPPLIER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to suppliers.</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Current profile: {profile ? `${profile.role || 'No role'}` : 'No profile'}</p>
            <p>User ID: {user?.id || 'No user'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shipping Rates</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your shipping rates and delivery options</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Shipping Rate
          </button>
        </div>

        {/* Shipping Rates List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading shipping rates...</p>
          </div>
        ) : shippingRates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shipping rates configured</h3>
            <p className="text-gray-600 mb-4">Set up your shipping rates to start selling.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Shipping Rate
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {shippingRates.map((rate) => (
              <div key={rate.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {rate.rate_type === 'flat' && <DollarSign className="w-5 h-5 text-green-600" />}
                    {rate.rate_type === 'weight_based' && <Weight className="w-5 h-5 text-blue-600" />}
                    {rate.rate_type === 'location_based' && <MapPin className="w-5 h-5 text-purple-600" />}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{rate.name}</h3>
                      {rate.description && (
                        <p className="text-gray-600 text-sm">{rate.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {rate.is_default && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                    <button
                      onClick={() => handleEdit(rate)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Rate Type:</span>
                    <span className="ml-2 capitalize">{rate.rate_type.replace('_', ' ')}</span>
                  </div>
                  
                  {rate.rate_type === 'flat' && (
                    <div>
                      <span className="font-medium text-gray-700">Amount:</span>
                      <span className="ml-2">{formatCurrency(rate.flat_rate_amount || 0)}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({rate.flat_rate_type === 'per_item' ? 'per item' : 'per order'})
                      </span>
                    </div>
                  )}
                  
                  {rate.rate_type === 'weight_based' && (
                    <>
                      <div>
                        <span className="font-medium text-gray-700">Base Weight:</span>
                        <span className="ml-2">{rate.base_weight_kg}kg - {formatCurrency(rate.base_weight_rate || 0)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Additional:</span>
                        <span className="ml-2">{rate.additional_weight_kg}kg - {formatCurrency(rate.additional_weight_rate || 0)}</span>
                      </div>
                    </>
                  )}
                  
                  {rate.rate_type === 'location_based' && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Location Rates:</span>
                      <div className="mt-1 space-y-1">
                        {rate.location_rates?.map((loc, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {loc.state && `${loc.state}: `}
                            {loc.country && `${loc.country}: `}
                            {formatCurrency(loc.rate)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium text-gray-700">Delivery:</span>
                    <span className="ml-2">{rate.estimated_days_min}-{rate.estimated_days_max} days</span>
                  </div>
                  
                  {rate.min_order_amount && rate.min_order_amount > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Min Order:</span>
                      <span className="ml-2">{formatCurrency(rate.min_order_amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shipping Rate Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {editingRate ? 'Edit Shipping Rate' : 'Add New Shipping Rate'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rate Type *
                      </label>
                      <select
                        value={formData.rate_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, rate_type: e.target.value as any }))}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="flat">Flat Rate</option>
                        <option value="weight_based">Weight-Based</option>
                        <option value="location_based">Location-Based</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Standard Shipping"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Describe this shipping option..."
                    />
                  </div>

                  {/* Rate Type Specific Fields */}
                  {formData.rate_type === 'flat' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Flat Rate Type *
                        </label>
                        <select
                          value={formData.flat_rate_type}
                          onChange={(e) => setFormData(prev => ({ ...prev, flat_rate_type: e.target.value as 'per_item' | 'per_order' }))}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="per_item">Per Item (₦500 × 3 items = ₦1,500)</option>
                          <option value="per_order">Per Order (₦500 regardless of quantity)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Choose how the flat rate is calculated
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Flat Rate Amount *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.flat_rate_amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, flat_rate_amount: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.flat_rate_type === 'per_item' 
                            ? 'Amount charged per individual item'
                            : 'Fixed amount charged per order regardless of quantity'
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.rate_type === 'weight_based' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Base Weight (kg) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.base_weight_kg}
                          onChange={(e) => setFormData(prev => ({ ...prev, base_weight_kg: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Base Weight Rate *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.base_weight_rate}
                          onChange={(e) => setFormData(prev => ({ ...prev, base_weight_rate: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Weight (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.additional_weight_kg}
                          onChange={(e) => setFormData(prev => ({ ...prev, additional_weight_kg: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Weight Rate
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.additional_weight_rate}
                          onChange={(e) => setFormData(prev => ({ ...prev, additional_weight_rate: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {formData.rate_type === 'location_based' && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Location Rates *
                        </label>
                        <button
                          type="button"
                          onClick={addLocationRate}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          + Add Location
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.location_rates.map((rate, index) => (
                          <div key={index} className="flex gap-2 items-end">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={rate.state || ''}
                                onChange={(e) => updateLocationRate(index, 'state', e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="State (optional)"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={rate.country || ''}
                                onChange={(e) => updateLocationRate(index, 'country', e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Country (optional)"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={rate.rate}
                                onChange={(e) => updateLocationRate(index, 'rate', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Rate"
                                required
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLocationRate(index)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {formData.location_rates.length === 0 && (
                          <p className="text-gray-500 text-sm">No location rates added. Click "Add Location" to get started.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Order Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.min_order_amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0 for no minimum"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Order Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.max_order_amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_order_amount: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0 for no maximum"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Delivery (Min Days) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.estimated_days_min}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimated_days_min: parseInt(e.target.value) || 1 }))}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Delivery (Max Days) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.estimated_days_max}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimated_days_max: parseInt(e.target.value) || 7 }))}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={formData.is_default}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="is_default" className="text-sm font-medium text-gray-700">
                      Set as default shipping rate
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingRate ? 'Update Rate' : 'Create Rate'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
