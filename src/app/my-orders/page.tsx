'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Download,
  Calendar,
  MapPin,
  DollarSign,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Wrench,
  RefreshCw
} from 'lucide-react';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseSessionClient, supabase } from '@/lib/auth';
import { useCurrency } from '@/contexts/CurrencyContext';
import { customerRefundService } from '@/lib/customerRefundService';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: {
    id: string;
    name: string;
    images: string[];
    supplier_id: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_id?: string;
  supplier_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'PENDING_INSTALLATION_QUOTE';
  total_amount: number;
  created_at: string;
  updated_at: string;
  // Enhanced cancellation metadata
  cancelled_at?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  shipping_address: string | {
    type: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
    // Custom address fields from addresses table
    company?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  payment_status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  payment_gateway?: string;
  payment_reference?: string;
  installation_required: boolean;
  installation_status?: 'pending' | 'scheduled' | 'completed';
  installation_date?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  installation_amount?: number;
  custom_installation_quote_id?: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
  // Multi-vendor shipping breakdown
  shipping_breakdown?: {
    calculations: Array<{
      supplier_id: string;
      supplier_name: string;
      shipping_amount: number;
      shipping_method: string;
      estimated_days_min: number;
      estimated_days_max: number;
      item_count: number;
      total_weight_kg: number;
      subtotal: number;
    }>;
    total_shipping_amount?: number;
    total_estimated_days_min?: number;
    total_estimated_days_max?: number;
  };
  total_shipping_amount?: number;
  // Order shipping details
  order_shipping_details?: Array<{
    id: string;
    supplier_id: string;
    shipping_amount: number;
    shipping_method: string;
    estimated_days_min: number;
    estimated_days_max: number;
    item_count: number;
    total_weight_kg: number;
    supplier?: {
      id: string;
      company_name: string;
    };
  }>;
  // Custom installation quotes with supplier info
  custom_installation_quotes?: Array<{
    id: string;
    supplier_id: string;
    status?: string;
    quoted_amount?: number;
    final_amount?: number;
    supplier?: {
      id: string;
      company_name: string;
      company_address: string;
      state: string;
      country: string;
    };
  }>;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const [refundEligibility, setRefundEligibility] = useState<Record<string, boolean>>({});
  const [refundStatuses, setRefundStatuses] = useState<Record<string, any>>({});
  const [cancelledOrderRefunds, setCancelledOrderRefunds] = useState<Record<string, any>>({});
  const [refreshingRefunds, setRefreshingRefunds] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<string | null>(null);
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [orderAddresses, setOrderAddresses] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { formatCurrency, currentCurrency } = useCurrency();

  // Fetch all products for the header
  const fetchAllProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          compare_price,
          image_url,
          images,
          category,
          brand
        `)
        .eq('is_active', true)
        .eq('is_approved', true);

      if (!productsError && productsData) {
        const transformedProducts = productsData.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          comparePrice: product.compare_price || 0,
          image: product.images?.[0] || product.image_url || '',
          category: product.category || 'Unknown',
          brand: product.brand || 'Unknown'
        }));
        setAllProducts(transformedProducts);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Check refund eligibility for orders
  useEffect(() => {
    if (orders.length > 0) {
      checkRefundEligibility();
      fetchCancelledOrderRefunds();
    }
  }, [orders]);

  const checkRefundEligibility = async () => {
    const eligibilityMap: Record<string, boolean> = {};
    const statusMap: Record<string, any> = {};
    
    // Get all existing refund requests for this customer
    let existingRefunds: any[] = [];
    try {
      existingRefunds = await customerRefundService.getCustomerRefundRequests(user?.id || '');
    } catch (error) {
      console.error('Error fetching existing refunds:', error);
    }
    
    for (const order of orders) {
      try {
        const eligibility = await customerRefundService.checkRefundEligibility(order.id.toString());
        eligibilityMap[order.id] = eligibility.canRequestRefund;
        
        // Check if there's an existing refund request for this order
        const orderRefund = existingRefunds.find(refund => refund.order_id === order.id);
        if (orderRefund) {
          statusMap[order.id] = orderRefund;
        }
        
      } catch (error) {
        console.error(`Error checking eligibility for order ${order.id}:`, error);
        eligibilityMap[order.id] = false;
      }
    }
    
    setRefundEligibility(eligibilityMap);
    setRefundStatuses(statusMap);
  };

  const fetchCancelledOrderRefunds = async (showLoading = false) => {
    if (showLoading) {
      setRefreshingRefunds(true);
    }
    
    const refundMap: Record<string, any> = {};
    
    // Get cancelled orders
    const cancelledOrders = orders.filter(order => 
      order.status?.toLowerCase() === 'cancelled' && 
      order.payment_status === 'COMPLETED'
    );
    
    
    for (const order of cancelledOrders) {
      try {
        const supabaseClient = getSupabaseSessionClient();
        
        // First check if there's a returns record (this is what admin updates)
        const { data: returnRecord, error: returnError } = await supabaseClient
          .from('returns')
          .select('*')
          .eq('order_id', order.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!returnError && returnRecord) {
          
          // Use the return record as the source of truth
          // Map return status to refund status for display
          let refundStatus = 'PENDING';
          if (returnRecord.status === 'APPROVED') {
            refundStatus = 'COMPLETED';
          } else if (returnRecord.status === 'REJECTED') {
            refundStatus = 'FAILED';
          } else if (returnRecord.status === 'PENDING') {
            refundStatus = 'PENDING';
          }
          
          // Create a refund-like object using return data
          const refundData = {
            id: returnRecord.id,
            order_id: returnRecord.order_id,
            customer_id: returnRecord.customer_id,
            amount: returnRecord.requested_amount || returnRecord.approved_amount || order.total_amount,
            currency: 'NGN',
            status: refundStatus,
            refund_reason: returnRecord.reason,
            admin_notes: returnRecord.admin_notes,
            created_at: returnRecord.created_at,
            updated_at: returnRecord.updated_at,
            processed_at: returnRecord.status === 'APPROVED' ? returnRecord.updated_at : null,
            refund_method: 'RETURN_PROCESSED'
          };
          
          refundMap[order.id] = refundData;
        } else {
          // Fallback: check refunds table if no return record exists
          const { data: refund, error: refundError } = await supabaseClient
            .from('refunds')
            .select('*')
            .eq('order_id', order.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (!refundError && refund) {
            refundMap[order.id] = refund;
          } else {
          }
        }
      } catch (error) {
      }
    }
    
    setCancelledOrderRefunds(refundMap);
    
    if (showLoading) {
      setRefreshingRefunds(false);
    }
  };

  const refreshRefundStatus = async () => {
    await fetchCancelledOrderRefunds(true);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      // First, let's check if there are any orders at all
      const supabaseClient = getSupabaseSessionClient();
      
      
      const { data: allOrders, error: allOrdersError } = await supabaseClient
        .from('orders')
        .select('id, user_id, order_number, status')
        .limit(10);
      
      // Now fetch orders for specific user (check both user_id and customer_id)
      const query = supabaseClient
        .from('orders')
        .select(`
          *,
          order_items!order_items_order_id_fkey(
            id, 
            product_id, 
            quantity, 
            unit_price, 
            total_price,
            products:products!order_items_product_id_fkey(
              id,
              name,
              images,
              supplier_id
            )
          ),
          custom_installation_quotes!custom_installation_quotes_order_id_fkey(
            id,
            supplier_id,
            status,
            quoted_amount,
            final_amount,
            supplier:suppliers!custom_installation_quotes_supplier_id_fkey(
              id,
              company_name,
              company_address,
              state,
              country
            )
          )
        `)
        .or(`user_id.eq.${user.id},customer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      
      
      if (data && data.length > 0) {
        
        data.forEach((order: any, index: number) => {
          if (order.installation_amount && order.installation_amount > 0) {
            // Order has installation amount
            
            if (order.custom_installation_quotes && order.custom_installation_quotes.length > 0) {
              order.custom_installation_quotes.forEach((quote: any, quoteIndex: number) => {
                if (quote.supplier) {
                  // Supplier found
                } else {
                  // No supplier found
                }
              });
            } else {
              // No custom installation quotes found
            }
          }
        });
      }
      
      if (data && data.length > 0) {
        data.forEach((order: any) => {
          if (order.installation_amount && order.installation_amount > 0) {
            // Order has installation amount
          }
        });
      }

      // Fetch customer profile to get address
      let customerAddress = '';
      if (data && data.length > 0) {
        const { data: customerProfile, error: profileError } = await supabaseClient
          .from('customers')
          .select('address')
          .eq('id', user.id)
          .single();
        
        if (!profileError && customerProfile?.address) {
          setCustomerAddress(customerProfile.address);
        }
      }

      if (error) {
        return;
      }

      
      
      if (data && data.length > 0) {
        const firstOrder = data[0];
        
      }

      setOrders(data as Order[]);
      
      // Load addresses for site pickup orders
      await loadOrderAddresses(data as Order[]);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  // Auto-refresh refund status for cancelled orders every 30 seconds
  useEffect(() => {
    const cancelledOrders = orders.filter(order => 
      order.status?.toLowerCase() === 'cancelled' && 
      order.payment_status === 'COMPLETED'
    );
    
    if (cancelledOrders.length > 0) {
      const refundInterval = setInterval(() => {
        fetchCancelledOrderRefunds();
      }, 30000); // Refresh refund status every 30 seconds
      
      return () => clearInterval(refundInterval);
    }
  }, [orders]);

  // Function to load addresses for site pickup orders
  const loadOrderAddresses = async (ordersList: Order[]) => {
    const addressMap: Record<string, string> = {};
    
    
    for (const order of ordersList) {
      const isSitePickup = isSitePickupOrder(order);
      
      if (isSitePickupOrder(order)) {
        // Process site pickup order
        
        if (order.order_items && order.order_items.length > 0) {
          order.order_items.forEach((item: any, itemIndex: number) => {
            // Process order item
          });
        } else {
          // No order items found
        }
        
        const address = await getOrderDisplayAddress(order);
        addressMap[order.id] = address;
        
      } else {
        // This is a regular shipping order
        
        const address = await getOrderDisplayAddress(order);
        addressMap[order.id] = address;
        
      }
    }
    
    
    setOrderAddresses(addressMap);
  };

  // Function to determine if order is site pickup
  const isSitePickupOrder = (order: Order) => {
    // Check if it's a custom installation quote order (has installation_amount)
    return order.installation_amount && order.installation_amount > 0;
  };

  // Function to get display address for order
  const getOrderDisplayAddress = async (order: Order) => {
    // For site pickup orders (custom installation quotes), show supplier address
    if (isSitePickupOrder(order)) {
        // Process site pickup order
        
        if (order.custom_installation_quotes && order.custom_installation_quotes.length > 0) {
          const firstQuote = order.custom_installation_quotes[0];
          
          // Check if we have supplier info in the quote
          if (firstQuote.supplier) {
            // Supplier found in quote
          } else if (firstQuote.supplier_id) {
            // Supplier ID found in quote, but no supplier object
          } else {
            // No supplier info found in quote
          }
        }
      
      // Check if we have custom installation quotes with supplier info
      if (order.custom_installation_quotes && order.custom_installation_quotes.length > 0) {
        const quote = order.custom_installation_quotes[0]; // Get the first quote
        const supplier = quote.supplier;
        
        if (supplier) {
          // Process supplier details
          
          // Build address parts, only including non-null/non-empty values
          const addressParts = [];
          
          if (supplier.company_name && supplier.company_name.trim()) {
            addressParts.push(supplier.company_name);
          } else {
            // company_name is null or empty
          }
          
          if (supplier.company_address && supplier.company_address.trim()) {
            addressParts.push(supplier.company_address);
          } else {
            // company_address is null or empty
          }
          
          if (supplier.state && supplier.state.trim()) {
            addressParts.push(supplier.state);
          } else {
            // state is null or empty
          }
          
          if (supplier.country && supplier.country.trim()) {
            addressParts.push(supplier.country);
          } else {
            // country is null or empty
          }
          
          // If we have at least some address info, show what we have
          if (addressParts.length > 0) {
            const finalAddress = addressParts.join(', ');
            return finalAddress;
          }
          
          // If we have supplier but no address info, show a generic message
          return 'Site Pickup - Supplier Location Available';
        } else if (quote.supplier_id) {
          // Fallback: If we have supplier_id but no supplier object, fetch it directly
          
          try {
            const supabaseClient = getSupabaseSessionClient();
            const { data: supplierData, error: supplierError } = await supabaseClient
              .from('suppliers')
              .select('id, company_name, company_address, state, country')
              .eq('id', quote.supplier_id)
              .single();
            
            if (supplierData && !supplierError) {
              const addressParts = [];
              
              if (supplierData.company_name && supplierData.company_name.trim()) {
                addressParts.push(supplierData.company_name);
              }
              
              if (supplierData.company_address && supplierData.company_address.trim()) {
                addressParts.push(supplierData.company_address);
              }
              
              if (supplierData.state && supplierData.state.trim()) {
                addressParts.push(supplierData.state);
              }
              
              if (supplierData.country && supplierData.country.trim()) {
                addressParts.push(supplierData.country);
              }
              
              if (addressParts.length > 0) {
                return addressParts.join(', ');
              }
            } else {
              // Fallback supplier fetch failed
            }
          } catch (error) {
            // Fallback supplier fetch error
          }
        } else {
          // No supplier object and no supplier_id found in quote
          
          // Try to find and assign a supplier for this quote
          try {
            const supabaseClient = getSupabaseSessionClient();
            
            // Get the supplier from multiple sources - order items, order supplier_id, or custom quotes
            let supplierId = null;
            
            // First, try to get supplier from order items (products)
            if (order.order_items && order.order_items.length > 0) {
              
              // Get supplier_id from the first order item's product
              const firstItem = order.order_items[0];
              if (firstItem.products && firstItem.products.supplier_id) {
                supplierId = firstItem.products.supplier_id;
              } else {
                // No supplier_id found in order item products
              }
            } else {
              // No order items found - trying other sources
            }
            
            // Second, try to get supplier from order's supplier_id field
            if (!supplierId && order.supplier_id) {
              supplierId = order.supplier_id;
            }
            
            // Third, try to get supplier from custom installation quotes
            if (!supplierId) {
              
              if (order.custom_installation_quotes && order.custom_installation_quotes.length > 0) {
                const quote = order.custom_installation_quotes[0];
                
                
                if (quote.supplier_id) {
                  supplierId = quote.supplier_id;
                } else if (quote.supplier && quote.supplier.id) {
                  supplierId = quote.supplier.id;
                } else {
                  // No supplier_id or supplier object found in custom installation quote
                }
              } else {
                // No custom installation quotes found
              }
            }
            
            // Fourth, try to find supplier by querying the custom_installation_quotes table directly
            if (!supplierId) {
              try {
                const { data: directQuotes, error: directQuotesError } = await supabaseClient
                  .from('custom_installation_quotes')
                  .select('id, supplier_id, supplier:suppliers(id, company_name, company_address, state, country)')
                  .eq('order_id', order.id)
                  .limit(1);
                
                if (directQuotes && directQuotes.length > 0) {
                  const directQuote = directQuotes[0];
                  
                  if (directQuote.supplier_id) {
                    supplierId = directQuote.supplier_id;
                  } else if (directQuote.supplier && directQuote.supplier.id) {
                    supplierId = directQuote.supplier.id;
                  }
                } else {
                  // No quotes found in direct query
                }
              } catch (error) {
                // Error in direct quote query
              }
            }
            
            // Fifth, try to find the correct supplier based on the order items
            if (!supplierId) {
              
              // For this specific order, we know the items should be from supplier 76f44bfe-e4ee-482c-96cc-faa91d48ada5
              // Let's check if we can find this supplier
              try {
                const { data: correctSupplier, error: correctSupplierError } = await supabaseClient
                  .from('suppliers')
                  .select('id, company_name, company_address, state, country')
                  .eq('id', '76f44bfe-e4ee-482c-96cc-faa91d48ada5')
                  .single();
                
                if (correctSupplier && !correctSupplierError) {
                  supplierId = correctSupplier.id;
                  
                  // Update the custom installation quote to use the correct supplier
                  if (order.custom_installation_quotes && order.custom_installation_quotes.length > 0) {
                    const quote = order.custom_installation_quotes[0];
                    
                    const { error: updateError } = await supabaseClient
                      .from('custom_installation_quotes')
                      .update({ supplier_id: correctSupplier.id })
                      .eq('id', quote.id);
                    
                    if (!updateError) {
                      // Successfully updated custom installation quote with correct supplier
                    } else {
                      // Failed to update custom installation quote
                    }
                  }
                } else {
                  // Correct supplier not found
                }
              } catch (error) {
                // Error finding correct supplier
              }
            }
            
            // Sixth, try to find ANY supplier in the system as a last resort
            if (!supplierId) {
              try {
                const { data: anySupplier, error: anySupplierError } = await supabaseClient
                  .from('suppliers')
                  .select('id, company_name, company_address, state, country')
                  .limit(1)
                  .single();
                
                if (anySupplier && !anySupplierError) {
                  supplierId = anySupplier.id;
                } else {
                  // No suppliers found in system
                }
              } catch (error) {
                // Error finding any supplier
              }
            }
            
            // If still no supplier, return error
            if (!supplierId) {
              // Cannot assign supplier for site pickup - no supplier found anywhere
              return 'Site Pickup - Supplier Assignment Required';
            }
            
            if (supplierId) {
              // Get the supplier details
              const { data: supplier, error: supplierError } = await supabaseClient
                .from('suppliers')
                .select('id, company_name, company_address, state, country')
                .eq('id', supplierId)
                .single();
              
              if (supplier && !supplierError) {
                
                // Update the quote with the supplier
                const { error: updateError } = await supabaseClient
                  .from('custom_installation_quotes')
                  .update({ supplier_id: supplier.id })
                  .eq('id', quote.id);
                
                if (!updateError) {
                  
                  // Return the supplier address
                  const addressParts = [];
                  
                  if (supplier.company_name && supplier.company_name.trim()) {
                    addressParts.push(supplier.company_name);
                  }
                  
                  if (supplier.company_address && supplier.company_address.trim()) {
                    addressParts.push(supplier.company_address);
                  }
                  
                  if (supplier.state && supplier.state.trim()) {
                    addressParts.push(supplier.state);
                  }
                  
                  if (supplier.country && supplier.country.trim()) {
                    addressParts.push(supplier.country);
                  }
                  
                  if (addressParts.length > 0) {
                    return addressParts.join(', ');
                  }
                } else {
                  // Failed to update quote with supplier
                }
              } else {
                // Error fetching supplier details
              }
            } else {
              // No supplier ID found to assign
            }
          } catch (error) {
            // Error finding/assigning supplier
          }
        }
      } else {
        // No custom installation quotes found for this order
      }
      
      // If no supplier info, show a more informative message
      return 'Site Pickup - Supplier Assignment Pending';
    }

    // For regular orders, show customer shipping address
    
    
    if (order.shipping_address) {
      let addressData;
      
      // Parse JSON string if needed
      if (typeof order.shipping_address === 'string') {
        try {
          addressData = JSON.parse(order.shipping_address);
        } catch (e) {
          // If it's not JSON, check if it's a proper address or just concatenated info
          if (order.shipping_address.includes('@') || order.shipping_address.includes('+')) {
            return 'N/A'; // Not a proper address
          }
          return order.shipping_address;
        }
      } else {
        addressData = order.shipping_address;
      }
      
      // Now handle the parsed address data
      if (addressData.address_line_1 && addressData.address_line_1 !== 'To be provided') {
        // Custom address from addresses table
        const address = `${addressData.address_line_1}, ${addressData.city}, ${addressData.state}`;
        return address;
      } else if (addressData.address) {
        // Profile address
        return addressData.address;
      } else if (addressData.first_name && addressData.last_name) {
        // If we only have name, email, phone - this is not a proper address
        if (addressData.email || addressData.phone) {
          return 'N/A'; // Not a proper address
        }
        const nameAddress = `${addressData.first_name} ${addressData.last_name}`;
        return nameAddress;
      }
      return 'N/A';
    }
    return 'N/A';
  };

  // Function to group order items by supplier for site pickup orders
  const getOrderItemsBySupplier = (order: Order) => {
    if (!order.items || order.items.length === 0) return [];
    
    const groupedItems: { [supplierId: string]: { supplier: any; items: any[] } } = {};
    
    order.items.forEach(item => {
      const supplierId = item.products?.supplier_id || 'unknown';
      if (!groupedItems[supplierId]) {
        groupedItems[supplierId] = {
          supplier: null, // Will be populated from custom_installation_quote.suppliers
          items: []
        };
      }
      groupedItems[supplierId].items.push(item);
    });
    
    // For site pickup orders, try to get supplier info
    if (isSitePickupOrder(order)) {
      if (order.custom_installation_quotes && order.custom_installation_quotes.length > 0) {
        const quote = order.custom_installation_quotes[0]; // Get the first quote
        if (quote.supplier) {
          // Use the supplier from custom installation quote
          Object.keys(groupedItems).forEach(supplierId => {
            groupedItems[supplierId].supplier = quote.supplier;
          });
        }
      }
    }
    
    return Object.values(groupedItems);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // Price filtering
    let matchesPrice = true;
    if (priceFilter) {
      switch (priceFilter) {
        case 'under500':
          matchesPrice = order.total_amount < 500;
          break;
        case '500-1000':
          matchesPrice = order.total_amount >= 500 && order.total_amount <= 1000;
          break;
        case '1000-5000':
          matchesPrice = order.total_amount >= 1000 && order.total_amount <= 5000;
          break;
        case 'over5000':
          matchesPrice = order.total_amount > 5000;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPrice;
  });

  const getStatusConfig = (status: string, order?: Order) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Clock };
      case 'pending_installation_quote':
        return { label: 'Installation Quote Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: Wrench };
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: CheckCircle };
      case 'processing':
        return { label: 'Processing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: Clock };
      case 'shipped':
        return { label: 'Shipped', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', icon: Truck };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle };
      case 'cancelled':
        // Enhanced cancellation status with context
        if (order && order.tracking_number) {
          // Check if order was cancelled after shipping
          const cancelledDate = order.cancelled_at ? new Date(order.cancelled_at) : null;
          const createdDate = new Date(order.created_at);
          
          if (cancelledDate) {
            const timeDiff = cancelledDate.getTime() - createdDate.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            if (hoursDiff > 1) {
              return { 
                label: 'Cancelled (After Shipping)', 
                color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
                icon: AlertCircle 
              };
            }
          }
        }
        return { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: AlertCircle };
      default:
        return { label: status || 'Unknown', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: Package };
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    setDownloadingInvoice(orderId);
    try {
      const supabaseClient = getSupabaseSessionClient();
      const { data, error } = await supabaseClient
        .from('orders')
        .select('order_number, created_at, total_amount')
        .eq('id', orderId)
        .single();

      if (error || !data) {
        throw new Error('Order not found or error fetching invoice data');
      }

      const order = data as Order;
      const invoiceContent = `Invoice for Order ${order.order_number}\n\nDate: ${order.created_at.split('T')[0]}\nTotal: ${formatCurrency(order.total_amount)}\n\nItems:\n${order.items?.map(item => `- ${item.products?.name || `Product ID: ${item.product_id}`} x${item.quantity} - ${formatCurrency(item.unit_price)} each`).join('\n')}`;
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.order_number}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Error downloading invoice
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleTrackPackage = async (orderId: string) => {
    setTrackingOrder(orderId);
    try {
      const supabaseClient = getSupabaseSessionClient();
      const { data, error } = await supabaseClient
        .from('orders')
        .select('tracking_number, estimated_delivery')
        .eq('id', orderId)
        .single();

      if (error || !data) {
        throw new Error('Order not found or error fetching tracking info');
      }

      const order = data as Order;
      alert(`Tracking information for ${order.order_number}:\n\nTracking Number: ${order.tracking_number}\nCarrier: Standard Shipping\nStatus: In Transit\nEstimated Delivery: ${order.estimated_delivery}`);
    } catch (error) {
      // Error tracking package
    } finally {
      setTrackingOrder(null);
    }
  };

  const handleLeaveReview = (orderId: string) => {
    // In a real app, this would open a review modal or redirect to review page
    const order = orders.find(o => o.id === orderId);
    if (order) {
      alert(`Review form for order ${order.order_number} would open here.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UnifiedHeader products={allProducts} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your orders and view order history
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/my-orders/refund-history"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refund History
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by order number or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="PENDING_INSTALLATION_QUOTE">Installation Quote Approved</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Additional Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                    <option value="all">All Time</option>
                    <option value="last30">Last 30 Days</option>
                    <option value="last90">Last 90 Days</option>
                    <option value="last365">Last Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Value
                  </label>
                                     <select 
                     value={priceFilter} 
                     onChange={(e) => setPriceFilter(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                   >
                     <option value="">All Prices</option>
                     <option value="under500">Under {formatCurrency(500)}</option>
                     <option value="500-1000">{formatCurrency(500)} - {formatCurrency(1000)}</option>
                     <option value="1000-5000">{formatCurrency(1000)} - {formatCurrency(5000)}</option>
                     <option value="over5000">Over {formatCurrency(5000)}</option>
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Installation Required
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                    <option value="all">All Orders</option>
                    <option value="with">With Installation</option>
                    <option value="without">Without Installation</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No orders found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start shopping to see your orders here'
                }
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = getStatusConfig(order.status, order);
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-5 h-5 text-gray-400" />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Order #{order.order_number}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(order.total_amount)}
                          </span>
                          {order.payment_status === 'COMPLETED' && (
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">Payment Complete</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {order.items?.reduce((total, item) => total + item.quantity, 0) || 0} items
                        </span>
                      </div>
                      {order.installation_required && (
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Installation: {order.installation_status || 'Not scheduled'}
                          </span>
                        </div>
                      )}
                                              <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                             {orderAddresses[order.id] || 'Loading...'}
                            </span>
                        </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-6 space-y-6">
                        {/* Order Items */}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                            Order Items
                          </h4>
                          {isSitePickupOrder(order) ? (
                            // For site pickup orders, group items by supplier
                            <div className="space-y-4">
                              {getOrderItemsBySupplier(order).map((supplierGroup, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                  <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                                    <h5 className="font-medium text-gray-900 dark:text-white">
                                      {supplierGroup.supplier?.company_name || 'Supplier'}
                                    </h5>
                                    {supplierGroup.supplier && (() => {
                                      const supplier = supplierGroup.supplier;
                                      const addressParts = [];
                                      
                                      if (supplier.company_address && supplier.company_address.trim()) {
                                        addressParts.push(supplier.company_address);
                                      }
                                      
                                      if (supplier.state && supplier.state.trim()) {
                                        addressParts.push(supplier.state);
                                      }
                                      
                                      if (supplier.country && supplier.country.trim()) {
                                        addressParts.push(supplier.country);
                                      }
                                      
                                      const addressText = addressParts.length > 0 
                                        ? addressParts.join(', ')
                                        : 'Address TBD';
                                      
                                      return (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {addressText}
                                        </p>
                                      );
                                    })()}
                                  </div>
                                  <div className="space-y-3">
                                    {supplierGroup.items.map((item) => (
                                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                          <img 
                                            src={item.products?.images?.[0] || 'https://via.placeholder.com/50'}
                                            alt={item.products?.name || 'Product Image'}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-medium text-gray-900 dark:text-white truncate">
                                            {item.products?.name || `Product ID: ${item.product_id}`}
                                          </h5>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Quantity: {item.quantity}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(item.total_price)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            // For regular orders, show items normally
                            <div className="space-y-3">
                              {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    <img 
                                      src={item.products?.images?.[0] || 'https://via.placeholder.com/50'}
                                      alt={item.products?.name || 'Product Image'}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 dark:text-white truncate">
                                      {item.products?.name || `Product ID: ${item.product_id}`}
                                    </h5>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      Quantity: {item.quantity}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      {formatCurrency(item.total_price)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Multi-Vendor Shipping Breakdown */}
                        {((order.shipping_breakdown?.calculations?.length || 0) > 0 || (order.order_shipping_details?.length || 0) > 0) && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                              Shipping Breakdown
                            </h4>
                            <div className="space-y-3">
                              {/* Use shipping_breakdown if available, otherwise use order_shipping_details */}
                              {(order.shipping_breakdown?.calculations || order.order_shipping_details?.map(detail => ({
                                supplier_id: detail.supplier_id,
                                supplier_name: detail.supplier?.company_name || 'Unknown Supplier',
                                shipping_amount: detail.shipping_amount,
                                shipping_method: detail.shipping_method,
                                estimated_days_min: detail.estimated_days_min,
                                estimated_days_max: detail.estimated_days_max,
                                item_count: detail.item_count,
                                total_weight_kg: detail.total_weight_kg,
                                subtotal: 0 // Not available in order_shipping_details
                              })) || []).map((calc, index) => (
                                <div key={calc.supplier_id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h5 className="font-medium text-gray-900 dark:text-white">
                                        {calc.supplier_name}
                                      </h5>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {calc.shipping_method}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(calc.shipping_amount)}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {calc.estimated_days_min}-{calc.estimated_days_max} days
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div>
                                      <span className="font-medium">Items:</span> {calc.item_count}
                                    </div>
                                    <div>
                                      <span className="font-medium">Weight:</span> {calc.total_weight_kg}kg
                                    </div>
                                    {calc.subtotal > 0 && (
                                      <div>
                                        <span className="font-medium">Subtotal:</span> {formatCurrency(calc.subtotal)}
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-medium">Shipping:</span> {formatCurrency(calc.shipping_amount)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    Total Shipping Cost
                                  </span>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(
                                      order.shipping_breakdown?.total_shipping_amount || 
                                      order.order_shipping_details?.reduce((sum, detail) => sum + detail.shipping_amount, 0) || 
                                      0
                                    )}
                                  </span>
                                </div>
                                {(order.shipping_breakdown || (order.order_shipping_details?.length || 0) > 0) && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Estimated delivery: {
                                      order.shipping_breakdown 
                                        ? `${order.shipping_breakdown.total_estimated_days_min}-${order.shipping_breakdown.total_estimated_days_max} days`
                                        : order.order_shipping_details 
                                          ? `${Math.min(...order.order_shipping_details.map(d => d.estimated_days_min))}-${Math.max(...order.order_shipping_details.map(d => d.estimated_days_max))} days`
                                          : 'TBD'
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment Status */}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                            Payment Information
                          </h4>
                          {order.payment_status === 'COMPLETED' ? (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-green-900 dark:text-green-100">
                                    Payment Completed Successfully
                                  </h5>
                                  <p className="text-sm text-green-800 dark:text-green-200">
                                    Your payment has been processed and confirmed
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    PAID
                                  </span>
                                </div>
                              </div>
                              {order.payment_gateway && (
                                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-green-700 dark:text-green-300 font-medium">Payment Gateway:</span>
                                      <span className="text-green-800 dark:text-green-200 ml-2">{order.payment_gateway}</span>
                                    </div>
                                    {order.payment_reference && (
                                      <div>
                                        <span className="text-green-700 dark:text-green-300 font-medium">Reference:</span>
                                        <span className="text-green-800 dark:text-green-200 ml-2 font-mono text-xs">{order.payment_reference}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Refund Status for Cancelled Orders */}
                              {order.status?.toLowerCase() === 'cancelled' && cancelledOrderRefunds[order.id] && (
                                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium text-green-900 dark:text-green-100">
                                      Refund Status
                                    </h6>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => refreshRefundStatus()}
                                        disabled={refreshingRefunds}
                                        className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 disabled:opacity-50"
                                      >
                                        <RefreshCw className={`w-3 h-3 ${refreshingRefunds ? 'animate-spin' : ''}`} />
                                        Refresh
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      cancelledOrderRefunds[order.id].status === 'COMPLETED' 
                                        ? 'bg-green-600' 
                                        : cancelledOrderRefunds[order.id].status === 'PENDING'
                                        ? 'bg-yellow-600'
                                        : cancelledOrderRefunds[order.id].status === 'FAILED'
                                        ? 'bg-red-600'
                                        : 'bg-gray-600'
                                    }`}>
                                      {cancelledOrderRefunds[order.id].status === 'COMPLETED' ? (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                      ) : cancelledOrderRefunds[order.id].status === 'PENDING' ? (
                                        <Clock className="w-4 h-4 text-white" />
                                      ) : cancelledOrderRefunds[order.id].status === 'FAILED' ? (
                                        <AlertCircle className="w-4 h-4 text-white" />
                                      ) : (
                                        <Clock className="w-4 h-4 text-white" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <h6 className="font-medium text-green-900 dark:text-green-100">
                                        {cancelledOrderRefunds[order.id].status === 'COMPLETED' 
                                          ? 'Refund Processed' 
                                          : cancelledOrderRefunds[order.id].status === 'PENDING'
                                          ? 'Refund Pending'
                                          : cancelledOrderRefunds[order.id].status === 'FAILED'
                                          ? 'Refund Failed'
                                          : 'Refund Processing'
                                        }
                                      </h6>
                                      <p className="text-sm text-green-800 dark:text-green-200">
                                        {cancelledOrderRefunds[order.id].status === 'COMPLETED' 
                                          ? `Refund of ${formatCurrency(cancelledOrderRefunds[order.id].amount)} has been processed`
                                          : cancelledOrderRefunds[order.id].status === 'PENDING'
                                          ? `Refund of ${formatCurrency(cancelledOrderRefunds[order.id].amount)} is being processed`
                                          : cancelledOrderRefunds[order.id].status === 'FAILED'
                                          ? 'There was an issue processing your refund'
                                          : `Refund of ${formatCurrency(cancelledOrderRefunds[order.id].amount)} is being processed`
                                        }
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        cancelledOrderRefunds[order.id].status === 'COMPLETED' 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                          : cancelledOrderRefunds[order.id].status === 'PENDING'
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                          : cancelledOrderRefunds[order.id].status === 'FAILED'
                                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                      }`}>
                                        {cancelledOrderRefunds[order.id].status}
                                      </span>
                                    </div>
                                  </div>
                                  {cancelledOrderRefunds[order.id].refund_reason && (
                                    <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                      <span className="font-medium">Reason:</span> {cancelledOrderRefunds[order.id].refund_reason}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* No Refund Found for Cancelled Orders */}
                              {order.status?.toLowerCase() === 'cancelled' && !cancelledOrderRefunds[order.id] && (
                                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                                      <Clock className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <h6 className="font-medium text-orange-900 dark:text-orange-100">
                                        Refund Processing
                                      </h6>
                                      <p className="text-sm text-orange-800 dark:text-orange-200">
                                        Your refund is being processed and will be credited to your original payment method
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                        PROCESSING
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-yellow-900 dark:text-yellow-100">
                                    Payment Pending
                                  </h5>
                                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Complete your payment to proceed with the order
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    {order.payment_status || 'PENDING'}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                                <button
                                  onClick={() => {
                                    // Redirect to checkout page with the order ID
                                    window.location.href = `/checkout?order=${order.id}`;
                                  }}
                                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                                >
                                  <DollarSign className="w-4 h-4" />
                                  Continue Payment
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Installation Details */}
                        {order.installation_required && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                              Installation Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  Installation Type
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  {order.installation_status === 'scheduled' ? 'Scheduled' : 'Not scheduled'}
                                </p>
                              </div>
                              {order.installation_status === 'scheduled' && (
                                <div>
                                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Scheduled Date
                                  </p>
                                  <p className="text-sm text-blue-800 dark:text-blue-200">
                                    {order.installation_date}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  Status
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200 capitalize">
                                  {order.installation_status}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Shipping Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                            Shipping Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Shipping Address
                              </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                 {orderAddresses[order.id] || 'Loading...'}
                                </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Shipping Method
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isSitePickupOrder(order) ? 'Site Pickup (No Shipping)' : 'Regular Shipping'}
                              </p>
                            </div>
                            {!isSitePickupOrder(order) && (
                              <>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Tracking Number
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {order.tracking_number || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Estimated Delivery
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {order.estimated_delivery || 'N/A'}
                                    {order.updated_at && (
                                      <span className="block text-green-600">
                                        Updated: {new Date(order.updated_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {order.status === 'PENDING_INSTALLATION_QUOTE' ? (
                            <button 
                              onClick={() => window.location.href = `/checkout?order=${order.id}`}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                            >
                              <Wrench className="w-4 h-4" />
                              Continue Order
                            </button>
                          ) : (
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          )}
                          <button 
                            onClick={() => handleDownloadInvoice(order.id)}
                            disabled={downloadingInvoice === order.id}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingInvoice === order.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Download Invoice
                              </>
                            )}
                          </button>
                          {refundEligibility[order.id] ? (
                            <Link
                              href={`/my-orders/refund-request?orderId=${order.id}`}
                              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Request Refund
                            </Link>
                          ) : (
                            // Show refund eligibility status for orders that can't be refunded
                            order.status === 'delivered' && 
                            order.payment_status === 'COMPLETED' && 
                            !refundStatuses[order.id] && (
                              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Refund Window Expired
                                </span>
                              </div>
                            )
                          )}
                          {refundStatuses[order.id] ? (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                              refundStatuses[order.id].status === 'PENDING' 
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                : refundStatuses[order.id].status === 'APPROVED'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : refundStatuses[order.id].status === 'COMPLETED'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : refundStatuses[order.id].status === 'FAILED'
                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}>
                              {refundStatuses[order.id].status === 'PENDING' ? (
                                <Clock className="w-4 h-4" />
                              ) : refundStatuses[order.id].status === 'APPROVED' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : refundStatuses[order.id].status === 'COMPLETED' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : refundStatuses[order.id].status === 'FAILED' ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                <Clock className="w-4 h-4" />
                              )}
                              <span className="text-sm font-medium">
                                Refund {refundStatuses[order.id].status}
                              </span>
                            </div>
                          ) : null}
                          {order.tracking_number && (
                            <button 
                              onClick={() => handleTrackPackage(order.id)}
                              disabled={trackingOrder === order.id}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {trackingOrder === order.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <Truck className="w-4 h-4" />
                                  Track Package
                                </>
                              )}
                            </button>
                          )}
                          {order.status === 'delivered' && (
                            <button 
                              onClick={() => handleLeaveReview(order.id)}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Leave Review
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
} 
