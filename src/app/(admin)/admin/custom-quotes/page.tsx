'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  User,
  MapPin,
  Calendar,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';

interface CustomQuote {
  id: string;
  order_id: string | null;
  customer_id: string;
  supplier_id: string | null;
  requested_amount: number;
  quoted_amount: number | null;
  final_amount: number | null;
  status: 'pending_admin_assignment' | 'pending' | 'quoted' | 'approved' | 'rejected';
  notes: string | null;
  customer_notes: string | null;
  created_at: string;
  updated_at: string;
  quoted_by: string | null;
  approved_by: string | null;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AdminCustomQuotesPage() {
  const { user, profile } = useAuth();
  const { formatCurrency } = useCurrency();
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuote, setEditingQuote] = useState<string | null>(null);
  const [quotedAmount, setQuotedAmount] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch all custom quotes
  const fetchQuotes = async () => {
    try {
      console.log('🔄 Fetching quotes...');
      setLoading(true);
      const { getSupabaseClient } = await import('@/lib/auth');
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('custom_installation_quotes')
        .select(`
          *,
          customer:customers!customer_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching quotes:', error);
        return;
      }
      
      console.log('📊 Fetched quotes:', data);
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // Handle starting to edit a quote
  const handleStartEditing = (quote: CustomQuote) => {
    setEditingQuote(quote.id);
    setQuotedAmount(quote.quoted_amount || 0);
    // Only load admin notes if they exist and are not the default customer notes
    const isDefaultNotes = quote.notes && quote.notes.includes('Location:') && quote.notes.includes('Special Notes:');
    setQuoteNotes(isDefaultNotes ? '' : (quote.notes || ''));
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingQuote(null);
    setQuotedAmount(0);
    setQuoteNotes('');
  };

  // Handle quote approval with amount
  const handleQuoteApproval = async (quoteId: string) => {
    console.log('🚀 handleQuoteApproval called with:', { quoteId, quotedAmount, quoteNotes });
    
    if (!quotedAmount || quotedAmount <= 0) {
      alert('Please enter a valid quote amount');
      return;
    }
    
    try {
      setSaving(true);
      console.log('📡 Making database request...');
      const { getSupabaseClient } = await import('@/lib/auth');
      const supabase = getSupabaseClient();
      
      console.log('📝 Updating quote with data:', {
        quoted_amount: quotedAmount,
        notes: quoteNotes || null,
        status: 'quoted',
        quoted_by: user?.id,
        updated_at: new Date().toISOString()
      });
      
      const { data, error } = await supabase
        .from('custom_installation_quotes')
        .update({
          quoted_amount: quotedAmount,
          notes: quoteNotes || null, // Save admin notes or null if empty
          status: 'quoted',
          quoted_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .select();
      
      console.log('📊 Database response:', { data, error });
      
      if (error) {
        console.error('Error updating quote:', error);
        alert('Failed to approve quote. Please try again.');
        return;
      }
      
      // Even if data is empty, the update succeeded (no error)
      console.log('✅ Quote updated successfully, refreshing quotes...');
      
      // Refresh quotes
      await fetchQuotes();
      
      // Close the form and reset state
      setEditingQuote(null);
      setQuotedAmount(0);
      setQuoteNotes('');
      
      alert('Quote approved and sent to customer!');
    } catch (error) {
      console.error('Error approving quote:', error);
      alert('Failed to approve quote. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle quote rejection
  const handleQuoteRejection = async (quoteId: string) => {
    if (!confirm('Are you sure you want to reject this quote request?')) return;
    
    try {
      setSaving(true);
      const { getSupabaseClient } = await import('@/lib/auth');
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('custom_installation_quotes')
        .update({
          status: 'rejected',
          notes: quoteNotes || 'Quote rejected by admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);
      
      if (error) {
        console.error('Error rejecting quote:', error);
        alert('Failed to reject quote. Please try again.');
        return;
      }
      
      // Refresh quotes
      await fetchQuotes();
      
      // Don't reset form - keep it populated for the current quote
      // setEditingQuote(null);
      // setQuoteNotes('');
      
      alert('Quote rejected successfully!');
    } catch (error) {
      console.error('Error rejecting quote:', error);
      alert('Failed to reject quote. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_admin_assignment':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'quoted':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_admin_assignment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'quoted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter quotes based on search and status
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchTerm === '' || 
      quote.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading custom quotes...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Installation Quotes</h1>
            <p className="text-gray-600">Manage custom installation quote requests from customers</p>
          </div>
          <button
            onClick={fetchQuotes}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or quote ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending_admin_assignment">Pending Admin</option>
                <option value="pending">Pending</option>
                <option value="quoted">Quoted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Custom Quotes</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'No quotes match your current filters.' 
                : 'No custom installation quote requests found.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <div key={quote.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(quote.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Quote Request #{quote.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <User className="w-4 h-4 inline mr-1" />
                        {quote.customer?.first_name} {quote.customer?.last_name}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                    {quote.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Customer Email</p>
                    <p className="text-sm text-gray-600">{quote.customer?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Quote Amount</p>
                    <p className="text-sm text-gray-600">
                      {quote.quoted_amount ? formatCurrency(quote.quoted_amount) : 'Not quoted yet'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Created</p>
                    <p className="text-sm text-gray-600">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Last Updated</p>
                    <p className="text-sm text-gray-600">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(quote.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Customer Requirements</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {quote.customer_notes || 'No requirements specified'}
                  </p>
                </div>

                {/* Only show admin notes for quotes that have been processed */}
                {quote.status !== 'pending_admin_assignment' && quote.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes</p>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                      {quote.notes}
                    </p>
                  </div>
                )}

                {quote.status === 'pending_admin_assignment' && (
                  <div className="border-t pt-4">
                    {editingQuote === quote.id ? (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Provide Quote</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quote Amount (₦)
                            </label>
                            <input
                              type="number"
                              value={quotedAmount}
                              onChange={(e) => setQuotedAmount(Number(e.target.value))}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter quote amount"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Admin Notes (Optional)
                            </label>
                            <textarea
                              value={quoteNotes}
                              onChange={(e) => setQuoteNotes(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                              placeholder="Add any notes about the quote (e.g., installation timeline, special requirements, etc.)"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                console.log('🔘 Approve button clicked for quote:', quote.id);
                                handleQuoteApproval(quote.id);
                              }}
                              disabled={saving || !quotedAmount || quotedAmount <= 0}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve & Send Quote
                            </button>
                            <button
                              onClick={() => handleQuoteRejection(quote.id)}
                              disabled={saving}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject Quote
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleStartEditing(quote)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Provide Quote
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {quote.status === 'quoted' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-blue-600">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">Quote sent to customer - waiting for approval</span>
                    </div>
                  </div>
                )}

                {quote.status === 'approved' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Quote approved by customer</span>
                    </div>
                  </div>
                )}

                {quote.status === 'rejected' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Quote rejected</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
