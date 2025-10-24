'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { supplierService, SupplierProfile } from '@/lib/supplierService';
import { getSupabaseClient } from '@/lib/auth';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Store, 
  CreditCard, 
  Truck, 
  Building2,
  Save,
  XCircle,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Users,
  Globe,
  Percent,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Edit,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SellerSettingsPage() {
  const { user, profile: authProfile } = useAuth();
  const { currentCurrency, setCurrency } = useCurrency();
  const supabase = getSupabaseClient();
  const [activeTab, setActiveTab] = useState('seller-settings');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [productCount, setProductCount] = useState(0);

  // Get currency symbol based on current currency
  const getCurrencySymbol = (currencyCode: string) => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'NGN': '₦'
    };
    return currencySymbols[currencyCode] || currencyCode;
  };

  const currentCurrencySymbol = getCurrencySymbol(currentCurrency);

  // Mock sales volume for demonstration (in real app, this would come from database)
  const mockSalesVolume = 25000; // $25,000

  // Calculate commission rate based on sales volume - moved inside component to avoid initialization issues
  const calculateCommissionRate = (salesVolume: number) => {
    if (!platformSettings?.commission) return 5.0; // Default fallback
    
    if (salesVolume >= 100000) {
      return platformSettings.commission.tier2Rate; // Premium tier
    } else if (salesVolume >= 10000) {
      return platformSettings.commission.tier1Rate; // High volume tier
    } else {
      return platformSettings.commission.baseRate; // Base rate
    }
  };

  // Validate commission rates - moved inside component to avoid initialization issues
  const validateCommissionRates = () => {
    if (!platformSettings?.commission) return [];
    
    const { baseRate, tier1Rate, tier2Rate } = platformSettings.commission;
    const warnings = [];
    
    if (tier1Rate >= baseRate) {
      warnings.push('Tier 1 rate should be lower than base rate for volume discounts');
    }
    if (tier2Rate >= tier1Rate) {
      warnings.push('Tier 2 rate should be lower than Tier 1 rate for premium discounts');
    }
    if (baseRate > 10) {
      warnings.push('Base commission rate seems high (>10%)');
    }
    
    return warnings;
  };

  // Seller Settings State - Initialize with empty values, will be populated from database
  const [sellerSettings, setSellerSettings] = useState({
    // Holiday Mode
    holidayMode: {
      enabled: false,
      startDate: "",
      endDate: "",
      message: "We are currently on holiday. Orders will be processed when we return.",
      autoResponder: true
    },
    // Security
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 30
    }
  });

  // Monitor sellerSettings changes for debugging
  useEffect(() => {
    console.log('🔍 sellerSettings state changed:', sellerSettings);
  }, [sellerSettings]);

  // Fetch supplier profile data
  useEffect(() => {
    const fetchSupplierProfile = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        console.log('Using authProfile from AuthContext instead of supplierService');
        console.log('AuthProfile:', authProfile);
        
        if (authProfile) {
          // Convert UserProfile to SupplierProfile format
          const profile = {
            id: authProfile.id,
            email: authProfile.email,
            first_name: authProfile.first_name,
            last_name: authProfile.last_name,
            phone: authProfile.phone,
            country: authProfile.country,
            state: authProfile.state,
            avatar_url: authProfile.avatar_url,
            account_type: authProfile.account_type || 'individual',
            shop_name: authProfile.shop_name,
            individual_first_name: authProfile.first_name,
            individual_last_name: authProfile.last_name,
            individual_phone: authProfile.phone,
            company_name: authProfile.business_name,
            company_description: '',
            company_phone: authProfile.business_phone,
            company_website: authProfile.business_website,
            company_address: authProfile.business_address,
            contact_person: '',
            contact_person_phone: '',
            contact_person_email: '',
            business_license: authProfile.tax_id,
            tax_id: authProfile.tax_id,
            business_registration_number: '',
            business_type: '',
            industry_category: '',
            is_verified: authProfile.is_verified || false,
            is_active: true,
            verification_status: 'pending',
            notification_preferences: authProfile.notification_preferences,
            user_preferences: authProfile.user_preferences,
            created_at: authProfile.created_at,
            updated_at: authProfile.updated_at
          } as SupplierProfile;
          
          console.log('Supplier profile converted from authProfile:', profile);
          setSupplierProfile(profile);
          
          // Always try to load the latest settings from the database
          // This ensures we get the most up-to-date data
          try {
            console.log('Fetching latest supplier profile from database...');
            const latestProfile = await supplierService.getSupplierProfile(user.id);
            
            console.log('🔍 Latest profile from database:', latestProfile);
            console.log('🔍 user_preferences structure:', latestProfile?.user_preferences);
            
            if (latestProfile && latestProfile.user_preferences) {
              console.log('✅ Latest user_preferences from database:', latestProfile.user_preferences);
              
              // Load holiday mode settings
              if (latestProfile.user_preferences.holidayMode) {
                console.log('🔍 Holiday mode settings found:', latestProfile.user_preferences.holidayMode);
              }
              
              // Load security settings
              if (latestProfile.user_preferences.security) {
                console.log('🔍 Security settings found:', latestProfile.user_preferences.security);
              }
              
              setSellerSettings(prev => {
                const updated = {
              ...prev,
                  holidayMode: {
                    ...prev.holidayMode,
                    enabled: latestProfile.user_preferences?.holidayMode?.enabled ?? prev.holidayMode.enabled,
                    startDate: latestProfile.user_preferences?.holidayMode?.startDate ?? prev.holidayMode.startDate,
                    endDate: latestProfile.user_preferences?.holidayMode?.endDate ?? prev.holidayMode.endDate,
                    message: latestProfile.user_preferences?.holidayMode?.message ?? prev.holidayMode.message,
                    autoResponder: latestProfile.user_preferences?.holidayMode?.autoResponder ?? prev.holidayMode.autoResponder
                  },
                  security: {
                    ...prev.security,
                    twoFactorEnabled: latestProfile.user_preferences?.security?.twoFactorEnabled ?? prev.security.twoFactorEnabled,
                    loginAlerts: latestProfile.user_preferences?.security?.loginAlerts ?? prev.security.loginAlerts,
                    sessionTimeout: latestProfile.user_preferences?.security?.sessionTimeout ?? prev.security.sessionTimeout
                  }
                };
                
                console.log('✅ Updated sellerSettings from database:', updated);
                return updated;
              });
            } else {
              console.log('⚠️ No user_preferences found in database, using defaults');
              console.log('🔍 Profile structure:', latestProfile);
            }
          } catch (error) {
            console.error('❌ Error fetching latest profile from database:', error);
          }

          // Load notification preferences if available
          // Removed: Now managed in Profile page
          // if (profile.notification_preferences) {
          //   console.log('Loading notification preferences:', profile.notification_preferences);
          //   setSellerSettings(prev => ({
          //     ...prev,
          //     notifications: {
          //       ...prev.notifications,
          //       ...profile.notification_preferences
          //     }
          //   }));
          // }

          // Load platform settings from user_preferences if available
          if (profile.user_preferences) {
            console.log('Loading platform settings:', profile.user_preferences);
            setPlatformSettings(prev => ({
              ...prev,
              ...profile.user_preferences
            }));
          }

          // Load payment info if available
          if (profile.payment_info) {
            console.log('Loading payment info:', profile.payment_info);
            // You can use this for payment-related settings
          }

          // Fetch product count
          try {
            const stats = await supplierService.getSupplierStats(user.id);
            if (stats) {
              setProductCount(stats.totalProducts);
              // Update platform settings with real product count
              setPlatformSettings(prev => ({
                ...prev,
                products: {
                  ...prev.products,
                  currentProducts: stats.totalProducts
                }
              }));
            }
          } catch (error) {
            console.error('Error fetching product count:', error);
          }
        } else {
          console.log('No authProfile available, trying supplierService as fallback');
          const profile = await supplierService.getSupplierProfile(user.id);
          
          if (profile) {
            console.log('Supplier profile fetched from supplierService:', profile);
            setSupplierProfile(profile);
            
            // Update seller settings with real data from database
            console.log('Loading seller settings from supplierService profile.user_preferences:', profile.user_preferences);
            console.log('Current sellerSettings state before update (fallback):', sellerSettings);
            
            setSellerSettings(prev => {
              const updated = {
              ...prev,
                holidayMode: {
                  ...prev.holidayMode,
                  enabled: profile.user_preferences?.holidayMode?.enabled ?? prev.holidayMode.enabled,
                  startDate: profile.user_preferences?.holidayMode?.startDate ?? prev.holidayMode.startDate,
                  endDate: profile.user_preferences?.holidayMode?.endDate ?? prev.holidayMode.endDate,
                  message: profile.user_preferences?.holidayMode?.message ?? prev.holidayMode.message,
                  autoResponder: profile.user_preferences?.holidayMode?.autoResponder ?? prev.holidayMode.autoResponder
                },
                security: {
                  ...prev.security,
                  twoFactorEnabled: profile.user_preferences?.security?.twoFactorEnabled ?? prev.security.twoFactorEnabled,
                  loginAlerts: profile.user_preferences?.security?.loginAlerts ?? prev.security.loginAlerts,
                  sessionTimeout: profile.user_preferences?.security?.sessionTimeout ?? prev.security.sessionTimeout
                }
              };
              
              console.log('Updated sellerSettings state (fallback):', updated);
              return updated;
            });

            // Load notification preferences if available
            // Removed: Now managed in Profile page
            // if (profile.notification_preferences) {
            //   setSellerSettings(prev => ({
            //     ...prev,
            //     notifications: {
            //       ...prev.notifications,
            //       ...profile.notification_preferences
            //     }
            //   }));
            // }

            // Load platform settings from user_preferences if available
            if (profile.user_preferences) {
              setPlatformSettings(prev => ({
                ...prev,
                ...profile.user_preferences
              }));
            }

            // Load payment info if available
            if (profile.payment_info) {
              console.log('Loading payment info:', profile.payment_info);
              // You can use this for payment-related settings
            }

            // Fetch product count
            try {
              const stats = await supplierService.getSupplierStats(user.id);
              if (stats) {
                setProductCount(stats.totalProducts);
                // Update platform settings with real product count
                setPlatformSettings(prev => ({
                  ...prev,
                  products: {
                    ...prev.products,
                    currentProducts: stats.totalProducts
                  }
                }));
              }
            } catch (error) {
              console.error('Error fetching product count:', error);
            }
          } else {
            console.log('No supplier profile found for user:', user.id);
            setError('No supplier profile found. Please contact support.');
          }
        }
      } catch (error) {
        console.error('Error fetching supplier profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierProfile();
  }, [user?.id, authProfile?.id]); // Only run when user or authProfile changes

  // Platform Settings State - Initialize with empty values, will be populated from database
  const [platformSettings, setPlatformSettings] = useState({
    // Currency & Commission
    currency: {
      defaultCurrency: "USD",
      supportedCurrencies: ["USD", "EUR", "GBP", "NGN"],
      exchangeRate: 1.0
    },
    commission: {
      baseRate: 5.0, // 5%
      tier1Rate: 4.0, // 4% for high volume
      tier2Rate: 3.0, // 3% for premium sellers
      minimumCommission: 0.50,
      testSalesVolume: 0 // Added for testing
    },
    fees: {
      listingFee: 0.99,
      transactionFee: 2.9,
      withdrawalFee: 1.0,
      monthlySubscription: 29.99,
      testAmount: 100 // Added for fee calculator
    },
    // Product Management
    products: {
      creationLimit: 100,
      currentProducts: 0,
      gmvTier: "Bronze", // Bronze, Silver, Gold, Platinum
      maxProductsAllowed: 100,
      productApprovalRequired: true,
      bulkUploadEnabled: true
    }
  });

  // Monitor platformSettings changes for debugging
  useEffect(() => {
    console.log('🔍 platformSettings state changed:', platformSettings);
  }, [platformSettings]);

  const tabs = [
    { 
      id: 'seller-settings', 
      name: 'Seller Settings', 
      icon: User,
      description: 'Manage your account, profile, and preferences'
    },
    { 
      id: 'platform-settings', 
      name: 'Platform Settings', 
      icon: Settings,
      description: 'Currency, commission, fees, and product management'
    }
  ];

  const handleSave = async (section: string) => {
    if (!user?.id || !supplierProfile) {
      setError('User not authenticated');
      return;
    }

    setError('');
    
    try {
      if (section === 'platform-settings') {
          // Save platform settings to user_preferences
          const currentProfile = await supplierService.getSupplierProfile(user.id);
          const currentPrefs = currentProfile?.user_preferences || {};

        const updateData = {
            user_preferences: {
              ...currentPrefs,
              ...platformSettings
            }
          };

          console.log('Updating platform settings with data:', updateData);
          const result = await supplierService.updateSupplierProfile(user.id, updateData);
          
          console.log('Platform settings update result:', result);
          
          if (result.success) {
            // Show success message
            setError(''); // Clear any existing errors
            // Refresh the profile data
            const updatedProfile = await supplierService.getSupplierProfile(user.id);
            if (updatedProfile) {
              setSupplierProfile(updatedProfile);
            }
            // Show temporary success feedback
            const successMsg = document.createElement('div');
            successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            successMsg.textContent = '✅ Platform settings saved successfully!';
            document.body.appendChild(successMsg);
            setTimeout(() => {
              document.body.removeChild(successMsg);
            }, 3000);
          } else {
            setError(result.error || 'Failed to save platform settings');
          }
        }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    }
  };

  const updateSellerSettings = async (section: string, field: string, value: any) => {
    // Don't update local state immediately - wait for database confirmation
    // This prevents the toggle from flickering back to default
    
    // Save to database if user is authenticated
    if (user?.id) {
      try {
        // Map the toggle fields to the actual database columns
        let updateData: any = {};
        
        if (section === 'holidayMode') {
          // Store holiday mode settings in user_preferences
          const currentProfile = await supplierService.getSupplierProfile(user.id);
          const currentPrefs = currentProfile?.user_preferences || {};
          
          console.log('🔍 Current user_preferences before update:', currentPrefs);
          console.log(`🔍 Updating holidayMode.${field} to:`, value);
          
          updateData = {
            user_preferences: {
              ...currentPrefs,
              holidayMode: {
                ...currentPrefs.holidayMode,
                [field]: value
              }
            }
          };
          
          console.log('🔍 Final user_preferences update:', updateData.user_preferences);
        } else if (section === 'security' && field === 'twoFactorEnabled') {
          // Store security settings in user_preferences
          const currentProfile = await supplierService.getSupplierProfile(user.id);
          const currentPrefs = currentProfile?.user_preferences || {};
          
          console.log('🔍 Current user_preferences before update:', currentPrefs);
          console.log('🔍 Updating security.twoFactorEnabled to:', value);
          
          updateData = {
            user_preferences: {
              ...currentPrefs,
              security: {
                ...currentPrefs.security,
                loginAlerts: currentPrefs.security?.loginAlerts ?? false,
                twoFactorEnabled: value
              }
            }
          };
          
          console.log('🔍 Final user_preferences update:', updateData.user_preferences);
        } else if (section === 'security' && field === 'loginAlerts') {
          // Store login alerts in user_preferences
          const currentProfile = await supplierService.getSupplierProfile(user.id);
          const currentPrefs = currentProfile?.user_preferences || {};
          
          console.log('🔍 Current user_preferences before update:', currentPrefs);
          console.log('🔍 Updating security.loginAlerts to:', value);
          
          updateData = {
            user_preferences: {
              ...currentPrefs,
              security: {
                ...currentPrefs.security,
                twoFactorEnabled: currentPrefs.security?.twoFactorEnabled ?? false,
                loginAlerts: value
              }
            }
          };
          
          console.log('🔍 Final user_preferences update:', updateData.user_preferences);
        }

        if (Object.keys(updateData).length > 0) {
          console.log('🔍 Saving to database:', updateData);
          
          const result = await supplierService.updateSupplierProfile(user.id, updateData);

          if (result.success) {
            console.log(`✅ ${section}.${field} updated successfully`);
            
            // Only update local state after successful database save
    setSellerSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
            
            // Refresh the supplier profile to get the latest data
            try {
              const updatedProfile = await supplierService.getSupplierProfile(user.id);
              if (updatedProfile) {
                setSupplierProfile(updatedProfile);
                console.log('✅ Supplier profile refreshed after update');
              }
            } catch (error) {
              console.error('❌ Error refreshing supplier profile:', error);
            }
          } else {
            console.error(`❌ Failed to update ${section}.${field}:`, result.error);
            // Don't update local state if database save failed
          }
        }
      } catch (error) {
        console.error(`❌ Error updating ${section}.${field}:`, error);
        // Don't update local state if there was an error
      }
    }
  };

  const updatePlatformSettings = async (section: string, field: string, value: any) => {
    // Update local state immediately for responsive UI
    setPlatformSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));

    // Auto-save to database if user is authenticated
    if (user?.id) {
      try {
        const currentProfile = await supplierService.getSupplierProfile(user.id);
        const currentPrefs = currentProfile?.user_preferences || {};
        
        const updateData = {
          user_preferences: {
            ...currentPrefs,
            [section]: {
              ...currentPrefs[section],
              [field]: value
            }
          }
        };

        console.log('🔍 Auto-saving platform setting:', section, field, value);
        const result = await supplierService.updateSupplierProfile(user.id, updateData);
        
        if (result.success) {
          console.log(`✅ ${section}.${field} auto-saved successfully`);
        } else {
          console.error(`❌ Failed to auto-save ${section}.${field}:`, result.error);
        }
      } catch (error) {
        console.error(`❌ Error auto-saving ${section}.${field}:`, error);
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading seller settings...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <Settings className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seller Settings</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your account and platform preferences</p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message for Platform Settings */}
        {activeTab === 'platform-settings' && !error && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-600 dark:bg-green-400 rounded-full mr-2 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-green-800 dark:text-green-200">
                Platform settings are automatically saved as you make changes. Use the Save button to ensure all changes are persisted.
              </span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5 mb-1" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Seller Settings Tab */}
          {activeTab === 'seller-settings' && (
            <div className="p-6 space-y-8">
              {loading && (
                <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-700 dark:text-blue-300">Loading your settings...</span>
                    </div>
                  )}

              {/* Holiday Mode Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                  Holiday Mode
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Enable Holiday Mode</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Temporarily pause your store and set an auto-response message
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={loading ? false : sellerSettings.holidayMode.enabled}
                        onChange={(e) => updateSellerSettings('holidayMode', 'enabled', e.target.checked)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer transition-all ${
                        loading 
                          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                          : 'bg-gray-200 dark:bg-gray-700 peer-checked:bg-blue-600'
                      } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
                    </label>
                  </div>

                  {sellerSettings.holidayMode.enabled && (
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Start Date
                          </label>
                          <div className="relative">
                          <input
                            type="date"
                            value={sellerSettings.holidayMode.startDate}
                              onChange={(e) => {
                                console.log('📅 Start date changed to:', e.target.value);
                                updateSellerSettings('holidayMode', 'startDate', e.target.value);
                              }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              min={new Date().toISOString().split('T')[0]} // Can't select past dates
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {sellerSettings.holidayMode.startDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Selected: {new Date(sellerSettings.holidayMode.startDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            End Date
                          </label>
                          <div className="relative">
                          <input
                            type="date"
                            value={sellerSettings.holidayMode.endDate}
                              onChange={(e) => {
                                console.log('📅 End date changed to:', e.target.value);
                                updateSellerSettings('holidayMode', 'endDate', e.target.value);
                              }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              min={sellerSettings.holidayMode.startDate || new Date().toISOString().split('T')[0]} // Can't be before start date
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {sellerSettings.holidayMode.endDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Selected: {new Date(sellerSettings.holidayMode.endDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Holiday Message
                        </label>
                        <textarea
                          value={sellerSettings.holidayMode.message}
                          onChange={(e) => updateSellerSettings('holidayMode', 'message', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Enter your holiday message..."
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sellerSettings.holidayMode.autoResponder}
                          onChange={(e) => updateSellerSettings('holidayMode', 'autoResponder', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Enable auto-responder for customer inquiries
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  Security
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={loading ? false : sellerSettings.security.twoFactorEnabled}
                        onChange={(e) => updateSellerSettings('security', 'twoFactorEnabled', e.target.checked)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer transition-all ${
                        loading 
                          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                          : 'bg-gray-200 dark:bg-gray-700 peer-checked:bg-blue-600'
                      } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Login Alerts</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified of new login attempts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={loading ? false : sellerSettings.security.loginAlerts}
                        onChange={(e) => updateSellerSettings('security', 'loginAlerts', e.target.checked)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer transition-all ${
                        loading 
                          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                          : 'bg-gray-200 dark:bg-gray-700 peer-checked:bg-blue-600'
                      } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notifications Section - Removed: Use Profile Page Notifications Instead */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">Notification Preferences</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Notification preferences are now managed in your Profile page. 
                  <a href="/profile" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                    Go to Profile →
                  </a>
                </p>
              </div>


            </div>
          )}

          {/* Platform Settings Tab */}
          {activeTab === 'platform-settings' && (
            <div className="p-6 space-y-8">
              {loading && (
                <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-700 dark:text-blue-300">Loading platform settings...</span>
                </div>
              )}

              {!loading && platformSettings && (
                <>
                  {/* Platform Settings Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Commission Rate</p>
                          <p className="text-2xl font-bold">{calculateCommissionRate(mockSalesVolume)}%</p>
                        </div>
                        <DollarSign className="w-8 h-8 opacity-80" />
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Products</p>
                          <p className="text-2xl font-bold">{platformSettings.products.currentProducts}</p>
                        </div>
                        <Package className="w-8 h-8 opacity-80" />
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Transaction Fee</p>
                          <p className="text-2xl font-bold">{platformSettings.fees.transactionFee}%</p>
                        </div>
                        <Percent className="w-8 h-8 opacity-80" />
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Currency</p>
                          <p className="text-2xl font-bold">{currentCurrency}</p>
                        </div>
                        <Globe className="w-8 h-8 opacity-80" />
                      </div>
                    </div>
                  </div>

              {/* Currency & Commission Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  Currency & Commission
                </h2>
                    
                    {/* Current Commission Rate Display */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-blue-800 dark:text-blue-200">Current Commission Rate</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Based on your sales volume of {currentCurrencySymbol}{mockSalesVolume.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {calculateCommissionRate(mockSalesVolume)}%
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            {mockSalesVolume >= 100000 ? 'Premium Tier' : mockSalesVolume >= 10000 ? 'High Volume Tier' : 'Base Tier'}
                          </div>
                        </div>
                      </div>
                    </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Currency
                    </label>
                        <div className="flex items-center space-x-2">
                                          <select
                        value={currentCurrency}
                        onChange={async (e) => {
                          const newCurrency = e.target.value;
                              console.log('🔄 Currency changed to:', newCurrency);
                              
                              try {
                                // Update the global currency context first
                          await setCurrency(newCurrency);
                                
                                // Also update the local platform settings and save to database
                                await updatePlatformSettings('currency', 'defaultCurrency', newCurrency);
                                
                                // Show success message
                                const successMsg = document.createElement('div');
                                successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                                successMsg.textContent = `✅ Currency updated to ${newCurrency}! All pages will now use ${newCurrency === 'NGN' ? '₦' : newCurrency === 'EUR' ? '€' : newCurrency === 'GBP' ? '£' : '$'}`;
                                document.body.appendChild(successMsg);
                                setTimeout(() => {
                                  document.body.removeChild(successMsg);
                                }, 4000);
                                
                              } catch (error) {
                                console.error('❌ Error updating currency:', error);
                                // Show error message
                                const errorMsg = document.createElement('div');
                                errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                                errorMsg.textContent = '❌ Failed to update currency. Please try again.';
                                document.body.appendChild(errorMsg);
                                setTimeout(() => {
                                  document.body.removeChild(errorMsg);
                                }, 4000);
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                    </select>
                          <button
                            onClick={async () => {
                              try {
                                await setCurrency(currentCurrency);
                                // Show success message
                                const successMsg = document.createElement('div');
                                successMsg.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                                successMsg.textContent = '🔄 Currency context refreshed! All pages should now show the correct currency.';
                                document.body.appendChild(successMsg);
                                setTimeout(() => {
                                  document.body.removeChild(successMsg);
                                }, 4000);
                              } catch (error) {
                                console.error('❌ Error refreshing currency:', error);
                              }
                            }}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Refresh currency context across all pages"
                          >
                            🔄
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          💡 Currency changes are automatically saved and will update across all pages. 
                          If you don't see the change immediately on other pages, use the refresh button or navigate between pages.
                        </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Base Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={platformSettings.commission.baseRate}
                      onChange={(e) => updatePlatformSettings('commission', 'baseRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tier 1 Rate (%) - High Volume
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={platformSettings.commission.tier1Rate}
                      onChange={(e) => updatePlatformSettings('commission', 'tier1Rate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tier 2 Rate (%) - Premium
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={platformSettings.commission.tier2Rate}
                      onChange={(e) => updatePlatformSettings('commission', 'tier2Rate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                      
                      {/* Sales Volume Test Input */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Test Commission Rate with Sales Volume ({currentCurrencySymbol})
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="number"
                            step="1000"
                            value={mockSalesVolume}
                            onChange={(e) => {
                              const newVolume = parseInt(e.target.value) || 0;
                              // In a real app, this would update the database
                              // For now, we'll just update the local state for demonstration
                              setPlatformSettings(prev => ({
                                ...prev,
                                commission: {
                                  ...prev.commission,
                                  testSalesVolume: newVolume
                                }
                              }));
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter sales volume to test commission rate"
                          />
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Rate: {calculateCommissionRate(mockSalesVolume)}%
                          </div>
                        </div>
                  </div>
                </div>
              </div>

                  {/* Commission Rate Warnings */}
                  {validateCommissionRates().length > 0 && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">Commission Rate Warnings</span>
                      </div>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {validateCommissionRates().map((warning, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

              {/* Fees Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Percent className="w-5 h-5 text-red-600 mr-2" />
                  Fees
                </h2>
                    
                    {/* Fee Calculator */}
                    <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                      <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-3">Fee Calculator</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                            Transaction Amount ({currentCurrencySymbol})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={platformSettings.fees.testAmount || 100}
                            onChange={(e) => updatePlatformSettings('fees', 'testAmount', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-orange-300 dark:border-orange-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-orange-700 dark:text-white"
                            placeholder="100.00"
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">Transaction Fee</div>
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {currentCurrencySymbol}{((platformSettings.fees.testAmount || 100) * (platformSettings.fees.transactionFee / 100)).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">Total Cost</div>
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {currentCurrencySymbol}{((platformSettings.fees.testAmount || 100) + ((platformSettings.fees.testAmount || 100) * (platformSettings.fees.transactionFee / 100))).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Listing Fee ({currentCurrencySymbol})
                      </label>
                    <input
                      type="number"
                      step="0.01"
                      value={platformSettings.fees.listingFee}
                      onChange={(e) => updatePlatformSettings('fees', 'listingFee', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Transaction Fee (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={platformSettings.fees.transactionFee}
                      onChange={(e) => updatePlatformSettings('fees', 'transactionFee', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Withdrawal Fee ({currentCurrencySymbol})
                      </label>
                    <input
                      type="number"
                      step="0.01"
                      value={platformSettings.fees.withdrawalFee}
                      onChange={(e) => updatePlatformSettings('fees', 'withdrawalFee', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monthly Subscription ({currentCurrencySymbol})
                      </label>
                    <input
                      type="number"
                      step="0.01"
                      value={platformSettings.fees.monthlySubscription}
                      onChange={(e) => updatePlatformSettings('fees', 'monthlySubscription', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Product Management Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-2" />
                  Product Management
                </h2>
                    
                    {/* Product Limit Progress */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Product Limit Usage</span>
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {platformSettings.products.currentProducts} / {platformSettings.products.maxProductsAllowed}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((platformSettings.products.currentProducts / platformSettings.products.maxProductsAllowed) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        {platformSettings.products.currentProducts >= platformSettings.products.maxProductsAllowed 
                          ? '⚠️ Product limit reached' 
                          : `${platformSettings.products.maxProductsAllowed - platformSettings.products.currentProducts} products remaining`
                        }
                      </div>
                    </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Product Count
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                            value={platformSettings.products.currentProducts}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                      />
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        / {platformSettings.products.maxProductsAllowed}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GMV Tier
                    </label>
                    <select
                      value={platformSettings.products.gmvTier}
                      onChange={(e) => updatePlatformSettings('products', 'gmvTier', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Bronze">Bronze (0 - {currentCurrencySymbol}10K)</option>
                      <option value="Silver">Silver ({currentCurrencySymbol}10K - {currentCurrencySymbol}50K)</option>
                      <option value="Gold">Gold ({currentCurrencySymbol}50K - {currentCurrencySymbol}100K)</option>
                      <option value="Platinum">Platinum ({currentCurrencySymbol}100K+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Products Allowed
                    </label>
                    <input
                      type="number"
                      value={platformSettings.products.maxProductsAllowed}
                      onChange={(e) => updatePlatformSettings('products', 'maxProductsAllowed', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => handleSave('platform-settings')}
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                      {loading ? (
                        <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                  ) : (
                        <>
                    <Save className="w-4 h-4 mr-2" />
                          Save All Platform Settings
                        </>
                  )}
                </button>
              </div>

                  {/* Business Insights */}
                  <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                      Business Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                          {currentCurrencySymbol}{((platformSettings.fees.testAmount || 100) * (platformSettings.fees.transactionFee / 100)).toFixed(2)}
            </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Fee per {currentCurrencySymbol}100 transaction</div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {platformSettings.products.maxProductsAllowed - platformSettings.products.currentProducts}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Products remaining</div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                          {calculateCommissionRate(mockSalesVolume)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Current commission rate</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 