'use client';

import React, { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { RefreshCw, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ExchangeRateForm {
  fromCurrency: string;
  toCurrency: string;
  rate: string;
  markup: string;
}

export const ExchangeRateManager: React.FC = () => {
  const { 
    currencies, 
    exchangeRates, 
    updateExchangeRate, 
    refreshExchangeRates,
    isLoading,
    error 
  } = useCurrency();

  const [form, setForm] = useState<ExchangeRateForm>({
    fromCurrency: 'NGN',
    toCurrency: 'USD',
    rate: '',
    markup: '2.5'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.rate || parseFloat(form.rate) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid exchange rate' });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);

      await updateExchangeRate(
        form.fromCurrency,
        form.toCurrency,
        parseFloat(form.rate),
        parseFloat(form.markup)
      );

      setMessage({ 
        type: 'success', 
        text: `Exchange rate updated: 1 ${form.fromCurrency} = ${form.rate} ${form.toCurrency}` 
      });

      // Reset form
      setForm({
        fromCurrency: 'NGN',
        toCurrency: 'USD',
        rate: '',
        markup: '2.5'
      });

    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to update exchange rate. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setMessage(null);
      await refreshExchangeRates();
      setMessage({ 
        type: 'success', 
        text: 'Exchange rates refreshed successfully' 
      });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to refresh exchange rates' 
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCurrentRate = (from: string, to: string) => {
    const rate = exchangeRates.find(r => 
      r.from_currency === from && r.to_currency === to && r.is_active
    );
    return rate ? `${rate.rate} (${rate.markup_percentage}% markup)` : 'Not set';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Exchange Rate Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage currency exchange rates and markup percentages
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Rates'}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Update Exchange Rate Form */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Update Exchange Rate
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Currency
            </label>
            <select
              value={form.fromCurrency}
              onChange={(e) => setForm(prev => ({ ...prev, fromCurrency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
              required
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Currency
            </label>
            <select
              value={form.toCurrency}
              onChange={(e) => setForm(prev => ({ ...prev, toCurrency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
              required
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Exchange Rate
            </label>
            <input
              type="number"
              step="0.000001"
              min="0"
              value={form.rate}
              onChange={(e) => setForm(prev => ({ ...prev, rate: e.target.value }))}
              placeholder="e.g., 0.0012"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Markup %
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={form.markup}
              onChange={(e) => setForm(prev => ({ ...prev, markup: e.target.value }))}
              placeholder="2.5"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
              required
            />
          </div>
        </form>

        <div className="mt-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !form.rate}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Updating...' : 'Update Rate'}
          </button>
        </div>
      </div>

      {/* Current Exchange Rates Table */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Current Exchange Rates
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">From</th>
                <th className="px-6 py-3">To</th>
                <th className="px-6 py-3">Rate</th>
                <th className="px-6 py-3">Markup</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {exchangeRates.map((rate) => (
                <tr key={rate.id} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {rate.from_currency}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {rate.to_currency}
                  </td>
                  <td className="px-6 py-4">{rate.rate.toFixed(6)}</td>
                  <td className="px-6 py-4">{rate.markup_percentage}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rate.source === 'api' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : rate.source === 'manual'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {rate.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {new Date(rate.effective_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="space-y-1">
              <li>• Exchange rates are applied with markup for fee coverage</li>
              <li>• NGN is the base currency for all internal reporting</li>
              <li>• Manual rates override API rates when set</li>
              <li>• All conversions are logged for audit purposes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
