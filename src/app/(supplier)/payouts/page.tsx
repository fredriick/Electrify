'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Plus, 
  Calendar,
  CreditCard,
  Building2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { payoutsService, Payout, PaymentMethod, PayoutStats } from '@/lib/payoutsService';
import React from 'react';
import { getSupabaseClient } from '@/lib/auth';

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
  },
  processed: {
    label: 'Processed',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }
};

export default function PayoutsPage() {
  const { user } = useAuth();
  const { currentCurrency, formatCurrency, getCurrencySymbol } = useCurrency();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stats, setStats] = useState<PayoutStats>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingPayouts: 0,
    thisMonthEarnings: 0,
    totalPayouts: 0,
    completedPayouts: 0,
    pendingPayoutsCount: 0,
    thisPeriodChange: 0,
    thisMonthChange: 0,
    lastMonthEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [showRequestPayout, setShowRequestPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showEditPaymentMethod, setShowEditPaymentMethod] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPaymentMethod, setDeletingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: '',
    name: '',
    account: '',
    isDefault: false
  });

  useEffect(() => {
    fetchPayoutsData();
  }, [user?.id]);

  const fetchPayoutsData = async () => {
    if (!user?.id) {
      // No user ID found
      return;
    }

    // Fetching data for user
    setLoading(true);
    try {
      // First check if user exists in suppliers table
      const supabaseClient = getSupabaseClient();
      if (!supabaseClient) {
        setErrorMessage('Database connection error. Please try again.');
        return;
      }

      const { data: supplierCheck, error: supplierError } = await supabaseClient
        .from('suppliers')
        .select('id')
        .eq('id', user.id)
        .single();

      if (supplierError) {
        // User not found in suppliers table
        setErrorMessage('You must be a registered supplier to access payouts.');
        return;
      }

      // User confirmed as supplier

      const [payoutsData, paymentMethodsData, statsData] = await Promise.all([
        payoutsService.getPayouts(user.id),
        payoutsService.getPaymentMethods(user.id),
        payoutsService.getPayoutStats(user.id)
      ]);

      setPayouts(payoutsData);
      setPaymentMethods(paymentMethodsData);
      setStats(statsData);
    } catch (error) {
      // Error fetching payouts data
      setErrorMessage('Failed to load payouts data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter payout history based on selected period
  const getFilteredPayoutHistory = () => {
    if (selectedPeriod === 'all') {
      return payouts; // Show all payouts
    }
    
    const daysAgo = parseInt(selectedPeriod.replace('d', '').replace('y', '365'));
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    
    return payouts.filter(payout => {
      const payoutDate = new Date(payout.created_at);
      return payoutDate >= cutoffDate;
    });
  };

  const filteredPayoutHistory = getFilteredPayoutHistory();

  const handleRequestPayout = async () => {
    if (!user?.id) {
      setErrorMessage('User not authenticated.');
      return;
    }

    if (!payoutAmount || isNaN(Number(payoutAmount)) || Number(payoutAmount) <= 0) {
      setErrorMessage('Please enter a valid payout amount.');
      return;
    }
    
    if (!payoutMethod) {
      setErrorMessage('Please select a payment method.');
      return;
    }

    // Check if payout amount exceeds available balance
    const requestedAmount = Number(payoutAmount);
    if (requestedAmount > stats.availableBalance) {
      setErrorMessage(`Insufficient balance. Available balance: ${payoutsService.formatCurrency(stats.availableBalance, currentCurrency)}. Requested: ${payoutsService.formatCurrency(requestedAmount, currentCurrency)}.`);
      return;
    }

    // Check if user has any payment methods
    if (paymentMethods.length === 0) {
      setErrorMessage('Please add a payment method before requesting a payout.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      // Requesting payout

      const success = await payoutsService.createPayout(user.id, requestedAmount, payoutMethod);
      if (success) {
        setShowRequestPayout(false);
        setSuccessMessage('Payout request submitted successfully!');
        setPayoutAmount('');
        setPayoutMethod('');
        await fetchPayoutsData(); // Refresh data
      } else {
        setErrorMessage('Failed to submit payout request. Please try again.');
      }
    } catch (error) {
      // Error requesting payout
      setErrorMessage('An error occurred while submitting the payout request.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['ID', 'Amount', 'Method', 'Status', 'Date', 'Reference'],
      ...payouts.map(payout => [
        payout.reference,
        payoutsService.formatCurrency(payout.amount, currentCurrency),
        payout.bank_account ? 'Bank Transfer' : 'Unknown',
        payout.status,
        new Date(payout.created_at).toLocaleDateString(),
        payout.reference
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccessMessage('Payout history exported successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddPaymentMethod = async () => {
    if (!user?.id) {
      setErrorMessage('User not authenticated.');
      return;
    }

    if (!newPaymentMethod.type || !newPaymentMethod.name || !newPaymentMethod.account) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    try {
      const success = await payoutsService.addPaymentMethod(user.id, {
        type: newPaymentMethod.type as 'BANK_TRANSFER' | 'PAYPAL' | 'CREDIT_CARD',
        name: newPaymentMethod.name,
        account_details: newPaymentMethod.account,
        is_default: newPaymentMethod.isDefault
      });

      if (success) {
        setErrorMessage(null);
        setShowAddPaymentMethod(false);
        setSuccessMessage('Payment method added successfully!');
        setNewPaymentMethod({ type: '', name: '', account: '', isDefault: false });
        await fetchPayoutsData(); // Refresh data
      } else {
        setErrorMessage('Failed to add payment method. Please try again.');
      }
    } catch (error) {
      // Error adding payment method
      setErrorMessage('An error occurred while adding the payment method.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    if (!user?.id) {
      setErrorMessage('User not authenticated.');
      return;
    }

    setLoading(true);
    try {
      const success = await payoutsService.setDefaultPaymentMethod(user.id, methodId);
      if (success) {
        setSuccessMessage('Default payment method updated successfully!');
        await fetchPayoutsData(); // Refresh data
      } else {
        setErrorMessage('Failed to update default payment method. Please try again.');
      }
    } catch (error) {
      // Error setting default payment method
      setErrorMessage('An error occurred while updating the default payment method.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setEditingPaymentMethod(method);
    setNewPaymentMethod({
      type: method.type,
      name: method.name,
      account: method.account_details,
      isDefault: method.is_default
    });
    setShowEditPaymentMethod(true);
  };

  const handleUpdatePaymentMethod = async () => {
    if (!user?.id || !editingPaymentMethod) {
      setErrorMessage('User not authenticated or no payment method selected.');
      return;
    }

    if (!newPaymentMethod.type || !newPaymentMethod.name || !newPaymentMethod.account) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    try {
      const success = await payoutsService.updatePaymentMethod(user.id, editingPaymentMethod.id, {
        type: newPaymentMethod.type as 'BANK_TRANSFER' | 'PAYPAL' | 'CREDIT_CARD',
        name: newPaymentMethod.name,
        account_details: newPaymentMethod.account,
        is_default: newPaymentMethod.isDefault
      });

      if (success) {
        setErrorMessage(null);
        setShowEditPaymentMethod(false);
        setEditingPaymentMethod(null);
        setSuccessMessage('Payment method updated successfully!');
        setNewPaymentMethod({ type: '', name: '', account: '', isDefault: false });
        await fetchPayoutsData(); // Refresh data
      } else {
        setErrorMessage('Failed to update payment method. Please try again.');
      }
    } catch (error) {
      // Error updating payment method
      setErrorMessage('An error occurred while updating the payment method.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleDeletePaymentMethod = (method: PaymentMethod) => {
    setDeletingPaymentMethod(method);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePaymentMethod = async () => {
    if (!user?.id || !deletingPaymentMethod) {
      setErrorMessage('User not authenticated or no payment method selected.');
      return;
    }

    setLoading(true);
    try {
      const success = await payoutsService.deletePaymentMethod(user.id, deletingPaymentMethod.id);
      if (success) {
        setSuccessMessage('Payment method deleted successfully!');
        setShowDeleteConfirm(false);
        setDeletingPaymentMethod(null);
        await fetchPayoutsData(); // Refresh data
      } else {
        setErrorMessage('Failed to delete payment method. Please try again.');
      }
    } catch (error) {
      // Error deleting payment method
      setErrorMessage('An error occurred while deleting the payment method.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Payouts
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage your earnings and payment methods
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={() => setShowRequestPayout(true)}
                disabled={stats.availableBalance <= 0 || paymentMethods.length === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  stats.availableBalance <= 0 || paymentMethods.length === 0
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
                title={
                  stats.availableBalance <= 0 
                    ? 'No available balance for payout'
                    : paymentMethods.length === 0
                    ? 'Add a payment method first'
                    : 'Request payout'
                }
              >
                <Plus className="w-4 h-4" />
                Request Payout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Available Balance
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {payoutsService.formatCurrency(stats.availableBalance, currentCurrency)}
                </p>
                <div className="flex items-center mt-2">
                  {stats.thisPeriodChange >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${stats.thisPeriodChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats.thisPeriodChange >= 0 ? '+' : ''}{payoutsService.formatCurrency(stats.thisPeriodChange)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    this period
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {payoutsService.formatCurrency(stats.totalEarnings, currentCurrency)}
                </p>
                <div className="flex items-center mt-2">
                  {stats.thisMonthChange >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${stats.thisMonthChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats.thisMonthChange >= 0 ? '+' : ''}{payoutsService.formatCurrency(stats.thisMonthChange, currentCurrency)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    this month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Payouts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {payoutsService.formatCurrency(stats.pendingPayouts, currentCurrency)}
                </p>
                <div className="flex items-center mt-2">
                  {stats.thisPeriodChange >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${stats.thisPeriodChange >= 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats.thisPeriodChange >= 0 ? '+' : ''}{payoutsService.formatCurrency(stats.thisPeriodChange)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    this period
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {payoutsService.formatCurrency(stats.thisMonthEarnings, currentCurrency)}
                </p>
                <div className="flex items-center mt-2">
                  {stats.thisMonthChange >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-purple-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${stats.thisMonthChange >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats.thisMonthChange >= 0 ? '+' : ''}{payoutsService.formatCurrency(stats.thisMonthChange)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payout History */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payout History
                </h2>
                <div className="relative">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="appearance-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                  >
                    <option value="all">All Time</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredPayoutHistory.map((payout) => {
                  const status = statusConfig[payout.status.toLowerCase() as keyof typeof statusConfig];
                  const StatusIcon = status?.icon || Clock;
                  const methodIcon = payout.bank_account ? Building2 : CreditCard;
                  
                  return (
                    <div key={payout.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                            {React.createElement(methodIcon, { className: "w-5 h-5 text-primary-600 dark:text-primary-400" })}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{payout.reference}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {payout.bank_account ? 'Bank Transfer' : 'Unknown Method'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {payoutsService.formatCurrency(payout.amount, currentCurrency)}
                        </p>
                        <div className="flex items-center justify-end mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status?.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {payoutsService.getStatusLabel(payout.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredPayoutHistory.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No payouts found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No payouts match your current filters
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Methods
              </h2>
              <button 
                onClick={() => setShowAddPaymentMethod(true)}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
              >
                Add New
              </button>
            </div>
            
            <div className="space-y-4">
              {paymentMethods.map((method) => {
                const methodIcon = method.type === 'BANK_TRANSFER' ? Building2 : CreditCard;
                
                return (
                  <div key={method.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          {React.createElement(methodIcon, { className: "w-4 h-4 text-gray-600 dark:text-gray-400" })}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{method.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{method.account_details}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {method.is_default ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Default
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefault(method.id)}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
                          >
                            Set as Default
                          </button>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => handleEditPaymentMethod(method)}
                            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            title="Edit payment method"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePaymentMethod(method)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete payment method"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {paymentMethods.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No payment methods
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Add a payment method to receive payouts
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request Payout Modal */}
        {showRequestPayout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Request Payout
                  </h2>
                  <button
                    onClick={() => setShowRequestPayout(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {errorMessage && (
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm">
                    {errorMessage}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    max={stats.availableBalance}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Available balance: {payoutsService.formatCurrency(stats.availableBalance, currentCurrency)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={payoutMethod}
                    onChange={e => setPayoutMethod(e.target.value)}
                  >
                    <option value="">Select payment method</option>
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.name} - {method.account_details}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowRequestPayout(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRequestPayout}
                    disabled={!payoutAmount || Number(payoutAmount) <= 0 || Number(payoutAmount) > stats.availableBalance || !payoutMethod}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !payoutAmount || Number(payoutAmount) <= 0 || Number(payoutAmount) > stats.availableBalance || !payoutMethod
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}>
                    Request Payout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Payment Method Modal */}
        {showEditPaymentMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Edit Payment Method
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditPaymentMethod(false);
                      setEditingPaymentMethod(null);
                      setNewPaymentMethod({ type: '', name: '', account: '', isDefault: false });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {errorMessage && (
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm">
                    {errorMessage}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Method Type
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={newPaymentMethod.type}
                    onChange={e => setNewPaymentMethod(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="">Select method type</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Method Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter method name (e.g., Bank of America, PayPal)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={newPaymentMethod.name}
                    onChange={e => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Details
                  </label>
                  <input
                    type="text"
                    placeholder={newPaymentMethod.type === 'BANK_TRANSFER' ? 'e.g., 1234567890, 1234-5678-9012-3456' : 'e.g., kevin.mar@email.com'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={newPaymentMethod.account}
                    onChange={e => setNewPaymentMethod(prev => ({ ...prev, account: e.target.value }))}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefaultEdit"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={newPaymentMethod.isDefault}
                    onChange={e => setNewPaymentMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                  />
                  <label htmlFor="isDefaultEdit" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Set as default payment method
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditPaymentMethod(false);
                      setEditingPaymentMethod(null);
                      setNewPaymentMethod({ type: '', name: '', account: '', isDefault: false });
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdatePaymentMethod}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                    Update Method
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Payment Method Modal */}
        {showAddPaymentMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add New Payment Method
                  </h2>
                  <button
                    onClick={() => setShowAddPaymentMethod(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {errorMessage && (
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm">
                    {errorMessage}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Method Type
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={newPaymentMethod.type}
                    onChange={e => setNewPaymentMethod(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="">Select method type</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Method Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter method name (e.g., Bank of America, PayPal)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={newPaymentMethod.name}
                    onChange={e => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Details
                  </label>
                  <input
                    type="text"
                    placeholder={newPaymentMethod.type === 'BANK_TRANSFER' ? 'e.g., 1234567890, 1234-5678-9012-3456' : 'e.g., kevin.mar@email.com'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={newPaymentMethod.account}
                    onChange={e => setNewPaymentMethod(prev => ({ ...prev, account: e.target.value }))}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={newPaymentMethod.isDefault}
                    onChange={e => setNewPaymentMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Set as default payment method
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowAddPaymentMethod(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddPaymentMethod}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                    Add Method
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deletingPaymentMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Delete Payment Method
                  </h2>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletingPaymentMethod(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Are you sure you want to delete this payment method?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {deletingPaymentMethod.name} - {deletingPaymentMethod.account_details}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> This action cannot be undone. You'll need to add this payment method again if you want to use it later.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletingPaymentMethod(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeletePaymentMethod}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                    Delete Method
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-2 hover:bg-green-600 rounded-full p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {errorMessage}
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-2 hover:bg-red-600 rounded-full p-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 
 
 
 
 
 