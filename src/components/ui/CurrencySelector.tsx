'use client';

import React, { useState } from 'react';
import { ChevronDown, Globe, RefreshCw } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CurrencySelectorProps {
  className?: string;
  showExchangeRates?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  className = '', 
  showExchangeRates = false 
}) => {
  const { 
    currentCurrency, 
    currencies, 
    setCurrency, 
    convertCurrency, 
    baseCurrency,
    isLoading,
    error,
    refreshExchangeRates
  } = useCurrency();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCurrencyChange = async (currencyCode: string) => {
    try {
      await setCurrency(currencyCode);
      setIsOpen(false);
    } catch (err) {
      console.error('Error changing currency:', err);
    }
  };

  const handleRefreshRates = async () => {
    try {
      setIsRefreshing(true);
      await refreshExchangeRates();
    } catch (err) {
      console.error('Error refreshing rates:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const currentCurrencyData = currencies.find(c => c.code === currentCurrency);
  const baseCurrencyData = currencies.find(c => c.code === baseCurrency);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-500 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 text-sm text-red-500 ${className}`}>
        <span>Currency Error</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Currency Display Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{currentCurrencyData?.symbol}</span>
        <span className="hidden sm:inline">{currentCurrencyData?.code}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Select Currency</h3>
              <button
                onClick={handleRefreshRates}
                disabled={isRefreshing}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Refresh exchange rates"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Currency Options */}
            <div className="space-y-2">
              {currencies.map((currency) => {
                const isSelected = currency.code === currentCurrency;
                const isBase = currency.code === baseCurrency;
                
                return (
                  <button
                    key={currency.code}
                    onClick={() => handleCurrencyChange(currency.code)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{currency.symbol}</span>
                      <div>
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {currency.name}
                          {isBase && <span className="ml-1 text-primary-600">(Base)</span>}
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Exchange Rate Info */}
            {showExchangeRates && currentCurrency !== baseCurrency && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Exchange Rate (1 {baseCurrency} = {currentCurrency})
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {convertCurrency(1, baseCurrency, currentCurrency)?.toFixed(4) || 'N/A'}
                </div>
              </div>
            )}

            {/* Location Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Base currency for reporting: {baseCurrencyData?.symbol} {baseCurrencyData?.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
