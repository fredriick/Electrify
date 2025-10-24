'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, Save, CheckCircle, ChevronDown, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';

export default function PreferencesSettingsPage() {
  const { user, profile } = useAuth();
  const [preferences, setPreferences] = useState(authService.getDefaultUserPreferences());

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Dropdown states
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [timezoneDropdownOpen, setTimezoneDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  // Refs for click outside
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const timezoneDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Search states
  const [languageSearch, setLanguageSearch] = useState("");
  const [currencySearch, setCurrencySearch] = useState("");
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [themeSearch, setThemeSearch] = useState("");

  // Load user preferences from database
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Don't show loading if we already have data (prevents unnecessary loading on tab return)
        if (preferences.language !== undefined) {
          setLoading(false);
        }
        
        if (profile) {
          setUserRole(profile.role);
          if (profile.role === 'CUSTOMER') {
            const result = await authService.getUserPreferences(user.id, profile);
            if (result.data) {
              setPreferences(result.data);
            }
          } else {
            setError('User preferences are only available for customers');
          }
        } else {
          // Even if profile is null, try to load preferences using RPC function
          const result = await authService.getUserPreferences(user.id, null);
          if (result.data) {
            setPreferences(result.data);
            setUserRole('CUSTOMER'); // Assume customer if we can load preferences
          } else {
            setError('Profile not found. The system will use default preferences. You can still modify them below.');
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
        setError('Failed to load user preferences. Using default settings.');
        setPreferences(authService.getDefaultUserPreferences());
      } finally {
        setLoading(false);
      }
    };

    loadUserPreferences();
  }, [user?.id]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
      if (timezoneDropdownRef.current && !timezoneDropdownRef.current.contains(event.target as Node)) {
        setTimezoneDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Data arrays
  const languages = [
    { value: "English", label: "English" },
    { value: "Spanish", label: "Spanish" },
    { value: "French", label: "French" },
    { value: "German", label: "German" },
    { value: "Chinese", label: "Chinese" },
    { value: "Arabic", label: "Arabic" },
    { value: "Portuguese", label: "Portuguese" },
    { value: "Swahili", label: "Swahili" },
  ];

  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "CAD", label: "CAD (C$)" },
    { value: "AUD", label: "AUD (A$)" },
    { value: "NGN", label: "Nigerian Naira (₦)" },
    { value: "ZAR", label: "South African Rand (R)" },
    { value: "KES", label: "Kenyan Shilling (KSh)" },
    { value: "EGP", label: "Egyptian Pound (E£)" },
    { value: "GHS", label: "Ghanaian Cedi (₵)" },
  ];

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Africa/Lagos", label: "West Africa Time (WAT)" },
    { value: "Africa/Harare", label: "Central Africa Time (CAT)" },
    { value: "Africa/Johannesburg", label: "South Africa Standard Time (SAST)" },
    { value: "Africa/Nairobi", label: "East Africa Time (EAT)" },
  ];

  const themes = [
    { value: "system", label: "System Default" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  // Filtered lists
  const filteredLanguages = languages.filter(lang => 
    lang.label.toLowerCase().includes(languageSearch.toLowerCase())
  );
  const filteredCurrencies = currencies.filter(cur => 
    cur.label.toLowerCase().includes(currencySearch.toLowerCase())
  );
  const filteredTimezones = timezones.filter(tz => 
    tz.label.toLowerCase().includes(timezoneSearch.toLowerCase())
  );
  const filteredThemes = themes.filter(theme => 
    theme.label.toLowerCase().includes(themeSearch.toLowerCase())
  );

  // Helper functions
  const getCurrentLabel = (type: string) => {
    switch (type) {
      case 'language':
        return languages.find(l => l.value === preferences.language)?.label || 'English';
      case 'currency':
        return currencies.find(c => c.value === preferences.currency)?.label || 'USD ($)';
      case 'timezone':
        return timezones.find(t => t.value === preferences.timezone)?.label || 'Eastern Time (ET)';
      case 'theme':
        return themes.find(t => t.value === preferences.theme)?.label || 'System Default';
      default:
        return '';
    }
  };

  // Toggle functions
  const handleLanguageDropdownToggle = () => {
    setLanguageDropdownOpen(!languageDropdownOpen);
    if (!languageDropdownOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('[data-language-search]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  const handleCurrencyDropdownToggle = () => {
    setCurrencyDropdownOpen(!currencyDropdownOpen);
    if (!currencyDropdownOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('[data-currency-search]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  const handleTimezoneDropdownToggle = () => {
    setTimezoneDropdownOpen(!timezoneDropdownOpen);
    if (!timezoneDropdownOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('[data-timezone-search]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  const handleThemeDropdownToggle = () => {
    setThemeDropdownOpen(!themeDropdownOpen);
    if (!themeDropdownOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('[data-theme-search]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  // Selection handlers
  const handleLanguageSelect = (value: string) => {
    setPreferences(prev => ({ ...prev, language: value }));
    setLanguageDropdownOpen(false);
    setLanguageSearch("");
  };

  const handleCurrencySelect = (value: string) => {
    setPreferences(prev => ({ ...prev, currency: value }));
    setCurrencyDropdownOpen(false);
    setCurrencySearch("");
  };

  const handleTimezoneSelect = (value: string) => {
    setPreferences(prev => ({ ...prev, timezone: value }));
    setTimezoneDropdownOpen(false);
    setTimezoneSearch("");
  };

  const handleThemeSelect = (value: string) => {
    setPreferences(prev => ({ ...prev, theme: value }));
    setThemeDropdownOpen(false);
    setThemeSearch("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to save preferences.');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      
      const result = await authService.updateUserPreferences(user.id, preferences, profile);
      
      if (result.error) {
        setError(result.error.message || 'Failed to save preferences. This may be due to database permissions.');
        return;
      }

      setSaved(true);
      setError(''); // Clear any previous errors
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-2xl">
          <div className="text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You must be logged in to access preferences.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Settings className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Preferences</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your account preferences and display settings
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-200">Preferences saved successfully!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Preferences Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSave}>
            <div className="p-6 space-y-6">
              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <div className="relative" ref={languageDropdownRef}>
                  <button
                    type="button"
                    onClick={handleLanguageDropdownToggle}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-left flex items-center justify-between"
                  >
                    <span className={preferences.language ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                      {getCurrentLabel('language')}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {languageDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search languages..."
                            value={languageSearch}
                            onChange={(e) => setLanguageSearch(e.target.value)}
                            data-language-search
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredLanguages.map((lang) => (
                          <button
                            key={lang.value}
                            onClick={() => handleLanguageSelect(lang.value)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <div className="relative" ref={currencyDropdownRef}>
                  <button
                    type="button"
                    onClick={handleCurrencyDropdownToggle}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-left flex items-center justify-between"
                  >
                    <span className={preferences.currency ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                      {getCurrentLabel('currency')}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {currencyDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search currencies..."
                            value={currencySearch}
                            onChange={(e) => setCurrencySearch(e.target.value)}
                            data-currency-search
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCurrencies.map((cur) => (
                          <button
                            key={cur.value}
                            onClick={() => handleCurrencySelect(cur.value)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                          >
                            {cur.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                <div className="relative" ref={timezoneDropdownRef}>
                  <button
                    type="button"
                    onClick={handleTimezoneDropdownToggle}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-left flex items-center justify-between"
                  >
                    <span className={preferences.timezone ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                      {getCurrentLabel('timezone')}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${timezoneDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {timezoneDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search timezones..."
                            value={timezoneSearch}
                            onChange={(e) => setTimezoneSearch(e.target.value)}
                            data-timezone-search
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredTimezones.map((tz) => (
                          <button
                            key={tz.value}
                            onClick={() => handleTimezoneSelect(tz.value)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                          >
                            {tz.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="relative" ref={themeDropdownRef}>
                  <button
                    type="button"
                    onClick={handleThemeDropdownToggle}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-left flex items-center justify-between"
                  >
                    <span className={preferences.theme ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                      {getCurrentLabel('theme')}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${themeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {themeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search themes..."
                            value={themeSearch}
                            onChange={(e) => setThemeSearch(e.target.value)}
                            data-theme-search
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredThemes.map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => handleThemeSelect(theme.value)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                          >
                            {theme.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Frequency
                </label>
                <select
                  value={preferences.emailFrequency}
                  onChange={(e) => setPreferences(prev => ({ ...prev, emailFrequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                  <option value="never">Never</option>
                </select>
              </div>

              {/* Privacy Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Privacy Level
                </label>
                <select
                  value={preferences.privacyLevel}
                  onChange={(e) => setPreferences(prev => ({ ...prev, privacyLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="public">Public</option>
                  <option value="standard">Standard</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 