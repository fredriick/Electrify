"use client";

import React, { useState } from "react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { 
  CreditCard, 
  Save, 
  Key, 
  Lock, 
  DollarSign, 
  CheckCircle,
  XCircle,
  ToggleRight,
  Shield,
  AlertTriangle,
  Settings,
  Zap,
  Globe,
  Clock,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Bell,
  Database,
  Activity,
  TrendingUp,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

const defaultSettings = {
  // Payment Gateway Settings
  primaryGateway: "stripe",
  secondaryGateway: "paypal",
  testMode: true,
  
  // Stripe Settings
  stripe: {
    enabled: true,
    publishableKey: "pk_test_...",
    secretKey: "sk_test_...",
    webhookSecret: "whsec_...",
    testMode: true
  },
  
  // PayPal Settings
  paypal: {
    enabled: false,
    clientId: "",
    clientSecret: "",
    merchantId: "",
    webhookId: "",
    testMode: true
  },
  
  // Flutterwave Settings
  flutterwave: {
    enabled: false,
    publicKey: "",
    secretKey: "",
    webhookSecret: "",
    testMode: true
  },
  
  // Paystack Settings
  paystack: {
    enabled: false,
    publicKey: "",
  secretKey: "",
    webhookSecret: "",
    testMode: true
  },
  
  // Razorpay Settings
  razorpay: {
    enabled: false,
    keyId: "",
    keySecret: "",
    webhookSecret: "",
    testMode: true
  },
  
  // Square Settings
  square: {
    enabled: false,
    applicationId: "",
    accessToken: "",
    locationId: "",
    testMode: true
  },
  
  // General Payment Settings
  currency: "USD",
  supportedCurrencies: ["USD", "EUR", "GBP", "AED", "INR", "CNY", "NGN"],
  decimalPlaces: 2,
  
  // Transaction Limits
  minTransactionAmount: 1.00,
  maxTransactionAmount: 10000.00,
  dailyTransactionLimit: 50000.00,
  monthlyTransactionLimit: 1000000.00,
  
  // Security Settings
  require3DSecure: true,
  requireCVV: true,
  fraudDetection: true,
  ipWhitelist: [],
  allowedCountries: ["US", "CA", "GB", "DE", "FR", "AU", "AE", "IN", "CN", "NG"],
  blockedCountries: [],
  
  // Webhook Settings
  webhookUrl: "https://api.electrify.com/webhooks/payment",
  webhookRetries: 3,
  webhookTimeout: 30,
  
  // Notification Settings
  emailNotifications: true,
  adminNotifications: true,
  failedPaymentAlerts: true,
  successfulPaymentAlerts: false,
  
  // Compliance & Legal
  pciCompliance: true,
  gdprCompliance: true,
  dataRetentionDays: 7,
  autoRefundEnabled: true,
  refundWindowDays: 30,
  
  // Advanced Settings
  autoCapture: true,
  captureDelay: 0,
  partialRefunds: true,
  recurringPayments: true,
  installmentPayments: false,
  maxInstallments: 12
};

const paymentGateways = [
  { value: "stripe", label: "Stripe", icon: "💳", description: "Global payment processing" },
  { value: "paypal", label: "PayPal", icon: "🔵", description: "Digital wallet payments" },
  { value: "flutterwave", label: "Flutterwave", icon: "🟣", description: "African payment gateway" },
  { value: "paystack", label: "Paystack", icon: "🟢", description: "Nigerian payment gateway" },
  { value: "razorpay", label: "Razorpay", icon: "🔴", description: "Indian payment gateway" },
  { value: "square", label: "Square", icon: "⬜", description: "Point of sale payments" }
];

const currencies = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
  { value: "AED", label: "AED - Dirham", symbol: "د.إ" },
  { value: "INR", label: "INR - Indian Rupee", symbol: "₹" },
  { value: "CNY", label: "CNY - Yuan", symbol: "¥" },
  { value: "NGN", label: "NGN - Naira", symbol: "₦" },
  { value: "CAD", label: "CAD - Canadian Dollar", symbol: "C$" },
  { value: "AUD", label: "AUD - Australian Dollar", symbol: "A$" },
  { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥" }
];

const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "NG", name: "Nigeria" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "EG", name: "Egypt" }
];

const PaymentSettingsPage = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({
    stripePublishable: false,
    stripeSecret: false,
    stripeWebhook: false,
    paypalClientId: false,
    paypalClientSecret: false,
    paypalMerchantId: false,
    paypalWebhookId: false,
    flutterwavePublicKey: false,
    flutterwaveSecretKey: false,
    flutterwaveWebhook: false,
    paystackPublicKey: false,
    paystackSecretKey: false,
    paystackWebhook: false,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate transaction limits
    if (settings.minTransactionAmount < 0.01) {
      newErrors.minTransactionAmount = "Minimum transaction amount must be at least $0.01";
    }
    
    if (settings.maxTransactionAmount <= settings.minTransactionAmount) {
      newErrors.maxTransactionAmount = "Maximum transaction amount must be greater than minimum";
    }
    
    if (settings.dailyTransactionLimit <= 0) {
      newErrors.dailyTransactionLimit = "Daily transaction limit must be greater than 0";
    }
    
    // Validate webhook URL
    if (settings.webhookUrl && !/^https?:\/\/.+/.test(settings.webhookUrl)) {
      newErrors.webhookUrl = "Webhook URL must be a valid HTTPS URL";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    if (type === "checkbox") {
      setSettings((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleGatewayChange = (gateway: string, field: string, value: any) => {
    setSettings((prev) => {
      const gatewaySettings = prev[gateway as keyof typeof prev] as Record<string, any>;
      return {
      ...prev,
      [gateway]: {
          ...gatewaySettings,
        [field]: value
      }
      };
    });
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save payment settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencies.find(c => c.value === currencyCode);
    return currency?.symbol || "$";
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <CreditCard className="w-7 h-7 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Settings</h1>
        </div>
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* Payment Gateway Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 text-blue-600 mr-2" />
              Payment Gateway Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Gateway
            </label>
            <select
                  name="primaryGateway"
                  value={settings.primaryGateway}
              onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {paymentGateways.map((gateway) => (
                    <option key={gateway.value} value={gateway.value}>
                      {gateway.icon} {gateway.label} - {gateway.description}
                    </option>
                  ))}
            </select>
          </div>
              
          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Gateway
            </label>
                <select
                  name="secondaryGateway"
                  value={settings.secondaryGateway}
                onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">None</option>
                  {paymentGateways.map((gateway) => (
                    <option key={gateway.value} value={gateway.value}>
                      {gateway.icon} {gateway.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

                        {/* Dynamic Gateway Configuration */}
            {settings.primaryGateway === 'stripe' && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                  💳 Stripe Configuration
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.stripe.enabled}
                    onChange={(e) => handleGatewayChange('stripe', 'enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enable</span>
                </div>
              </div>
              
              {settings.stripe.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Publishable Key
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.stripePublishable ? "text" : "password"}
                        value={settings.stripe.publishableKey}
                        onChange={(e) => handleGatewayChange('stripe', 'publishableKey', e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="pk_test_..."
                      />
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility('stripePublishable')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets.stripePublishable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.stripe.publishableKey)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
            </div>
          </div>
                  
          <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secret Key
            </label>
                    <div className="relative">
                      <input
                        type={showSecrets.stripeSecret ? "text" : "password"}
                        value={settings.stripe.secretKey}
                        onChange={(e) => handleGatewayChange('stripe', 'secretKey', e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="sk_test_..."
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility('stripeSecret')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets.stripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.stripe.secretKey)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Webhook Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.stripeWebhook ? "text" : "password"}
                        value={settings.stripe.webhookSecret}
                        onChange={(e) => handleGatewayChange('stripe', 'webhookSecret', e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="whsec_..."
                      />
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility('stripeWebhook')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets.stripeWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.stripe.webhookSecret)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <input
                        type="checkbox"
                        checked={settings.stripe.testMode}
                        onChange={(e) => handleGatewayChange('stripe', 'testMode', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Test Mode (Use test keys)
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}

            {settings.primaryGateway === 'paypal' && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                  🔵 PayPal Configuration
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.paypal.enabled}
                    onChange={(e) => handleGatewayChange('paypal', 'enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enable</span>
                </div>
              </div>
              
              {settings.paypal.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Client ID
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.paypalClientId ? "text" : "password"}
                        value={settings.paypal.clientId}
                        onChange={(e) => handleGatewayChange('paypal', 'clientId', e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Client ID"
                      />
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility('paypalClientId')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets.paypalClientId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.paypal.clientId)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
            </div>
          </div>
                  
          <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Client Secret
            </label>
                    <div className="relative">
              <input
                        type={showSecrets.paypalClientSecret ? "text" : "password"}
                        value={settings.paypal.clientSecret}
                        onChange={(e) => handleGatewayChange('paypal', 'clientSecret', e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Client Secret"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility('paypalClientSecret')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets.paypalClientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.paypal.clientSecret)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Merchant ID
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.paypalMerchantId ? "text" : "password"}
                          value={settings.paypal.merchantId}
                          onChange={(e) => handleGatewayChange('paypal', 'merchantId', e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Merchant ID"
                        />
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility('paypalMerchantId')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets.paypalMerchantId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.paypal.merchantId)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Webhook ID
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.paypalWebhookId ? "text" : "password"}
                          value={settings.paypal.webhookId}
                          onChange={(e) => handleGatewayChange('paypal', 'webhookId', e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Webhook ID"
                        />
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility('paypalWebhookId')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets.paypalWebhookId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.paypal.webhookId)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.paypal.testMode}
                          onChange={(e) => handleGatewayChange('paypal', 'testMode', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Test Mode (Use sandbox credentials)
                        </label>
                      </div>
                    </div>
                </div>
              )}
            </div>
            )}

            {settings.primaryGateway === 'flutterwave' && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                    🟣 Flutterwave Configuration
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.flutterwave.enabled}
                      onChange={(e) => handleGatewayChange('flutterwave', 'enabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Enable</span>
                  </div>
                </div>
                
                {settings.flutterwave.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Public Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.flutterwavePublicKey ? "text" : "password"}
                          value={settings.flutterwave.publicKey}
                          onChange={(e) => handleGatewayChange('flutterwave', 'publicKey', e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="FLWPUBK_..."
                        />
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility('flutterwavePublicKey')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets.flutterwavePublicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.flutterwave.publicKey)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Secret Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.flutterwaveSecretKey ? "text" : "password"}
                          value={settings.flutterwave.secretKey}
                          onChange={(e) => handleGatewayChange('flutterwave', 'secretKey', e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="FLWSECK_..."
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility('flutterwaveSecretKey')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets.flutterwaveSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.flutterwave.secretKey)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Webhook Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.flutterwaveWebhook ? "text" : "password"}
                          value={settings.flutterwave.webhookSecret}
                          onChange={(e) => handleGatewayChange('flutterwave', 'webhookSecret', e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Webhook Secret"
                        />
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility('flutterwaveWebhook')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets.flutterwaveWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.flutterwave.webhookSecret)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.flutterwave.testMode}
                          onChange={(e) => handleGatewayChange('flutterwave', 'testMode', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Test Mode (Use test credentials)
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {settings.primaryGateway === 'paystack' && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                    🟢 Paystack Configuration
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.paystack.enabled}
                      onChange={(e) => handleGatewayChange('paystack', 'enabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Enable</span>
                  </div>
                </div>
                
                {settings.paystack.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Public Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.paystackPublicKey ? "text" : "password"}
                          value={settings.paystack.publicKey}
                          onChange={(e) => handleGatewayChange('paystack', 'publicKey', e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="pk_test_..."
                        />
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility('paystackPublicKey')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets.paystackPublicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.paystack.publicKey)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Secret Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.paystackSecretKey ? "text" : "password"}
                          value={settings.paystack.secretKey}
                          onChange={(e) => handleGatewayChange('paystack', 'secretKey', e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="sk_test_..."
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility('paystackSecretKey')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets.paystackSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.paystack.secretKey)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Webhook Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.paystackWebhook ? "text" : "password"}
                          value={settings.paystack.webhookSecret}
                          onChange={(e) => handleGatewayChange('paystack', 'webhookSecret', e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Webhook Secret"
                        />
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility('paystackWebhook')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets.paystackWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.paystack.webhookSecret)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.paystack.testMode}
                          onChange={(e) => handleGatewayChange('paystack', 'testMode', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Test Mode (Use test credentials)
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {settings.primaryGateway === 'razorpay' && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                    🔴 Razorpay Configuration
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.razorpay?.enabled || false}
                      onChange={(e) => handleGatewayChange('razorpay', 'enabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Enable</span>
                  </div>
                </div>
                
                <div className="text-center py-8 text-gray-500">
                  <p>Razorpay configuration will be implemented soon.</p>
                </div>
              </div>
            )}

            {settings.primaryGateway === 'square' && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                    ⬜ Square Configuration
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.square?.enabled || false}
                      onChange={(e) => handleGatewayChange('square', 'enabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Enable</span>
                  </div>
                </div>
                
                <div className="text-center py-8 text-gray-500">
                  <p>Square configuration will be implemented soon.</p>
                </div>
              </div>
            )}
          </div>

          {/* General Payment Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Globe className="w-5 h-5 text-green-600 mr-2" />
              General Payment Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="currency">
                  Default Currency
            </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="currency"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
                  >
                    {currencies.map((curr) => (
                      <option key={curr.value} value={curr.value}>
                        {curr.label}
                      </option>
                    ))}
              </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Symbol: {getCurrencySymbol(settings.currency)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="decimalPlaces">
                  Decimal Places
                </label>
                <input
                  id="decimalPlaces"
                  name="decimalPlaces"
                  type="number"
                  min="0"
                  max="4"
                  value={settings.decimalPlaces}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Mode
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="testMode"
                    name="testMode"
                    type="checkbox"
                    checked={settings.testMode}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="testMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable test mode for all gateways
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Limits */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
              Transaction Limits
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="minTransactionAmount">
                  Minimum Transaction
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="minTransactionAmount"
                    name="minTransactionAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={settings.minTransactionAmount}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.minTransactionAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
                {errors.minTransactionAmount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.minTransactionAmount}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="maxTransactionAmount">
                  Maximum Transaction
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="maxTransactionAmount"
                    name="maxTransactionAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={settings.maxTransactionAmount}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.maxTransactionAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
                {errors.maxTransactionAmount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.maxTransactionAmount}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="dailyTransactionLimit">
                  Daily Limit
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="dailyTransactionLimit"
                    name="dailyTransactionLimit"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={settings.dailyTransactionLimit}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.dailyTransactionLimit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
                {errors.dailyTransactionLimit && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.dailyTransactionLimit}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="monthlyTransactionLimit">
                  Monthly Limit
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="monthlyTransactionLimit"
                    name="monthlyTransactionLimit"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={settings.monthlyTransactionLimit}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 text-red-600 mr-2" />
              Security Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <input
                      id="require3DSecure"
                      name="require3DSecure"
                      type="checkbox"
                      checked={settings.require3DSecure}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="require3DSecure" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      3D Secure Authentication
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">Enhanced security</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <input
                      id="requireCVV"
                      name="requireCVV"
                      type="checkbox"
                      checked={settings.requireCVV}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="requireCVV" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Require CVV
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">Card verification</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <input
                      id="fraudDetection"
                      name="fraudDetection"
                      type="checkbox"
                      checked={settings.fraudDetection}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="fraudDetection" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fraud Detection
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">AI-powered protection</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <input
                      id="pciCompliance"
                      name="pciCompliance"
                      type="checkbox"
                      checked={settings.pciCompliance}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="pciCompliance" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      PCI Compliance
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">Required for card processing</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <input
                      id="gdprCompliance"
                      name="gdprCompliance"
                      type="checkbox"
                      checked={settings.gdprCompliance}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="gdprCompliance" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      GDPR Compliance
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">Data protection</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <input
                      id="autoRefundEnabled"
                      name="autoRefundEnabled"
                      type="checkbox"
                      checked={settings.autoRefundEnabled}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="autoRefundEnabled" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto Refund
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">Failed transaction refunds</span>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 text-yellow-600 mr-2" />
              Webhook Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="webhookUrl">
                  Webhook URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="webhookUrl"
                    name="webhookUrl"
                    type="url"
                    value={settings.webhookUrl}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.webhookUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="https://api.electrify.com/webhooks/payment"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Test webhook"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                {errors.webhookUrl && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.webhookUrl}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="webhookRetries">
                  Webhook Retries
                </label>
                <input
                  id="webhookRetries"
                  name="webhookRetries"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.webhookRetries}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Bell className="w-5 h-5 text-blue-600 mr-2" />
              Notification Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <input
                      id="emailNotifications"
                      name="emailNotifications"
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="emailNotifications" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Notifications
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">Payment confirmations</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <input
                      id="adminNotifications"
                      name="adminNotifications"
                      type="checkbox"
                      checked={settings.adminNotifications}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="adminNotifications" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Admin Notifications
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">High-value transactions</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <input
                      id="failedPaymentAlerts"
                      name="failedPaymentAlerts"
                      type="checkbox"
                      checked={settings.failedPaymentAlerts}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="failedPaymentAlerts" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Failed Payment Alerts
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">Immediate notifications</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
            <input
                      id="successfulPaymentAlerts"
                      name="successfulPaymentAlerts"
              type="checkbox"
                      checked={settings.successfulPaymentAlerts}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
                    <label htmlFor="successfulPaymentAlerts" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Successful Payment Alerts
            </label>
                  </div>
                  <span className="text-sm text-gray-500">Payment confirmations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            {saved && (
              <div className="flex items-center text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5 mr-2" />
                Payment settings saved successfully!
              </div>
            )}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Payment Settings"}
            </button>
          </div>
        </form>
      </div>
    </SuperAdminLayout>
  );
};

export default PaymentSettingsPage; 