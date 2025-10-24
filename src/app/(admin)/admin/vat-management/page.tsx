'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { simpleTaxService, CountryVAT } from '@/services/simpleTaxService';
import { Plus, Edit, Trash2, Globe, CheckCircle, XCircle } from 'lucide-react';

export default function VATManagementPage() {
  const { user, profile } = useAuth();
  const { formatCurrency } = useCurrency();
  
  const [countryVAT, setCountryVAT] = useState<CountryVAT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVAT, setEditingVAT] = useState<CountryVAT | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    country: '',
    vat_rate: 0,
    is_active: true
  });

  useEffect(() => {
    if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
      fetchCountryVAT();
    }
  }, [profile?.role]);

  const fetchCountryVAT = async () => {
    setLoading(true);
    try {
      const vatRates = await simpleTaxService.getCountryVATRates();
      setCountryVAT(vatRates);
    } catch (error) {
      console.error('Error fetching country VAT rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Debug: Check user role
      console.log('🔍 Debug - User profile:', profile);
      console.log('🔍 Debug - User role:', profile?.role);
      
      const vatData: any = {
        ...formData
      };
      
      if (editingVAT) {
        vatData.id = editingVAT.id;
      }
      
      console.log('🔍 Debug - VAT data to save:', vatData);
      
      const savedVAT = await simpleTaxService.saveCountryVATRate(vatData);
      
      if (savedVAT) {
        await fetchCountryVAT();
        resetForm();
        alert(editingVAT ? 'VAT rate updated successfully!' : 'VAT rate created successfully!');
      } else {
        alert('Failed to save VAT rate. Check console for details.');
      }
    } catch (error) {
      console.error('Error saving VAT rate:', error);
      alert('Error saving VAT rate. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      country: '',
      vat_rate: 0,
      is_active: true
    });
    setEditingVAT(null);
    setShowForm(false);
  };

  const handleEdit = (vat: CountryVAT) => {
    setEditingVAT(vat);
    setFormData({
      country: vat.country,
      vat_rate: vat.vat_rate,
      is_active: vat.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this VAT rate?')) {
      const success = await simpleTaxService.deleteCountryVATRate(id);
      if (success) {
        await fetchCountryVAT();
        alert('VAT rate deleted successfully!');
      } else {
        alert('Error deleting VAT rate. Please try again.');
      }
    }
  };

  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">VAT Management</h1>
            <p className="text-gray-600 mt-2">Manage country VAT rates for the platform</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add VAT Rate
          </button>
        </div>

        {/* VAT Rates List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading VAT rates...</p>
          </div>
        ) : countryVAT.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No VAT rates configured</h3>
            <p className="text-gray-600 mb-4">Set up VAT rates for different countries.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First VAT Rate
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {countryVAT.map((vat) => (
              <div key={vat.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{vat.country}</h3>
                      <p className="text-gray-600 text-sm">Country VAT Rate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {vat.is_active ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                    <button
                      onClick={() => handleEdit(vat)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vat.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">VAT Rate:</span>
                    <span className="ml-2 text-lg font-semibold text-green-600">{vat.vat_rate}%</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 capitalize">
                      {vat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VAT Rate Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {editingVAT ? 'Edit VAT Rate' : 'Add New VAT Rate'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nigeria"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VAT Rate (%) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.vat_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, vat_rate: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="7.50"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 0 for countries with no VAT (e.g., United States)
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active (VAT rate will be applied)
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
                      {editingVAT ? 'Update VAT Rate' : 'Create VAT Rate'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

