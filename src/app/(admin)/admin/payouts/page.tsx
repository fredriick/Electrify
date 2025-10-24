'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Filter,
  Download,
  Search,
  Calendar,
  User,
  Building2,
  CreditCard,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getSupabaseClient } from '@/lib/auth';

interface Payout {
  id: string;
  supplier_id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  reference: string;
  bank_account?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  supplier?: {
    company_name: string;
    email: string;
    phone?: string;
  };
  payment_method?: {
    type: string;
    name: string;
    account_details: string;
  };
}

interface PayoutStats {
  totalPending: number;
  totalProcessed: number;
  totalFailed: number;
  totalAmount: number;
  pendingAmount: number;
  processedAmount: number;
  failedAmount: number;
  thisMonthPayouts: number;
  thisMonthAmount: number;
}

const statusConfig = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/10'
  },
  PROCESSED: {
    label: 'Processed',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/10'
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/10'
  }
};

export default function AdminPayoutsPage() {
  const { user } = useAuth();
  const { currentCurrency, formatCurrency } = useCurrency();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats>({
    totalPending: 0,
    totalProcessed: 0,
    totalFailed: 0,
    totalAmount: 0,
    pendingAmount: 0,
    processedAmount: 0,
    failedAmount: 0,
    thisMonthPayouts: 0,
    thisMonthAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showPayoutDetails, setShowPayoutDetails] = useState(false);
  const [processingPayout, setProcessingPayout] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPayoutsData();
  }, []);

  const fetchPayoutsData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const supabaseClient = getSupabaseClient();
      if (!supabaseClient) {
        setErrorMessage('Database connection error. Please try again.');
        return;
      }

      // Fetch payouts with supplier and payment method details
      const { data: payoutsData, error: payoutsError } = await supabaseClient
        .from('payouts')
        .select(`
          *,
          suppliers!inner(
            company_name,
            email,
            phone
          ),
          payment_methods(
            type,
            name,
            account_details
          )
        `)
        .order('created_at', { ascending: false });

      if (payoutsError) {
        console.error('❌ Error fetching payouts:', payoutsError);
        setErrorMessage('Failed to load payouts data.');
        return;
      }

      setPayouts(payoutsData || []);

      // Calculate stats
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const statsData = (payoutsData || []).reduce((acc: any, payout: any) => {
        const amount = payout.amount || 0;
        const isThisMonth = new Date(payout.created_at) >= thisMonthStart;

        acc.totalAmount += amount;
        acc[`${payout.status.toLowerCase()}Amount`] += amount;
        acc[`total${payout.status.charAt(0) + payout.status.slice(1).toLowerCase()}`] += 1;

        if (isThisMonth) {
          acc.thisMonthPayouts += 1;
          acc.thisMonthAmount += amount;
        }

        return acc;
      }, {
        totalPending: 0,
        totalProcessed: 0,
        totalFailed: 0,
        totalAmount: 0,
        pendingAmount: 0,
        processedAmount: 0,
        failedAmount: 0,
        thisMonthPayouts: 0,
        thisMonthAmount: 0
      });

      setStats(statsData);
    } catch (error) {
      console.error('❌ Error fetching payouts data:', error);
      setErrorMessage('Failed to load payouts data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayouts = payouts.filter(payout => {
    const matchesStatus = selectedStatus === 'all' || payout.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      payout.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.supplier?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.supplier?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleProcessPayout = async (payoutId: string, action: 'approve' | 'reject') => {
    if (!user?.id) return;

    setProcessingPayout(payoutId);
    try {
      const supabaseClient = getSupabaseClient();
      if (!supabaseClient) {
        setErrorMessage('Database connection error. Please try again.');
        return;
      }

      const newStatus = action === 'approve' ? 'PROCESSED' : 'FAILED';
      const processedAt = new Date().toISOString();

      const { error } = await supabaseClient
        .from('payouts')
        .update({
          status: newStatus,
          processed_at: processedAt
        })
        .eq('id', payoutId);

      if (error) {
        console.error('❌ Error processing payout:', error);
        setErrorMessage(`Failed to ${action} payout. Please try again.`);
        return;
      }

      setSuccessMessage(`Payout ${action}d successfully!`);
      await fetchPayoutsData(); // Refresh data
    } catch (error) {
      console.error('❌ Error processing payout:', error);
      setErrorMessage(`An error occurred while ${action}ing the payout.`);
    } finally {
      setProcessingPayout(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleViewPayout = (payout: Payout) => {
    setSelectedPayout(payout);
    setShowPayoutDetails(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Reference', 'Supplier', 'Amount', 'Status', 'Payment Method', 'Created At', 'Processed At'],
      ...filteredPayouts.map(payout => [
        payout.reference,
        payout.supplier?.company_name || 'Unknown',
        formatCurrency(payout.amount, currentCurrency),
        payout.status,
        payout.payment_method?.name || 'Unknown',
        new Date(payout.created_at).toLocaleDateString(),
        payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-payouts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccessMessage('Payouts data exported successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payout Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Process and manage seller payouts
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
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Payouts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalPending}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatCurrency(stats.pendingAmount, currentCurrency)}
              </p>
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
                Processed Payouts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalProcessed}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatCurrency(stats.processedAmount, currentCurrency)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Failed Payouts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalFailed}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatCurrency(stats.failedAmount, currentCurrency)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
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
                {stats.thisMonthPayouts}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatCurrency(stats.thisMonthAmount, currentCurrency)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by reference, supplier, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSED">Processed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayouts.map((payout) => {
                const status = statusConfig[payout.status as keyof typeof statusConfig];
                const StatusIcon = status?.icon || Clock;
                
                return (
                  <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payout.reference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payout.supplier?.company_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payout.supplier?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(payout.amount, currentCurrency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payout.payment_method?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payout.payment_method?.account_details || 'No details'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status?.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewPayout(payout)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payout.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleProcessPayout(payout.id, 'approve')}
                              disabled={processingPayout === payout.id}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                              title="Approve payout"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleProcessPayout(payout.id, 'reject')}
                              disabled={processingPayout === payout.id}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                              title="Reject payout"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPayouts.length === 0 && (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No payouts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No payouts match your current filters
            </p>
          </div>
        )}
      </div>

      {/* Payout Details Modal */}
      {showPayoutDetails && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Payout Details
                </h2>
                <button
                  onClick={() => setShowPayoutDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Payout Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Payout Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPayout.reference}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {formatCurrency(selectedPayout.amount, currentCurrency)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusConfig[selectedPayout.status as keyof typeof statusConfig]?.color
                        }`}>
                          {statusConfig[selectedPayout.status as keyof typeof statusConfig]?.label}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedPayout.created_at).toLocaleString()}
                      </p>
                    </div>
                    {selectedPayout.processed_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Processed</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedPayout.processed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Supplier Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPayout.supplier?.company_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPayout.supplier?.email || 'No email'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPayout.supplier?.phone || 'No phone'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Payment Method
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                      {selectedPayout.payment_method?.type === 'BANK_TRANSFER' ? (
                        <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedPayout.payment_method?.name || 'Unknown Method'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedPayout.payment_method?.account_details || 'No details'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions for Pending Payouts */}
              {selectedPayout.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowPayoutDetails(false);
                      handleProcessPayout(selectedPayout.id, 'reject');
                    }}
                    disabled={processingPayout === selectedPayout.id}
                    className="px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    Reject Payout
                  </button>
                  <button
                    onClick={() => {
                      setShowPayoutDetails(false);
                      handleProcessPayout(selectedPayout.id, 'approve');
                    }}
                    disabled={processingPayout === selectedPayout.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Approve Payout
                  </button>
                </div>
              )}
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
  );
}
