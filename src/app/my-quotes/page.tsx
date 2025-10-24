'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  MapPin,
  Calendar,
  Loader2,
  RefreshCw,
  Eye,
  ShoppingCart,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';
import Link from 'next/link';

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
  supplier: {
    company_name: string;
    first_name: string;
    last_name: string;
  };
}

export default function MyQuotesPage() {
  const { user, profile } = useAuth();
  const { formatCurrency } = useCurrency();
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch customer's custom quotes
  const fetchQuotes = async () => {
    if (!user || !profile) return;
    
    // Don't show loading if we already have quotes (prevents unnecessary loading on tab return)
    if (quotes.length === 0) {
      setLoading(true);
    }
    
    try {
      const { getSupabaseClient } = await import('@/lib/auth');
      const supabase = getSupabaseClient();
      
      
      // Query with proper RLS handling
      const { data, error } = await supabase
        .from('custom_installation_quotes')
        .select(`
          *,
          supplier:suppliers!supplier_id (
            company_name,
            first_name,
            last_name
          )
        `)
        .eq('customer_id', profile.id)
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
  }, [user?.id, profile?.id]);

  // Handle quote approval and create pending order
  const handleQuoteApproval = async (quoteId: string) => {
    if (!confirm('Are you sure you want to approve this quote? A pending order will be created for you to complete later.')) return;
    
    try {
      const { getSupabaseClient } = await import('@/lib/auth');
      const supabase = getSupabaseClient();
      
      // Get the approved quote details
      const approvedQuote = quotes.find(q => q.id === quoteId);
      if (!approvedQuote) {
        alert('Quote not found. Please try again.');
        return;
      }
      
      // Create a pending order with the approved installation quote
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: `ORD-${Date.now()}`,
          user_id: user?.id,
          customer_id: profile?.id,
          status: 'PENDING',
          subtotal: 0, // Will be updated when products are added
          tax_amount: 0,
          shipping_amount: 0,
          installation_amount: approvedQuote.quoted_amount || 0,
          total_amount: approvedQuote.quoted_amount || 0,
          shipping_address: JSON.stringify({
            first_name: profile?.first_name || 'Customer',
            last_name: profile?.last_name || 'Name',
            address_line_1: 'To be provided',
            city: 'To be provided',
            state: 'To be provided',
            postal_code: 'To be provided',
            country: 'To be provided'
          }),
          billing_address: JSON.stringify({
            first_name: profile?.first_name || 'Customer',
            last_name: profile?.last_name || 'Name',
            address_line_1: 'To be provided',
            city: 'To be provided',
            state: 'To be provided',
            postal_code: 'To be provided',
            country: 'To be provided'
          }),
          payment_status: 'PENDING'
        })
        .select()
        .single();
      
      
      if (orderError) {
        console.error('Error creating pending order:', orderError);
        alert(`Failed to create pending order: ${orderError.message}. Please try again.`);
        return;
      }
      
      // Update the quote to link it to the order
      const { data: updateData, error: quoteError } = await supabase
        .from('custom_installation_quotes')
        .update({
          order_id: orderData.id,
          status: 'approved',
          approved_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .select();
      
      
      if (quoteError) {
        console.error('Error updating quote:', quoteError);
        alert('Failed to link quote to order. Please try again.');
        return;
      }
      
      // Refresh quotes
      await fetchQuotes();
      
      alert(`Quote approved! A pending order has been created. You can continue shopping and complete your order later from the "My Orders" page.`);
      
      // Optionally redirect to orders page
      if (confirm('Would you like to view your pending orders now?')) {
        window.location.href = '/my-orders';
      }
    } catch (error) {
      console.error('Error approving quote:', error);
      alert('Failed to approve quote. Please try again.');
    }
  };

  // Handle quote rejection
  const handleQuoteRejection = async (quoteId: string) => {
    if (!confirm('Are you sure you want to reject this quote?')) return;
    
    try {
      const { getSupabaseClient } = await import('@/lib/auth');
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('custom_installation_quotes')
        .update({
          status: 'rejected',
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
      
      alert('Quote rejected successfully!');
    } catch (error) {
      console.error('Error rejecting quote:', error);
      alert('Failed to reject quote. Please try again.');
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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending_admin_assignment':
        return 'Admin is reviewing your request and will provide a quote';
      case 'pending':
        return 'Waiting for supplier to provide quote';
      case 'quoted':
        return 'Quote received - please review and approve';
      case 'approved':
        return 'Quote approved - you can proceed with payment';
      case 'rejected':
        return 'Quote rejected';
      default:
        return 'Unknown status';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading your quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader products={[]} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back to Orders Button */}
        <Link
          href="/my-orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Custom Quotes</h1>
            <p className="text-gray-600">View and manage your custom installation quote requests</p>
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
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Custom Quotes</h3>
            <p className="text-gray-600 mb-6">You haven't requested any custom installation quotes yet.</p>
            
            <a
              href="/checkout"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ShoppingCart className="w-5 h-5" />
              Go to Checkout
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => (
              <div key={quote.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(quote.status)}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Quote Request #{quote.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Submitted on {new Date(quote.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(quote.status)} flex-shrink-0 self-start sm:self-auto`}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Supplier Information</h4>
                    <p className="text-sm text-gray-600">
                      {quote.supplier_id ? (
                        quote.supplier?.company_name || 
                        `${quote.supplier?.first_name} ${quote.supplier?.last_name}` || 
                        'Unknown Supplier'
                      ) : (
                        'No supplier assigned yet'
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Quote Amount</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {quote.quoted_amount ? formatCurrency(quote.quoted_amount) : 'Not quoted yet'}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Your Requirements</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {quote.customer_notes || 'No requirements specified'}
                    </p>
                  </div>
                </div>

                {quote.notes && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Supplier Notes</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {quote.notes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getStatusIcon(quote.status)}
                      <span>{getStatusMessage(quote.status)}</span>
                    </div>
                    
                    {quote.status === 'quoted' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleQuoteApproval(quote.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve Quote
                        </button>
                        <button
                          onClick={() => handleQuoteRejection(quote.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject Quote
                        </button>
                      </div>
                    )}
                    
                    {quote.status === 'approved' && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Ready for payment</span>
                        </div>
                        <button
                          onClick={async () => {
                            
                            if (quote.order_id) {
                              window.location.href = `/checkout?order=${quote.order_id}`;
                            } else {
                              
                              // If quote is approved but has no order_id, create one now
                              if (quote.status === 'approved') {
                                try {
                                  const { getSupabaseClient } = await import('@/lib/auth');
                                  const supabase = getSupabaseClient();
                                  
                                  // Create the missing order
                                  const { data: orderData, error: orderError } = await supabase
                                    .from('orders')
                                    .insert({
                                      order_number: `ORD-${Date.now()}`,
                                      user_id: user?.id,
                                      customer_id: profile?.id,
                                      status: 'PENDING',
                                      subtotal: 0,
                                      tax_amount: 0,
                                      shipping_amount: 0,
                                      installation_amount: quote.quoted_amount || 0,
                                      total_amount: quote.quoted_amount || 0,
                                      shipping_address: JSON.stringify({
                                        first_name: profile?.first_name || 'Customer',
                                        last_name: profile?.last_name || 'Name',
                                        address_line_1: 'To be provided',
                                        city: 'To be provided',
                                        state: 'To be provided',
                                        postal_code: 'To be provided',
                                        country: 'To be provided'
                                      }),
                                      billing_address: JSON.stringify({
                                        first_name: profile?.first_name || 'Customer',
                                        last_name: profile?.last_name || 'Name',
                                        address_line_1: 'To be provided',
                                        city: 'To be provided',
                                        state: 'To be provided',
                                        postal_code: 'To be provided',
                                        country: 'To be provided'
                                      }),
                                      payment_status: 'PENDING'
                                    })
                                    .select()
                                    .single();
                                  
                                  if (orderError) {
                                    // Error creating missing order
                                    alert(`Failed to create order: ${orderError.message}. Please contact support.`);
                                    return;
                                  }
                                  
                                  // Link the quote to the new order
                                  const { error: linkError } = await supabase
                                    .from('custom_installation_quotes')
                                    .update({ order_id: orderData.id })
                                    .eq('id', quote.id);
                                  
                                  if (linkError) {
                                    // Error linking quote to order
                                    alert(`Order created but failed to link to quote. Please contact support.`);
                                    return;
                                  }
                                  
                                  alert('Order created successfully! Redirecting to checkout...');
                                  window.location.href = `/checkout?order=${orderData.id}`;
                                  return;
                                  
                                } catch (error) {
                                  // Error creating missing order
                                  alert(`Error creating order: ${error}. Please contact support.`);
                                  return;
                                }
                              }
                              
                              
                              // Try to find the order by customer and installation amount
                              try {
                                const { getSupabaseClient } = await import('@/lib/auth');
                                const supabase = getSupabaseClient();
                                
                                
                                // Try to find pending orders (which would include installation quote orders)
                                // First try with user_id (which should match the auth.uid())
                                let { data: orders, error } = await supabase
                                  .from('orders')
                                  .select('id, order_number, installation_amount, status, customer_id, user_id')
                                  .eq('user_id', user?.id)
                                  .eq('status', 'PENDING')
                                  .order('created_at', { ascending: false })
                                  .limit(5);
                                
                                // If no results, try with customer_id as fallback
                                if (!orders || orders.length === 0) {
                                  const { data: customerOrders, error: customerError } = await supabase
                                    .from('orders')
                                    .select('id, order_number, installation_amount, status, customer_id, user_id')
                                    .eq('customer_id', profile?.id)
                                    .eq('status', 'PENDING')
                                    .order('created_at', { ascending: false })
                                    .limit(5);
                                  
                                  orders = customerOrders;
                                  error = customerError;
                                }
                                
                                
                                if (error) {
                                  // Error searching for orders
                                  alert(`Error searching for orders: ${error.message}. Please contact support.`);
                                  return;
                                }
                                
                                if (orders && orders.length > 0) {
                                  // Try to find exact match first, then any match
                                  const exactMatch = orders.find((order: any) => 
                                    order.installation_amount === quote.quoted_amount
                                  );
                                  
                                  const orderToUse = exactMatch || orders[0];
                                  window.location.href = `/checkout?order=${orderToUse.id}`;
                                } else {
                                  
                                  // Debug: Search for any orders for this user
                                  const { data: allOrders, error: allOrdersError } = await supabase
                                    .from('orders')
                                    .select('id, order_number, installation_amount, status, customer_id, user_id, created_at')
                                    .eq('user_id', user?.id)
                                    .order('created_at', { ascending: false })
                                    .limit(10);
                                  
                                  
                                  if (allOrders && allOrders.length > 0) {
                                    
                                    // Try to find any order that might be related (even if status doesn't match)
                                    const relatedOrder = allOrders.find((order: any) => 
                                      order.installation_amount === quote.quoted_amount
                                    );
                                    
                                    if (relatedOrder) {
                                      alert(`Found a related order (${relatedOrder.status}) with matching installation amount. Redirecting to checkout...`);
                                      window.location.href = `/checkout?order=${relatedOrder.id}`;
                                    } else {
                                      alert(`Found ${allOrders.length} orders but none match the installation amount (${quote.quoted_amount}). Please contact support with this information.`);
                                    }
                                  } else {
                                    alert(`No orders found for quote ${quote.id}. The quote may not have been properly approved. Please try approving the quote again or contact support.`);
                                  }
                                }
                              } catch (error) {
                                console.error('Error searching for order:', error);
                                alert(`Error finding order for quote ${quote.id}. Please contact support.`);
                              }
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Continue Order
                        </button>
                      </div>
                    )}
                    
                    {quote.status === 'rejected' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Quote rejected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
