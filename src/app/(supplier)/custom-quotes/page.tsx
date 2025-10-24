'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
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
  RefreshCw
} from 'lucide-react';

interface CustomQuote {
  id: string;
  order_id: string | null;
  customer_id: string;
  supplier_id: string | null;
  requested_amount: number;
  quoted_amount: number | null;
  final_amount: number | null;
  status: 'pending' | 'quoted' | 'approved' | 'rejected';
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

export default function CustomQuotesPage() {
  const { user, profile } = useAuth();
  const { formatCurrency } = useCurrency();
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuote, setEditingQuote] = useState<string | null>(null);
  const [quotedAmount, setQuotedAmount] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Fetch custom quotes
  const fetchQuotes = async () => {
    if (!user) return;
    
    try {
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
      
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [user]);

  // Handle quote submission
  const handleQuoteSubmission = async (quoteId: string) => {
    if (!quotedAmount || quotedAmount <= 0) {
      alert('Please enter a valid quote amount');
      return;
    }
    
    try {
      setSaving(true);
      const { getSupabaseClient } = await import('@/lib/auth');
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('custom_installation_quotes')
        .update({
          quoted_amount: quotedAmount,
          notes: quoteNotes,
          status: 'quoted',
          quoted_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);
      
      if (error) {
        console.error('Error updating quote:', error);
        alert('Failed to submit quote. Please try again.');
        return;
      }
      
      // Refresh quotes
      await fetchQuotes();
      
      // Reset form
      setQuotedAmount(0);
      setQuoteNotes('');
      
      alert('Quote submitted successfully!');
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Failed to submit quote. Please try again.');
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
          notes: quoteNotes || 'Quote rejected',
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
      
      // Reset form
      setQuoteNotes('');
      
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
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'quoted':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading custom quotes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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

        {quotes.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Quotes</h3>
            <p className="text-gray-600">No custom installation quote requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Customer Email</p>
                    <p className="text-sm text-gray-600">{quote.customer?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Requested Amount</p>
                    <p className="text-sm text-gray-600">
                      {quote.requested_amount > 0 ? formatCurrency(quote.requested_amount) : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Quoted Amount</p>
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
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Customer Requirements</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {quote.customer_notes || 'No requirements specified'}
                  </p>
                </div>

                {quote.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {quote.notes}
                    </p>
                  </div>
                )}

                {quote.status === 'pending' && (
                  <div className="border-t pt-4">
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
                          placeholder="Enter your quote amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (Optional)
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
                          onClick={() => handleQuoteSubmission(quote.id)}
                          disabled={saving || !quotedAmount || quotedAmount <= 0}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <DollarSign className="w-4 h-4" />
                          )}
                          Submit Quote
                        </button>
                        <button
                          onClick={() => handleQuoteRejection(quote.id)}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject Quote
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {quote.status === 'quoted' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Quote submitted and waiting for customer approval</span>
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
    </DashboardLayout>
  );
}
