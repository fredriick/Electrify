'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/auth';

// Types for the multi-currency system
interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  is_base_currency: boolean;
  is_active: boolean;
  decimal_places: number;
}

interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  markup_percentage: number;
  effective_date: string;
  expiry_date?: string;
  source: 'api' | 'manual' | 'system';
  is_active: boolean;
}

interface UserCurrencyPreference {
  id: string;
  user_id: string;
  preferred_currency: string;
  detected_country?: string;
  detected_currency?: string;
  ip_address?: string;
  last_location_update: string;
}

interface CurrencyConversionLog {
  id: string;
  user_id?: string;
  session_id?: string;
  from_currency: string;
  to_currency: string;
  original_amount: number;
  converted_amount: number;
  exchange_rate: number;
  markup_applied: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface GeolocationData {
  country: string;
  currency: string;
  ip: string;
}

interface CurrencyContextType {
  // Current state
  currentCurrency: string;
  baseCurrency: string;
  currencies: Currency[];
  exchangeRates: ExchangeRate[];
  
  // User preferences
  userPreference: UserCurrencyPreference | null;
  
  // Functions
  setCurrency: (currencyCode: string) => Promise<void>;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number | null;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  getCurrencySymbol: (currencyCode: string) => string;
  
  // Geolocation
  detectUserLocation: () => Promise<void>;
  geolocationData: GeolocationData | null;
  
  // Admin functions
  updateExchangeRate: (fromCurrency: string, toCurrency: string, rate: number, markup?: number) => Promise<void>;
  refreshExchangeRates: () => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // State
  const [currentCurrency, setCurrentCurrency] = useState<string>('NGN');
  const [baseCurrency, setBaseCurrency] = useState<string>('NGN');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [userPreference, setUserPreference] = useState<UserCurrencyPreference | null>(null);
  const [geolocationData, setGeolocationData] = useState<GeolocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load currencies and exchange rates
  const loadCurrencyData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load currencies
      const { data: currenciesData, error: currenciesError } = await supabase
        .from('currencies')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (currenciesError) throw currenciesError;

      setCurrencies(currenciesData || []);
      
      // Set base currency
      const base = currenciesData?.find((c: any) => c.is_base_currency);
      if (base) {
        setBaseCurrency(base.code);
      }

      // Load exchange rates
      const { data: ratesData, error: ratesError } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('is_active', true);

      if (ratesError) throw ratesError;
      setExchangeRates(ratesData || []);

    } catch (err) {
      console.error('Error loading currency data:', err);
      setError('Failed to load currency data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user currency preference
  const loadUserPreference = useCallback(async () => {
      if (!user?.id) return;

      try {
      const { data, error } = await supabase
        .from('user_currency_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading user preference:', error);
        return;
      }

      if (data) {
        setUserPreference(data);
        setCurrentCurrency(data.preferred_currency);
      }
    } catch (err) {
      console.error('Error loading user preference:', err);
      // Continue without user preference - use detected currency
    }
  }, [user?.id]);

  // Detect user location and set appropriate currency
  const detectUserLocation = useCallback(async () => {
    try {
      // Use a free geolocation API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Location API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const geoData: GeolocationData = {
        country: data.country_code,
        currency: data.currency,
        ip: data.ip
      };
      
      setGeolocationData(geoData);
      
      // Set currency based on location
      let detectedCurrency = 'NGN'; // Default to NGN
      
      if (geoData.country === 'NG') {
        detectedCurrency = 'NGN';
      } else if (geoData.currency) {
        // Check if detected currency is supported
        const supportedCurrency = currencies.find((c: any) => c.code === geoData.currency);
        if (supportedCurrency) {
          detectedCurrency = geoData.currency;
        } else {
          detectedCurrency = 'USD'; // Fallback to USD for international users
        }
      } else {
        detectedCurrency = 'USD'; // Fallback to USD
      }
      
      // Update current currency if no user preference exists
      if (!userPreference) {
        setCurrentCurrency(detectedCurrency);
        
        // Save to database if user is logged in
        if (user?.id) {
          await saveUserPreference(detectedCurrency, geoData);
        }
      }
      
    } catch (err) {
      // Handle CORS and other fetch errors gracefully
      if (err instanceof TypeError && err.message.includes('CORS')) {
        console.warn('Location detection blocked by CORS policy - using default currency');
      } else {
        console.warn('Error detecting user location:', err);
      }
      
      // Fallback to NGN if geolocation fails
      setCurrentCurrency('NGN');
    }
  }, [currencies, userPreference, user?.id]);

  // Save user currency preference
  const saveUserPreference = async (currencyCode: string, geoData?: GeolocationData) => {
    if (!user?.id) return;

    try {
      const preferenceData = {
        user_id: user.id,
        preferred_currency: currencyCode,
        detected_country: geoData?.country,
        detected_currency: geoData?.currency,
        ip_address: geoData?.ip,
        last_location_update: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_currency_preferences')
        .upsert(preferenceData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        // Check if it's an RLS policy error
        if (error.code === '42501') {
          // Only log this warning once per session to reduce console noise
          if (!sessionStorage.getItem('currency-rls-warning-shown')) {
            console.warn('Currency preference save blocked by RLS policy - this is normal for location-based detection');
            sessionStorage.setItem('currency-rls-warning-shown', 'true');
          }
          // Still set the currency locally even if we can't save the preference
          setCurrentCurrency(currencyCode);
          return;
        }
        throw error;
      }
      
      setUserPreference(data);
      setCurrentCurrency(currencyCode);
      
    } catch (err) {
      console.error('Error saving user preference:', err);
      // Continue without saving preference - currency will still work
      setCurrentCurrency(currencyCode);
    }
  };

  // Set currency (called by user)
  const setCurrency = async (currencyCode: string) => {
    if (!currencies.find(c => c.code === currencyCode)) {
      throw new Error(`Unsupported currency: ${currencyCode}`);
    }

    setCurrentCurrency(currencyCode);
    
    if (user?.id) {
      await saveUserPreference(currencyCode);
    }
  };

  // Convert currency using exchange rates
  const convertCurrency = useCallback((amount: number, fromCurrency: string, toCurrency: string): number | null => {
    if (fromCurrency === toCurrency) return amount;
    if (amount === 0) return 0;

    try {
      // Find direct exchange rate
      let rate = exchangeRates.find(r => 
        r.from_currency === fromCurrency && 
        r.to_currency === toCurrency && 
        r.is_active
      );

      if (!rate) {
        // Try reverse rate
        const reverseRate = exchangeRates.find(r => 
          r.from_currency === toCurrency && 
          r.to_currency === fromCurrency && 
          r.is_active
        );
        
        if (reverseRate) {
          rate = {
            ...reverseRate,
            rate: 1 / reverseRate.rate
          };
        }
      }

      if (!rate) return null;

      // Apply markup
      const markupMultiplier = 1 + (rate.markup_percentage / 100);
      const convertedAmount = amount * rate.rate * markupMultiplier;
      
      // Round to 2 decimal places
      return Math.round(convertedAmount * 100) / 100;
      
    } catch (err) {
      console.error('Error converting currency:', err);
      return null;
    }
  }, [exchangeRates]);

  // Format currency for display
  const formatCurrency = useCallback((amount: number, currencyCode?: string): string => {
    // Handle null, undefined, or invalid amounts
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₦0.00'; // Default to NGN with 0
    }
    
    const code = currencyCode || currentCurrency;
    const currency = currencies.find(c => c.code === code);
    
    if (!currency) return `${amount.toFixed(2)}`;
    
    const symbol = currency.symbol;
    
    // Format based on currency
    switch (code) {
      case 'NGN':
        return `${symbol}${amount.toLocaleString('en-NG', { 
          minimumFractionDigits: currency.decimal_places,
          maximumFractionDigits: currency.decimal_places
        })}`;
      case 'USD':
        return `${symbol}${amount.toLocaleString('en-US', { 
          minimumFractionDigits: currency.decimal_places,
          maximumFractionDigits: currency.decimal_places
        })}`;
      case 'EUR':
        return `${symbol}${amount.toLocaleString('de-DE', { 
          minimumFractionDigits: currency.decimal_places,
          maximumFractionDigits: currency.decimal_places
        })}`;
      case 'GBP':
        return `${symbol}${amount.toLocaleString('en-GB', { 
          minimumFractionDigits: currency.decimal_places,
          maximumFractionDigits: currency.decimal_places
        })}`;
      default:
        return `${symbol}${amount.toLocaleString()}`;
    }
  }, [currentCurrency, currencies]);

  // Get currency symbol
  const getCurrencySymbol = useCallback((currencyCode: string): string => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  }, [currencies]);

  // Update exchange rate (admin function)
  const updateExchangeRate = async (fromCurrency: string, toCurrency: string, rate: number, markup: number = 2.5) => {
    try {
      const { error } = await supabase
        .from('exchange_rates')
        .upsert({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate: rate,
          markup_percentage: markup,
          source: 'manual',
          effective_date: new Date().toISOString(),
          is_active: true
        }, { onConflict: 'from_currency,to_currency' });

      if (error) throw error;
      
      // Reload exchange rates
      await loadCurrencyData();
      
    } catch (err) {
      console.error('Error updating exchange rate:', err);
      throw err;
    }
  };

  // Refresh exchange rates from API (admin function)
  const refreshExchangeRates = async () => {
    try {
      // This would integrate with a real exchange rate API
      // For now, we'll just reload the current rates
      await loadCurrencyData();
      
      
    } catch (err) {
      console.error('Error refreshing exchange rates:', err);
      throw err;
    }
  };

  // Log currency conversion for audit trail
  const logConversion = useCallback(async (
    fromCurrency: string, 
    toCurrency: string, 
    originalAmount: number, 
    convertedAmount: number,
    exchangeRate: number,
    markupApplied: number
  ) => {
    try {
      const logData = {
        user_id: user?.id,
        session_id: sessionStorage.getItem('sessionId'),
        from_currency: fromCurrency,
        to_currency: toCurrency,
        original_amount: originalAmount,
        converted_amount: convertedAmount,
        exchange_rate: exchangeRate,
        markup_applied: markupApplied,
        ip_address: geolocationData?.ip,
        user_agent: navigator.userAgent
      };

      await supabase
        .from('currency_conversion_logs')
        .insert(logData);

    } catch (err) {
      console.error('Error logging currency conversion:', err);
    }
  }, [user?.id, geolocationData?.ip]);

  // Initialize on mount
  useEffect(() => {
    loadCurrencyData();
  }, [loadCurrencyData]);

  // Load user preference when user changes
  useEffect(() => {
    loadUserPreference();
  }, [loadUserPreference]);

  // Detect location when currencies are loaded
  useEffect(() => {
    if (currencies.length > 0 && !userPreference) {
      detectUserLocation();
    }
  }, [currencies, userPreference, detectUserLocation]);

  const value: CurrencyContextType = {
    currentCurrency,
    baseCurrency,
    currencies,
    exchangeRates,
    userPreference,
    geolocationData,
    setCurrency,
    convertCurrency,
    formatCurrency,
    getCurrencySymbol,
    detectUserLocation,
    updateExchangeRate,
    refreshExchangeRates,
    isLoading,
    error
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}; 