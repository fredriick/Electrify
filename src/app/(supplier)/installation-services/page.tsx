'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { installationService, InstallationService, CustomInstallationQuote } from '@/lib/installationService';
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
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function InstallationServicesPage() {
  const { user, profile } = useAuth();
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<InstallationService[]>([]);
  const [customQuotes, setCustomQuotes] = useState<CustomInstallationQuote[]>([]);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'pricing' | 'quotes'>('pricing');

  // Fetch supplier's installation services
  const fetchServices = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await installationService.getSupplierServices(user.id);
      
      if (error) {
        console.error('Error fetching services:', error);
        setMessage({ type: 'error', text: 'Failed to load installation services' });
        return;
      }
      
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setMessage({ type: 'error', text: 'Failed to load installation services' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch custom installation quotes
  const fetchCustomQuotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await installationService.getSupplierQuotes(user.id);
      
      if (error) {
        console.error('Error fetching quotes:', error);
        setMessage({ type: 'error', text: 'Failed to load custom quotes' });
        return;
      }
      
      setCustomQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setMessage({ type: 'error', text: 'Failed to load custom quotes' });
    }
  };

  useEffect(() => {
    if (user) {
      fetchServices();
      fetchCustomQuotes();
    }
  }, [user]);

  // Update supplier price
  const handleUpdatePrice = async (serviceId: string, newPrice: number) => {
    try {
      setSaving(true);
      setMessage(null);
      
      const { error } = await installationService.updateSupplierPrice(serviceId, newPrice);
      
      if (error) {
        console.error('Error updating price:', error);
        setMessage({ type: 'error', text: 'Failed to update price' });
        return;
      }
      
      setMessage({ type: 'success', text: 'Price updated successfully' });
      setEditingPrice(null);
      await fetchServices();
    } catch (error) {
      console.error('Error updating price:', error);
      setMessage({ type: 'error', text: 'Failed to update price' });
    } finally {
      setSaving(false);
    }
  };

  // Start editing a price
  const startEditing = (serviceId: string, currentPrice: number) => {
    setEditingPrice(serviceId);
    setTempPrice(currentPrice);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingPrice(null);
    setTempPrice(0);
  };

  // Update custom quote
  const handleUpdateQuote = async (quoteId: string, quotedAmount: number, notes: string) => {
    try {
      setSaving(true);
      setMessage(null);
      
      const { error } = await installationService.updateCustomQuote(quoteId, {
        quoted_amount: quotedAmount,
        notes: notes,
        status: 'quoted'
      });
      
      if (error) {
        console.error('Error updating quote:', error);
        setMessage({ type: 'error', text: 'Failed to update quote' });
        return;
      }
      
      setMessage({ type: 'success', text: 'Quote updated successfully' });
      await fetchCustomQuotes();
    } catch (error) {
      console.error('Error updating quote:', error);
      setMessage({ type: 'error', text: 'Failed to update quote' });
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'quoted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Installation Services
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your installation pricing and custom quotes
              </p>
            </div>
            <button
              onClick={() => {
                fetchServices();
                fetchCustomQuotes();
              }}
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

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pricing')}
                disabled={true}
                className={`py-2 px-1 border-b-2 font-medium text-sm cursor-not-allowed opacity-50 ${
                  activeTab === 'pricing'
                    ? 'border-gray-300 text-gray-400 dark:text-gray-500'
                    : 'border-transparent text-gray-400 dark:text-gray-500'
                }`}
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                Pricing Management
              </button>
              <button
                onClick={() => setActiveTab('quotes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'quotes'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Custom Quotes ({customQuotes.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Pricing Management Tab */}
        {activeTab === 'pricing' && (
          <div className="opacity-50 pointer-events-none bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Your Installation Pricing
            </h2>
            
            {services.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No installation services found. Please contact support.
              </div>
            ) : (
              <div className="space-y-6">
                {services.map((service) => {
                  if (service.is_custom) return null; // Skip custom services in pricing tab
                  
                  const limits = service.base_price ? getPriceLimits(service.base_price) : { min: 0, max: 0 };
                  const isEditing = editingPrice === service.id;
                  
                  return (
                    <div key={service.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {service.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {service.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Base Price: {formatCurrency(service.base_price || 0)}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Range: {formatCurrency(limits.min)} - {formatCurrency(limits.max)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {isEditing ? (
                          <>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Your Price
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                min={limits.min}
                                max={limits.max}
                              />
                              {tempPrice < limits.min || tempPrice > limits.max ? (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                  Price must be between {formatCurrency(limits.min)} and {formatCurrency(limits.max)}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdatePrice(service.id, tempPrice)}
                                disabled={saving || tempPrice < limits.min || tempPrice > limits.max}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                              >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(service.supplier_price || service.base_price || 0)}
                              </div>
                              {service.price_adjustment_percent !== 0 && (
                                <div className={`text-sm ${
                                  service.price_adjustment_percent > 0 
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {service.price_adjustment_percent > 0 ? '+' : ''}{service.price_adjustment_percent.toFixed(1)}% from base
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => startEditing(service.id, service.supplier_price || service.base_price || 0)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit Price
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Custom Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Custom Installation Quotes
            </h2>
            
            {customQuotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No custom installation quotes found
              </div>
            ) : (
              <div className="space-y-4">
                {customQuotes.map((quote) => (
                  <div key={quote.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Order #{quote.order_id || 'N/A'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Customer ID: {quote.customer_id}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Requested Amount: {quote.requested_amount ? formatCurrency(quote.requested_amount) : 'Not specified'}
                        </p>
                        {quote.customer_notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <strong>Customer Notes:</strong> {quote.customer_notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(quote.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {quote.status === 'pending' && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Provide Quote
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Your Quote Amount
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Enter your quote"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              id={`quote-amount-${quote.id}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Notes for Customer
                            </label>
                            <textarea
                              placeholder="Add any notes about the installation"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              rows={3}
                              id={`quote-notes-${quote.id}`}
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              const amount = (document.getElementById(`quote-amount-${quote.id}`) as HTMLInputElement)?.value;
                              const notes = (document.getElementById(`quote-notes-${quote.id}`) as HTMLTextAreaElement)?.value;
                              if (amount) {
                                handleUpdateQuote(quote.id, parseFloat(amount), notes || '');
                              }
                            }}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Submit Quote
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {quote.status === 'quoted' && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Your Quote:</strong> {formatCurrency(quote.quoted_amount || 0)}
                            </p>
                            {quote.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <strong>Notes:</strong> {quote.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Waiting for customer approval
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {quote.status === 'approved' && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Quote approved by customer</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Final Amount: {formatCurrency(quote.final_amount || quote.quoted_amount || 0)}
                        </p>
                      </div>
                    )}
                    
                    {quote.status === 'rejected' && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Quote rejected by customer</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

