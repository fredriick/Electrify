'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { PaystackClient } from '@/lib/paystackClient';
import { Loader2, MessageSquare, CheckCircle, Truck, Package } from 'lucide-react';
import { useCartWishlist } from '@/components/providers/Providers';
import { getSupabaseClient, getSupabaseSessionClient } from '@/lib/auth';
import { shippingService, ShippingBreakdown, ShippingCalculation } from '@/services/shippingService';
import { simpleTaxService, TaxCalculation } from '@/services/simpleTaxService';
import { revenueService, RevenueBreakdown } from '@/services/revenueService';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';
// Installation service no longer needed - only custom quotes

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, isInitialized } = useAuth();
  const { formatCurrency } = useCurrency();
  
  // Get cart data from CartWishlist context (same as cart page)
  const { cartItems, clearCart } = useCartWishlist();
  
  // State for fetched products
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  // State for installation services
  const [installationServices, setInstallationServices] = useState<any[]>([]);
  const [installationServicesLoading, setInstallationServicesLoading] = useState(false);
  
  
  // Installation services are no longer needed - only custom quotes

  // Check for approved installation quote on page load
  useEffect(() => {
    const checkApprovedQuote = async () => {
      // Only proceed if we have a user (authentication is handled by the component-level checks)
      if (!user) {
        return;
      }
      
      // Check URL parameters for order ID
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('order');
      
      if (orderId) {
        // Load existing order with approved quote
        try {
          const { getSupabaseClient } = await import('@/lib/auth');
          const supabase = getSupabaseClient();
          
          // Build query with or without customer_id filter
          let query = supabase
            .from('orders')
            .select('*')
            .eq('id', orderId);
          
          // Only add customer_id filter if we have profile
          if (profile?.id) {
            query = query.eq('customer_id', profile.id);
          }
          
          const { data: order, error } = await query.single();
          
          if (error) {
            return;
          }
          
          if (order) {
            // If order has installation amount, treat it as an approved installation quote
            if (order.installation_amount && order.installation_amount > 0) {
            setApprovedQuote({
                id: order.id,
                amount: order.installation_amount,
                notes: 'Custom installation service',
              approvedAt: order.created_at
            });
            setInstallationRequired(true);
              
              // Automatically advance to payment step since we have an approved quote
              setCurrentStep(3);
            }
          }
        } catch (error) {
          // Error loading order - continue without it
        }
      } else {
        // Check localStorage for approved quote (legacy support)
        const savedQuote = localStorage.getItem('approvedInstallationQuote');
        if (savedQuote) {
          try {
            const quote = JSON.parse(savedQuote);
            setApprovedQuote(quote);
            setInstallationRequired(true);
          } catch (error) {
            localStorage.removeItem('approvedInstallationQuote');
          }
        }
      }
    };

    checkApprovedQuote();
  }, [user?.id]);

  // Fetch product details for cart items
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user || cartItems.length === 0) {
        setProductsLoading(false);
        return;
      }
      
      try {
        setProductsLoading(true);
        
        // Get unique product IDs from cart items
        const productIds = Array.from(new Set(cartItems.map(item => item.id)));
        
        // Fetch all products that are in the user's cart
        const supabaseClient = getSupabaseClient();
        const { data: productsData, error: productsError } = await supabaseClient
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            compare_price,
            rating,
            review_count,
            images,
            category_id,
            stock_quantity,
            supplier_id,
            weight
          `)
          .in('id', productIds);
        
        if (productsError) {
          return;
        }
        
        // Transform the data to match the expected format
        const transformedProducts = productsData?.map((product: any) => ({
          id: product.id,
          name: product.name,
          category: product.categories?.name || 'Unknown',
          price: product.price,
          comparePrice: product.compare_price || 0,
          rating: product.rating || 0,
          reviews: product.review_count || 0,
          image: product.images?.[0] || '/images/placeholder.jpg',
          description: product.description || '',
          stock: product.stock_quantity || 0,
          supplier_id: product.supplier_id,
          weight_kg: product.weight || 0
        })) || [];
        
        setProducts(transformedProducts);
        
      } catch (err) {
        // Error fetching products
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [user, cartItems]);
  
  
  
  const [currentStep, setCurrentStep] = useState(1);
  const [purchaseType, setPurchaseType] = useState<'site' | 'shipping'>('site');
  const [installationRequired, setInstallationRequired] = useState(false);
  const [installationType, setInstallationType] = useState<'custom'>('custom');
  const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'card' | 'paypal'>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State for approved installation quote
  const [approvedQuote, setApprovedQuote] = useState<any>(null);
  
  // Multi-vendor shipping state
  const [shippingBreakdown, setShippingBreakdown] = useState<ShippingBreakdown | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  
  // Tax calculation state
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  const [taxLoading, setTaxLoading] = useState(false);
  const [isCalculatingTax, setIsCalculatingTax] = useState(false);
  
  // Revenue calculation state
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [isCalculatingRevenue, setIsCalculatingRevenue] = useState(false);
  
  // Address management state
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [customAddress, setCustomAddress] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_line_1: '',
    address_line_2: '',
      city: '',
      state: '',
    postal_code: '',
    country: '',
    phone: ''
  });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  
  // Custom quote request state
  const [customQuoteRequest, setCustomQuoteRequest] = useState({
    requirements: '',
    location: '',
    special_notes: ''
  });
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  
  useEffect(() => {
    // Installation state tracking
  }, [installationRequired, approvedQuote, installationType]);
  
  useEffect(() => {
    // Profile state tracking
  }, [profile, authLoading, user, currentStep, installationRequired, approvedQuote]);

  // Handle custom quote submission
  const handleCustomQuoteSubmission = async () => {
    if (!user || !profile) return;
    
    try {
      setIsSubmittingQuote(true);
      
      // Create custom quote request for admin approval
      const supabaseClient = getSupabaseSessionClient();
      const { data: quoteData, error: quoteError } = await supabaseClient
        .from('custom_installation_quotes')
        .insert({
          customer_id: profile.id,
          requested_amount: 0, // Will be filled by admin
          status: 'pending_admin_assignment',
          customer_notes: customQuoteRequest.requirements,
          notes: `Location: ${customQuoteRequest.location}\nSpecial Notes: ${customQuoteRequest.special_notes}`
        })
        .select()
        .single();
      
      if (quoteError) {
        alert('Failed to submit quote request. Please try again.');
        return;
      }
      
      alert('Quote request submitted! Our admin team will review your requirements and provide a personalized quote within 24-48 hours. You can view the status at /my-quotes and continue with your order without installation for now.');
      
      // Reset custom quote form
      setCustomQuoteRequest({
        requirements: '',
        location: '',
        special_notes: ''
      });
      
      // Uncheck installation requirement so they can proceed
      setInstallationRequired(false);
      
    } catch (error) {
      alert('Failed to submit quote request. Please try again.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // Calculate order totals using fetched products
  const getSubtotal = () => {
    return products.reduce((total, product) => {
      const cartItem = cartItems.find(item => item.id === product.id);
      return total + (product.price * (cartItem?.quantity || 0));
    }, 0);
  };

  const getInstallationCost = () => {
    if (!installationRequired) return 0;
    
    // If there's an approved quote, use that amount
    if (approvedQuote && approvedQuote.amount) {
      return approvedQuote.amount;
    }
    
    // Custom installation requires admin approval
    return 0;
  };

  const getShippingCost = () => {
    if (purchaseType === 'site') return 0;
    return shippingBreakdown?.total_shipping_amount || 0;
  };

  // Check if shipping is available for customer's location
  const isShippingAvailable = () => {
    if (purchaseType === 'site') return true; // Site pickup is always available
    if (purchaseType === 'shipping') {
      // Check if we have valid shipping breakdown
      return shippingBreakdown && shippingBreakdown.calculations.some(calc => calc.shipping_amount > 0);
    }
    return true;
  };

  // Get detailed shipping failure message
  const getShippingFailureMessage = () => {
    if (!shippingBreakdown || shippingBreakdown.calculations.length === 0) {
      return 'No shipping rates configured for your location. Please contact customer support.';
    }

    // Check for specific failure reasons
    const failedCalculations = shippingBreakdown.calculations.filter(calc => calc.shipping_amount === 0);
    
    if (failedCalculations.length > 0) {
      const failureReasons = failedCalculations
        .map(calc => calc.failure_reason)
        .filter(reason => reason)
        .join('; ');
      
      if (failureReasons) {
        return failureReasons;
      }
    }

    // Fallback message
    return `We currently don't deliver to ${getCurrentShippingAddress().state || 'your location'}. Please contact us or choose a different delivery address.`;
  };

  // Function to refresh products with latest weight data
  const refreshProductsForShipping = async () => {
    if (!user || cartItems.length === 0) return;
    
    if (isRefreshingProducts) {
      return;
    }
    
    setIsRefreshingProducts(true);
    
    try {
      const productIds = Array.from(new Set(cartItems.map(item => item.id)));
      
      const supabaseClient = getSupabaseClient();
      const { data: productsData, error: productsError } = await supabaseClient
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          compare_price,
          rating,
          review_count,
          images,
          category_id,
          stock_quantity,
          supplier_id,
          weight
        `)
        .in('id', productIds);
      
      if (productsError) {
        return;
      }
      
      if (productsData) {
        const transformedProducts = productsData.map((product: any) => ({
          id: product.id,
          name: product.name,
          category: product.categories?.name || 'Unknown',
          price: product.price,
          comparePrice: product.compare_price || 0,
          rating: product.rating || 0,
          reviews: product.review_count || 0,
          image: product.images?.[0] || '/images/placeholder.jpg',
          description: product.description || '',
          stock: product.stock_quantity || 0,
          supplier_id: product.supplier_id,
          weight_kg: product.weight || 0 // Use weight field from database
        }));
        
        setProducts(transformedProducts);
        
      }
    } catch (error) {
      // Error refreshing products
    } finally {
      setIsRefreshingProducts(false);
    }
  };

    // Calculate multi-vendor shipping when address or cart changes
    useEffect(() => {
      const calculateShipping = async () => {
      
        if (purchaseType !== 'shipping' || !products.length || !cartItems.length) {
          setShippingBreakdown(null);
          return;
        }

      // Check if any products have missing weight data (only check for undefined/null, allow 0)
      const hasMissingWeight = products.some(p => p.weight_kg === undefined || p.weight_kg === null);
      if (hasMissingWeight && !isRefreshingProducts) {
        await refreshProductsForShipping();
        // Return early - the useEffect will trigger again with fresh product data
        return;
      }
      
      // If we're refreshing products, don't proceed with shipping calculation
      if (isRefreshingProducts) {
        return;
      }

      // Additional weight checks removed - they were causing infinite loop
      // Products with weight_kg = 0 are valid and should proceed

      setShippingLoading(true);

      try {
        // Get shipping address
        const shippingAddress = getCurrentShippingAddress();
        
        // Convert cart items to the format expected by shipping service
        const cartItemsForShipping = cartItems.map(item => {
          const product = products.find(p => p.id === item.id);
          return {
            id: String(item.id),
            quantity: item.quantity,
            product: {
              id: product?.id || String(item.id),
              name: product?.name || 'Unknown Product',
              price: product?.price || 0,
              weight_kg: product?.weight_kg || 0,
              supplier_id: product?.supplier_id || 'default-supplier'
            }
          };
        });

        // Calculate shipping breakdown
        // Use the selected shipping address (not just profile data)
        const locationForShipping = {
          state: shippingAddress.state || undefined, // Use selected address state
          country: shippingAddress.country || undefined // Use selected address country
        };
        
        
        const breakdown = await shippingService.calculateShippingForCart(
          cartItemsForShipping,
          locationForShipping
        );
        
        setShippingBreakdown(breakdown);
        
        // Check if any suppliers have valid shipping rates for this location
        const hasValidShipping = breakdown.calculations.some(calc => calc.shipping_amount > 0);
        
        if (!hasValidShipping) {
          // Keep the breakdown to show detailed error messages
          setShippingBreakdown(breakdown);
        } else {
          setShippingBreakdown(breakdown);
        }
        
      } catch (error) {
        // Error calculating shipping
        setShippingBreakdown(null);
      } finally {
        setShippingLoading(false);
      }
    };

    // Add debounce to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      calculateShipping();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [purchaseType, products, cartItems, useDefaultAddress, selectedAddressId, customAddress]);

  // Calculate tax when order details change
  useEffect(() => {
    const calculateTax = async () => {
      if (!user || cartItems.length === 0) {
        setTaxCalculation(null);
        return;
      }

      // Don't calculate tax if shipping is still loading (for shipping orders)
      if (purchaseType === 'shipping' && shippingLoading) {
        return;
      }

      // Prevent multiple simultaneous calculations
      if (isCalculatingTax) {
        return;
      }

      setIsCalculatingTax(true);
      setTaxLoading(true);
      try {
        const baseAmount = getSubtotal() + getInstallationCost() + getShippingCost();
        
        // Get customer country for VAT calculation
        const shippingAddress = getCurrentShippingAddress();
        const country = shippingAddress.country || 'Nigeria'; // Default to Nigeria

        // Get product IDs for tax exemption check
        const productIds = products
          .filter(product => cartItems.some(item => item.id === product.id))
          .map(product => product.id);

        const taxCalc = await simpleTaxService.calculateVAT(baseAmount, country, productIds);
        setTaxCalculation(taxCalc);
        
      } catch (error) {
        setTaxCalculation(null);
      } finally {
        setTaxLoading(false);
        setIsCalculatingTax(false);
      }
    };

    // Add debounce to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      calculateTax();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [purchaseType, products, cartItems, shippingBreakdown, installationRequired, approvedQuote, shippingLoading, isCalculatingTax]);

  useEffect(() => {
    // Tax calculation state tracking
  }, [taxCalculation]);

  // Calculate revenue breakdown when order details change
  useEffect(() => {
    const calculateRevenue = async () => {
      if (!user || cartItems.length === 0 || products.length === 0) {
        setRevenueBreakdown(null);
        return;
      }

      // Don't calculate revenue if shipping is still loading (for shipping orders)
      if (purchaseType === 'shipping' && shippingLoading) {
        return;
      }

      // Prevent multiple simultaneous calculations
      if (isCalculatingRevenue) {
        return;
      }

      setIsCalculatingRevenue(true);
      setRevenueLoading(true);
      try {
        const subtotal = getSubtotal();
        const shippingAmount = getShippingCost();
        
        // Calculate VAT amount directly to avoid circular dependency
        const baseAmount = subtotal + getInstallationCost() + shippingAmount;
        const shippingAddress = getCurrentShippingAddress();
        const country = shippingAddress.country || 'Nigeria';
        const productIds = products
          .filter(product => cartItems.some(item => item.id === product.id))
          .map(product => product.id);
        
        // Get VAT amount directly without relying on taxCalculation state
        let vatAmount = 0;
        try {
          const taxCalc = await simpleTaxService.calculateVAT(baseAmount, country, productIds);
          vatAmount = taxCalc.vat_amount || 0;
        } catch (error) {
          // Fallback to 0 if tax calculation fails
          vatAmount = 0;
        }
        
        // Calculate revenue for each supplier
        const supplierRevenues: RevenueBreakdown[] = [];
        
        // Group products by supplier
        const productsBySupplier = products.reduce((acc, product) => {
          const supplierId = product.supplier_id || 'default-supplier';
          if (!acc[supplierId]) {
            acc[supplierId] = [];
          }
          acc[supplierId].push(product);
          return acc;
        }, {} as Record<string, any[]>);

        // Calculate revenue for each supplier
        for (const [supplierId, supplierProducts] of Object.entries(productsBySupplier)) {
          const typedSupplierProducts = supplierProducts as any[];
          const supplierSubtotal = typedSupplierProducts.reduce((total: number, product: any) => {
            const cartItem = cartItems.find(item => item.id === product.id);
            return total + (product.price * (cartItem?.quantity || 0));
          }, 0);

          const breakdown = await revenueService.calculateRevenueBreakdown(
            supplierId,
            supplierSubtotal,
            vatAmount * (supplierSubtotal / subtotal), // Proportional VAT
            shippingAmount * (supplierSubtotal / subtotal), // Proportional shipping
            'paystack'
          );

          supplierRevenues.push(breakdown);
        }

        // Sum up all supplier revenues
        const totalRevenue = supplierRevenues.reduce((total, rev) => ({
          subtotal: total.subtotal + rev.subtotal,
          vat_amount: total.vat_amount + rev.vat_amount,
          shipping_amount: total.shipping_amount + rev.shipping_amount,
          commission_amount: total.commission_amount + rev.commission_amount,
          platform_fee_amount: total.platform_fee_amount + rev.platform_fee_amount,
          payment_processing_fee: total.payment_processing_fee + rev.payment_processing_fee,
          supplier_payout: total.supplier_payout + rev.supplier_payout,
          platform_revenue: total.platform_revenue + rev.platform_revenue,
          total_order_value: total.total_order_value + rev.total_order_value
        }), {
          subtotal: 0,
          vat_amount: 0,
          shipping_amount: 0,
          commission_amount: 0,
          platform_fee_amount: 0,
          payment_processing_fee: 0,
          supplier_payout: 0,
          platform_revenue: 0,
          total_order_value: 0
        });

        setRevenueBreakdown(totalRevenue);
        
      } catch (error) {
        // Error calculating revenue
        setRevenueBreakdown(null);
      } finally {
        setRevenueLoading(false);
        setIsCalculatingRevenue(false);
      }
    };

    // Add debounce to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      calculateRevenue();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [purchaseType, products, cartItems, shippingBreakdown, installationRequired, approvedQuote, shippingLoading, isCalculatingRevenue]);

  const getTax = () => {
    const taxAmount = taxCalculation?.vat_amount || 0;
    return taxAmount;
  };

  const getTotal = () => {
    const baseTotal = getSubtotal() + getInstallationCost() + getShippingCost() + getTax();
    
    // Add revenue components if available
    if (revenueBreakdown) {
      return baseTotal + 
             revenueBreakdown.platform_fee_amount + 
             revenueBreakdown.payment_processing_fee + 
             revenueBreakdown.commission_amount;
    }
    
    return baseTotal;
  };

  useEffect(() => {
    // Check if we have an order parameter - if so, don't redirect to login
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');
    
    if (!authLoading && !user && !orderId) {
      
      router.push('/login?redirect=/checkout');
    } else if (!authLoading && !user && orderId) {
      
    }
    
    // Only redirect to cart if user is not authenticated or if explicitly navigating away
    // Don't auto-redirect on cart clearing after payment
  }, [user, authLoading, router]);

  // Fetch customer addresses when user is available
  useEffect(() => {
    if (user && purchaseType === 'shipping') {
      fetchCustomerAddresses();
    }
  }, [user, purchaseType]);

  // Initialize custom address with profile data
  useEffect(() => {
    if (profile && purchaseType === 'shipping') {
      setCustomAddress(prev => ({
      ...prev,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        state: profile.state || ''
      }));
    }
  }, [profile, purchaseType]);

  const handleNextStep = () => {
    // If we have an approved quote, skip normal flow and go directly to payment
    if (approvedQuote && installationRequired) {
      
      setCurrentStep(3); // Go directly to payment
      return;
    }
    
    if (purchaseType === 'site') {
      // Site pickup: skip address step
      if (currentStep === 1) {
        setCurrentStep(2); // Go to installation options
      } else if (currentStep === 2) {
        // Check if custom installation requires quote approval
        if (installationRequired && installationType === 'custom') {
          // Don't allow proceeding to payment for custom quotes
          alert('Custom installation requires a quote. Please submit your requirements and we\'ll contact you with pricing.');
          return;
        }
        setCurrentStep(3); // Go to payment
      }
    } else {
      // Shipping: include address step
      if (currentStep === 1) {
        setCurrentStep(2); // Go to address selection
      } else if (currentStep === 2) {
        // Validate address before proceeding to installation options
        const hasValidAddress = (
          (useDefaultAddress && profile?.address) || 
          (selectedAddressId) || 
          (customAddress.address_line_1 && customAddress.city && customAddress.state)
        );
        
        if (!hasValidAddress) {
          
          // Set error message in state
          setAddressError('Please provide a complete shipping address to continue. You need at least: Address Line 1, City, and State.');
          return; // Stop here, don't proceed
        }
        
        // Clear any previous errors
        setAddressError(null);
        
        
        setCurrentStep(3); // Go to installation options
      } else if (currentStep === 3) {
        // Check if custom installation requires quote approval
        if (installationRequired && installationType === 'custom') {
          // Don't allow proceeding to payment for custom quotes
          alert('Custom installation requires a quote. Please submit your requirements and we\'ll contact you with pricing.');
          return;
        }
        setCurrentStep(4); // Go to payment
      }
    }
  };

  const handlePrevStep = () => {
    if (purchaseType === 'site') {
      // Site pickup: skip address step
      if (currentStep === 2) {
        setCurrentStep(1); // Go back to purchase type
      } else if (currentStep === 3) {
        setCurrentStep(2); // Go back to installation options
      }
    } else {
      // Shipping: include address step
      if (currentStep === 3) {
        setCurrentStep(2); // Go back to address selection
      } else if (currentStep === 2) {
        setCurrentStep(1); // Go back to purchase type
      } else if (currentStep === 4) {
        setCurrentStep(3); // Go back to installation options
      }
    }
  };

  // Function to handle successful payment
  const handlePaymentSuccess = async (paymentReference: string, paystackResponse: any) => {
    try {
      
      
      // Create order in database
      const orderData = await createOrderInDatabase(paymentReference, paystackResponse);
      
      
      
      // Clear approved quote from localStorage
      if (approvedQuote) {
        localStorage.removeItem('approvedInstallationQuote');
        setApprovedQuote(null);
      }
      
      // Update order status to PAID after successful payment
      await updateOrderStatusToPaid(orderData.id, paymentReference);
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to success page
      router.push(`/checkout/success?reference=${paymentReference}`);
    } catch (error) {
      
      
      // Don't clear cart if order creation fails
      // Don't redirect - stay on checkout page
      alert('Payment successful but order creation failed. Please contact support.');
      setIsProcessing(false);
    }
  };

  // Function to create order in database
  const createOrderInDatabase = async (paymentReference: string, paystackResponse: any) => {
    try {
      // Check if we're updating an existing order
      const urlParams = new URLSearchParams(window.location.search);
      const existingOrderId = urlParams.get('order');
      
      // Create order record - try multiple approaches
      let supabaseClient = getSupabaseSessionClient();
      
      // If session client fails, try regular client
      if (!supabaseClient?.auth) {
        
        supabaseClient = getSupabaseClient();
      }
      
      
      // Check current session
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      // Get installation service ID and amount from approved quote
      let installationServiceId = null;
      let installationAmount = 0;
      
      if (installationRequired && approvedQuote) {
        installationAmount = approvedQuote.amount || 0;
        // We can store the quote ID in a custom field or use it for reference
        
      }

      let orderData, orderError;

      if (existingOrderId) {
        // Update existing order
        
        const { data, error } = await supabaseClient
          .from('orders')
          .update({
            subtotal: getSubtotal(),
            tax_amount: getTax(),
            shipping_amount: getShippingCost(),
            installation_amount: installationAmount,
            total_amount: getTotal(),
            status: 'PENDING',
            payment_status: 'PENDING',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingOrderId)
          .eq('customer_id', profile?.id)
          .select()
          .single();
        
        orderData = data;
        orderError = error;
      } else {
        // Create new order
        
        const { data, error } = await supabaseClient
        .from('orders')
        .insert({
          order_number: `ORD-${Date.now()}`,
          user_id: user?.id,
          customer_id: profile?.id,
          status: 'PENDING',
          subtotal: getSubtotal(),
          tax_amount: getTax(),
          shipping_amount: getShippingCost(),
          total_shipping_amount: shippingBreakdown?.total_shipping_amount || 0,
          shipping_breakdown: shippingBreakdown ? {
            calculations: shippingBreakdown.calculations.map(calc => ({
              supplier_id: calc.supplier_id,
              supplier_name: calc.supplier_name,
              shipping_amount: calc.shipping_amount,
              shipping_method: calc.shipping_method,
              estimated_days_min: calc.estimated_days_min,
              estimated_days_max: calc.estimated_days_max,
              item_count: calc.item_count,
              total_weight_kg: calc.total_weight_kg,
              subtotal: calc.subtotal
            })),
            total_shipping_amount: shippingBreakdown.total_shipping_amount,
            total_estimated_days_min: shippingBreakdown.total_estimated_days_min,
            total_estimated_days_max: shippingBreakdown.total_estimated_days_max
          } : null,
          installation_amount: installationAmount,
          installation_service_id: installationServiceId,
          total_amount: getTotal(),
          shipping_address: getCurrentShippingAddress(),
          billing_address: {
            type: 'BILLING',
            first_name: profile?.first_name,
            last_name: profile?.last_name,
            email: profile?.email,
            phone: profile?.phone
          },
          payment_status: 'PENDING',
          payment_gateway: 'PAYSTACK',
          payment_reference: paymentReference
        })
        .select()
        .single();
        
        orderData = data;
        orderError = error;
      }

      if (orderError) {
        
        throw new Error('Failed to create/update order');
      }

      

      // Create order items
      for (const product of products) {
        const cartItem = cartItems.find(item => item.id === product.id);
        if (cartItem) {
          const { error: itemError } = await supabaseClient
            .from('order_items')
            .insert({
              order_id: orderData.id,
              product_id: product.id,
              quantity: cartItem.quantity,
              unit_price: product.price,
              total_price: product.price * cartItem.quantity
            });

          if (itemError) {
            
          }
        }
      }

      // Create notifications for suppliers about the new order
      try {
        const { notificationService } = await import('@/lib/notificationService');
        const customerName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || profile?.email || 'Customer';
        
        // Get unique suppliers from the order items
        const supplierIds = new Set<string>();
        for (const product of products) {
          if (product.supplier_id) {
            supplierIds.add(product.supplier_id);
          }
        }
        
        // Create notifications for each supplier
        for (const supplierId of Array.from(supplierIds)) {
          const supplierProducts = products.filter((p: any) => p.supplier_id === supplierId);
          const itemCount = supplierProducts.reduce((total: number, product: any) => {
            const cartItem = cartItems.find(item => item.id === product.id);
            return total + (cartItem?.quantity || 0);
          }, 0);
          
          await notificationService.createOrderNotification(supplierId, {
            orderId: orderData.id,
            orderNumber: orderData.order_number,
            customerName: customerName,
            totalAmount: getTotal(),
            itemCount: itemCount
          });
        }
      } catch (notificationError) {
        console.error('Failed to create order notifications:', notificationError);
        // Don't fail the order creation if notifications fail
      }

      // Create order shipping details for each supplier
      
      if (shippingBreakdown && shippingBreakdown.calculations.length > 0) {
        for (const calc of shippingBreakdown.calculations) {
          
          const { error: shippingError } = await supabaseClient
            .from('order_shipping_details')
            .insert({
              order_id: orderData.id,
              supplier_id: calc.supplier_id,
              shipping_rate_id: calc.shipping_rate || null,
              shipping_amount: calc.shipping_amount,
              shipping_method: calc.shipping_method,
              estimated_days_min: calc.estimated_days_min,
              estimated_days_max: calc.estimated_days_max,
              item_count: calc.item_count,
              total_weight_kg: calc.total_weight_kg
            });

          if (shippingError) {
            
          } else {
            
          }
        }
        
      } else {
        
      }
      return orderData;

    } catch (error) {
      
      throw error;
    }
  };

  // Function to fetch customer addresses
  const fetchCustomerAddresses = async () => {
    if (!user) return;
    
    try {
      const supabaseClient = getSupabaseSessionClient();
      
      // Fetch saved addresses from addresses table
      const { data: addresses, error: addressesError } = await supabaseClient
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'SHIPPING')
        .order('is_default', { ascending: false });
      
      if (addressesError) {
        
        return;
      }
      
      setSavedAddresses(addresses || []);
      
      // Set default address if available
      const defaultAddress = addresses?.find((addr: any) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
      
      
    } catch (error) {
      
    }
  };

  // Function to get current shipping address for order creation
  const getCurrentShippingAddress = () => {
    if (purchaseType === 'site') {
      return {
        type: 'SHIPPING',
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        email: profile?.email,
        phone: profile?.phone
      };
    }
    
    // For shipping, use the selected address
    if (useDefaultAddress && profile?.address) {
      return {
        type: 'SHIPPING',
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        email: profile?.email,
        phone: profile?.phone,
        address: profile.address,
        state: profile?.state,
        country: profile?.country
      };
    }
    
    if (selectedAddressId) {
      const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (selectedAddress) {
        return {
          type: 'SHIPPING',
          first_name: selectedAddress.first_name,
          last_name: selectedAddress.last_name,
          company: selectedAddress.company,
          address_line_1: selectedAddress.address_line_1,
          address_line_2: selectedAddress.address_line_2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country,
          phone: selectedAddress.phone
        };
      }
    }
    
    // Fallback to profile info with defaults
    const fallbackAddress = {
      type: 'SHIPPING',
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      email: profile?.email,
      phone: profile?.phone,
      state: profile?.state || 'Lagos',  // Default to Lagos if no profile state
      country: profile?.country || 'Nigeria'  // Default to Nigeria if no profile country
    };
    
    return fallbackAddress;
  };

  // Function to delete a saved address
  const deleteSavedAddress = async (addressId: string) => {
    if (!user) return;
    
    try {
      const supabaseClient = getSupabaseSessionClient();
      
      const { error: deleteError } = await supabaseClient
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id); // Ensure user can only delete their own addresses
      
      if (deleteError) {
        
        throw new Error('Failed to delete address');
      }
      
      
      
      // Refresh addresses list
      await fetchCustomerAddresses();
      
      // Clear selection if the deleted address was selected
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        setUseDefaultAddress(true); // Fall back to default address
      }
      
    } catch (error) {
      
      alert('Failed to delete address. Please try again.');
    }
  };

  // Function to save custom address
  const saveCustomAddress = async () => {
    if (!user) return;
    
    try {
      const supabaseClient = getSupabaseSessionClient();
      
      const { data: newAddress, error: saveError } = await supabaseClient
        .from('addresses')
        .insert({
          user_id: user.id,
          type: 'SHIPPING',
          first_name: customAddress.first_name,
          last_name: customAddress.last_name,
          company: customAddress.company,
          address_line_1: customAddress.address_line_1,
          address_line_2: customAddress.address_line_2,
          city: customAddress.city,
          state: customAddress.state,
          postal_code: customAddress.postal_code,
          country: customAddress.country,
          phone: customAddress.phone,
          is_default: false
        })
        .select()
        .single();
      
      if (saveError) {
        
        throw new Error('Failed to save address');
      }
      
      
      
      // Refresh addresses list
      await fetchCustomerAddresses();
      
      // Select the newly saved address
      setSelectedAddressId(newAddress.id);
      setUseDefaultAddress(false);
      
      // Note: fetchCustomerAddresses() already updates savedAddresses, so no need to add manually
      
      return newAddress;
    } catch (error) {
      
      throw error;
    }
  };

  // Function to update order status to PAID after successful payment
  const updateOrderStatusToPaid = async (orderId: string, paymentReference: string) => {
    try {
      const supabaseClient = getSupabaseSessionClient();
      
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          status: 'PROCESSING', // Update the main status column
          payment_status: 'COMPLETED', // Update the payment status column (enum allows 'COMPLETED', not 'PAID')
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        
        throw new Error('Failed to update order status');
      }

      
    } catch (error) {
      
      // Don't throw error - order creation was successful
    }
  };

  const handlePaymentSubmit = async () => {

    // Check if authentication is still initializing
    if (!isInitialized) {
      alert('Please wait while we initialize your session...');
      return;
    }

    // Check if profile is still loading
    if (authLoading) {
      return; // Button is already disabled, just return
    }

    // User authentication is already checked at component level

    // Check if profile exists and has email
    if (!profile) {
      alert('Profile not loaded. Please refresh the page and try again.');
      return;
    }

    if (!profile?.email) {
      alert('Customer email is required for payment. Please ensure your profile is complete.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Generate unique payment reference
      const paymentReference = PaystackClient.generateReference();
      
      
      // Prepare payment data
      const paymentData = {
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: profile.email,
        amount: getTotal(),
        currency: 'NGN', // You can make this dynamic based on user's currency preference
        reference: paymentReference,
        callback: (response: any) => {
          
          
          // Handle the async operations in a separate function
          handlePaymentSuccess(paymentReference, response);
        },
                onClose: () => {
          
          setIsProcessing(false);
        },
        onError: (error: any) => {
          setIsProcessing(false);
          alert(`Payment failed: ${error?.message || 'Unknown error occurred'}`);
        }
      };

      // Validate payment config
      PaystackClient.validateConfig(paymentData);
      
      // Initialize Paystack payment
      PaystackClient.initializePayment(paymentData);
      
    } catch (error) {
      
      alert('Payment initialization failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Optimized authentication check - only show loading if truly needed
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated (no loading spinner)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Please log in to complete your purchase</p>
          <button 
            onClick={() => router.push('/login?redirect=/checkout')} 
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader products={[]} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                              <h2 className="text-xl font-semibold mb-6">
                  Welcome, {(() => {
                    
                    if (profile?.first_name && profile?.last_name) {
                      return `${profile.first_name} ${profile.last_name}`;
                    } else if (profile?.first_name) {
                      return profile.first_name;
                    } else if (profile?.email) {
                      return profile.email.split('@')[0]; // Use email prefix as fallback
                    } else {
                      return 'Customer';
                    }
                  })()}!
                    </h2>

              {/* Step 1: Purchase Type */}
              {currentStep === 1 && (
                      <div>
                  <h3 className="text-lg font-medium mb-4">Step 1: Purchase Type</h3>
                  <div className="space-y-3 mb-6">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer">
                      <input type="radio" name="purchaseType" value="site" checked={purchaseType === 'site'} onChange={(e) => setPurchaseType(e.target.value as 'site' | 'shipping')} className="mr-3" />
                      <div>
                        <p className="font-medium">Site Pickup (No Shipping)</p>
                        <p className="text-sm text-gray-600">Pick up from our local facility</p>
                      </div>
                        </label>
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer">
                      <input type="radio" name="purchaseType" value="shipping" checked={purchaseType === 'shipping'} onChange={(e) => setPurchaseType(e.target.value as 'site' | 'shipping')} className="mr-3" />
                      <div>
                        <p className="font-medium">Regular Shipping</p>
                        <p className="text-sm text-gray-600">We'll ship to your address</p>
                    </div>
                        </label>
                </div>
                  <div className="flex justify-end">
                    <button onClick={handleNextStep} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                      Continue
                    </button>
              </div>
                        </div>
              )}

              {/* Step 2: Address Selection (only for shipping) */}
              {currentStep === 2 && purchaseType === 'shipping' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Step 2: Shipping Address</h3>
                  
                  {/* Address Selection Options */}
                  <div className="space-y-4 mb-6">
                    {/* Use Default Profile Address */}
                    <div className="border rounded-lg p-4">
                      <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                          name="addressOption"
                          checked={useDefaultAddress}
                          onChange={() => {
                            setUseDefaultAddress(true);
                            setSelectedAddressId(null);
                            // Clear error when user selects default address
                            if (addressError) setAddressError(null);
                          }}
                          className="mr-3"
                        />
                        <div>
                          <p className="font-medium">Use My Default Address</p>
                          <p className="text-sm text-gray-600">
                            {profile?.address || 'No default address set'}
                        </p>
                      </div>
                      </label>
                    </div>

                    {/* Use Saved Address */}
                    {savedAddresses.length > 0 && (
                      <div className="border rounded-lg p-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="addressOption"
                            checked={!useDefaultAddress && !!selectedAddressId}
                            onChange={() => {
                              setUseDefaultAddress(false);
                              // Clear error when user selects saved address
                              if (addressError) setAddressError(null);
                            }}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <p className="font-medium">Use Saved Address</p>
                            <div className="mt-2 space-y-2">
                              {savedAddresses.map((address) => (
                                <div 
                                  key={address.id} 
                                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                                    selectedAddressId === address.id 
                                      ? 'border-blue-500 bg-blue-50' 
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => {
                                    setSelectedAddressId(address.id);
                                    setUseDefaultAddress(false);
                                  if (addressError) setAddressError(null);
                                }}
                                >
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      name="savedAddress"
                                      checked={selectedAddressId === address.id}
                                      onChange={() => {
                                        setSelectedAddressId(address.id);
                                        setUseDefaultAddress(false);
                                        if (addressError) setAddressError(null);
                                      }}
                                      className="mr-3"
                                    />
                                    <div>
                                      <p className="font-medium text-sm">
                                        {address.first_name} {address.last_name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {address.address_line_1}
                                        {address.address_line_2 && `, ${address.address_line_2}`}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {address.city}, {address.state} {address.postal_code}
                                      </p>
                                      {address.phone && (
                                        <p className="text-sm text-gray-500">{address.phone}</p>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Are you sure you want to delete this address?')) {
                                        deleteSavedAddress(address.id);
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1 rounded"
                                    title="Delete address"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                        </div>
                      </div>
                        </label>
                    </div>
                    )}

                    {/* Add Custom Address */}
                    <div className="border rounded-lg p-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="addressOption"
                          checked={!useDefaultAddress && !selectedAddressId}
                          onChange={() => {
                            setUseDefaultAddress(false);
                            setSelectedAddressId(null);
                            // Clear error when user selects custom address
                            if (addressError) setAddressError(null);
                          }}
                          className="mr-3"
                        />
                      <div>
                          <p className="font-medium">Add New Address</p>
                          <p className="text-sm text-gray-600">Enter a custom shipping address</p>
                        </div>
                        </label>
                    </div>
                  </div>

                  {/* Custom Address Form */}
                  {!useDefaultAddress && !selectedAddressId && (
                    <div className="border rounded-lg p-4 mb-6">
                      <h4 className="font-medium mb-4">Custom Address Details</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Fields marked with <span className="text-red-500">*</span> are required to continue.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">First Name</label>
                        <input
                          type="text"
                            value={customAddress.first_name}
                            onChange={(e) => setCustomAddress(prev => ({ ...prev, first_name: e.target.value }))}
                            className="w-full p-2 border rounded"
                            placeholder="First Name"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input
                          type="text"
                            value={customAddress.last_name}
                            onChange={(e) => setCustomAddress(prev => ({ ...prev, last_name: e.target.value }))}
                            className="w-full p-2 border rounded"
                            placeholder="Last Name"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Company (Optional)</label>
                        <input
                            type="text"
                            value={customAddress.company}
                            onChange={(e) => setCustomAddress(prev => ({ ...prev, company: e.target.value }))}
                            className="w-full p-2 border rounded"
                            placeholder="Company"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                            value={customAddress.phone}
                            onChange={(e) => setCustomAddress(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full p-2 border rounded"
                            placeholder="Phone"
                          />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">
                            Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                            value={customAddress.address_line_1}
                            onChange={(e) => {
                              setCustomAddress(prev => ({ ...prev, address_line_1: e.target.value }));
                              // Clear error when user starts typing
                              if (addressError) setAddressError(null);
                            }}
                            className="w-full p-2 border rounded"
                            placeholder="Street Address"
                            required
                        />
                      </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                          <input
                            type="text"
                            value={customAddress.address_line_2}
                            onChange={(e) => setCustomAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                            className="w-full p-2 border rounded"
                            placeholder="Apartment, suite, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={customAddress.city}
                            onChange={(e) => {
                              setCustomAddress(prev => ({ ...prev, city: e.target.value }));
                              // Clear error when user starts typing
                              if (addressError) setAddressError(null);
                            }}
                            className="w-full p-2 border rounded"
                            placeholder="City"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            State/Province <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={customAddress.state}
                            onChange={(e) => {
                              setCustomAddress(prev => ({ ...prev, state: e.target.value }));
                              // Clear error when user starts typing
                              if (addressError) setAddressError(null);
                            }}
                            className="w-full p-2 border rounded"
                            placeholder="State"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Postal Code</label>
                          <input
                            type="text"
                            value={customAddress.postal_code}
                            onChange={(e) => setCustomAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                            className="w-full p-2 border rounded"
                            placeholder="Postal Code"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Country</label>
                          <input
                            type="text"
                            value={customAddress.country}
                            onChange={(e) => setCustomAddress(prev => ({ ...prev, country: e.target.value }))}
                            className="w-full p-2 border rounded"
                            placeholder="Country"
                          />
                        </div>
                      </div>

                      {/* Save Address Button */}
                      <div className="mt-4">
                        <button
                          onClick={saveCustomAddress}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Save This Address
                        </button>
                        </div>
                      </div>
                  )}

                  {/* Address Requirement Message */}
                  {!useDefaultAddress && 
                   !selectedAddressId && 
                   !(customAddress.address_line_1 && customAddress.city && customAddress.state) && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Please provide a complete shipping address to continue. 
                        You need at least: Address Line 1, City, and State.
                      </p>
                      </div>
                  )}

                  {/* Address Error Message */}
                  {addressError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        ❌ {addressError}
                      </p>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <button onClick={handlePrevStep} className="border px-6 py-2 rounded-lg">
                      Back
                    </button>
                    <button 
                      onClick={handleNextStep} 
                      className={`px-6 py-2 rounded-lg ${
                        // Check if we have a valid address for shipping
                        (useDefaultAddress && profile?.address) || 
                        (selectedAddressId) || 
                        (customAddress.address_line_1 && customAddress.city && customAddress.state)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }`}
                      disabled={
                        !useDefaultAddress && 
                        !selectedAddressId && 
                        !(customAddress.address_line_1 && customAddress.city && customAddress.state)
                      }
                    >
                      Continue
                    </button>
                      </div>
                        </div>
                      )}

              {/* Step 3: Installation Options */}
              {currentStep === (purchaseType === 'shipping' ? 3 : 2) && (
                          <div>
                  <h3 className="text-lg font-medium mb-4">Step {purchaseType === 'shipping' ? '3' : '2'}: Installation Options</h3>
                  <div className="mb-6">
                    <label className="flex items-center mb-4">
                      <input type="checkbox" checked={installationRequired} onChange={(e) => setInstallationRequired(e.target.checked)} className="mr-3" />
                      <span>I need installation services</span>
                              </label>
                    {installationRequired && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {approvedQuote ? (
                                  <div className="text-center">
                            <div className="p-6 border-2 border-green-200 bg-green-50 rounded-lg">
                              <div className="flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                              </div>
                              <h4 className="text-lg font-semibold text-green-900 mb-2">Approved Installation Quote</h4>
                              <p className="text-2xl font-bold text-green-600 mb-2">
                                {formatCurrency(approvedQuote.amount)}
                              </p>
                              <p className="text-green-700 mb-4">
                                Your custom installation quote has been approved and is included in your order total.
                              </p>
                              {approvedQuote.notes && (
                                <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                                  <p className="text-sm text-green-800">
                                    <strong>Admin Notes:</strong><br/>
                                    {approvedQuote.notes}
                                  </p>
                                    </div>
                              )}
                                  </div>
                                </div>
                        ) : (
                          <div className="text-center">
                            <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-blue-600" />
                            </div>
                              <h4 className="text-lg font-semibold text-blue-900 mb-2">Custom Installation Quote</h4>
                              <p className="text-blue-700 mb-4">
                                Professional installation with personalized pricing based on your specific requirements
                              </p>
                              <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                  <strong>How it works:</strong><br/>
                                  1. Submit your installation requirements<br/>
                                  2. Admin reviews and provides quote<br/>
                                  3. You approve and proceed with payment
                                </p>
                          </div>
                            </div>
                          </div>
                              )}
                            </div>
                              )}
                          
                          {/* Custom Quote Request Form */}
                          {installationRequired && installationType === 'custom' && (
                            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="text-lg font-medium text-blue-800 mb-4">Custom Installation Quote Request</h4>
                              <p className="text-sm text-blue-600 mb-4">
                                Please provide details about your custom installation requirements. We'll contact you within 24 hours with a personalized quote.
                              </p>
                              
                              <div className="space-y-4">
                          <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Installation Requirements *
                            </label>
                            <textarea
                                    value={customQuoteRequest.requirements}
                                    onChange={(e) => setCustomQuoteRequest(prev => ({ ...prev, requirements: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                                    placeholder="Describe your installation needs (e.g., specific mounting requirements, site conditions, etc.)"
                                    required
                            />
                          </div>

                      <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Installation Location *
                                  </label>
                              <input
                                    type="text"
                                    value={customQuoteRequest.location}
                                    onChange={(e) => setCustomQuoteRequest(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="City, State (e.g., Lagos, Nigeria)"
                                    required
                                  />
                          </div>
                          
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Special Notes (Optional)
                              </label>
                                  <textarea
                                    value={customQuoteRequest.special_notes}
                                    onChange={(e) => setCustomQuoteRequest(prev => ({ ...prev, special_notes: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={2}
                                    placeholder="Any additional information that might help us provide an accurate quote"
                                  />
                            </div>
                                
                                <div className="flex gap-3">
                                  <button
                                    onClick={handleCustomQuoteSubmission}
                                    disabled={isSubmittingQuote || !customQuoteRequest.requirements || !customQuoteRequest.location}
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                  >
                                    {isSubmittingQuote ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting Quote Request...
                                      </>
                                    ) : (
                                      'Submit Quote Request'
                                    )}
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      setInstallationRequired(false);
                                    }}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                  >
                                    Skip Installation
                                  </button>
                          </div>
                          
                                <p className="text-xs text-blue-600">
                                  💡 You can continue with your order without installation and add it later once you receive your quote.
                                </p>
                            </div>
                          </div>
                          )}
                        </div>
                  <div className="flex justify-between">
                    <button onClick={handlePrevStep} className="border px-6 py-2 rounded-lg">
                      Back
                    </button>
                    <button 
                      onClick={handleNextStep} 
                      disabled={installationRequired && installationType === 'custom'}
                      className={`px-6 py-2 rounded-lg ${
                        installationRequired && installationType === 'custom'
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {installationRequired && installationType === 'custom' 
                        ? 'Submit Quote Request First' 
                        : 'Continue'
                      }
                    </button>
                      </div>
                    </div>
                      )}

              {/* Step 4: Payment */}
              {currentStep === (purchaseType === 'shipping' ? 4 : 3) && (
                      <div>
                  <h3 className="text-lg font-medium mb-4">Step {purchaseType === 'shipping' ? '4' : '3'}: Payment</h3>
                  <div className="mb-6">
                    <div className="space-y-3 mb-6">
                      {/* Paystack - Active Payment Method */}
                      <label className="flex items-center p-4 border-2 border-green-500 bg-green-50 rounded-lg cursor-pointer">
                            <input
                              type="radio"
                              name="paymentMethod"
                          value="paystack"
                          checked={paymentMethod === 'paystack'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'paystack' | 'card' | 'paypal')}
                          className="mr-3"
                        />
                        <div>
                          <p className="font-medium text-green-700">Paystack</p>
                          <p className="text-sm text-green-600">Secure payment with Paystack</p>
                          <p className="text-xs text-green-500 mt-1">✅ Currently Available</p>
                          </div>
                              </label>
                          
                      {/* Credit Card - Greyed Out */}
                      <label className="flex items-center p-4 border border-gray-300 bg-gray-100 rounded-lg cursor-not-allowed opacity-60">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                          disabled
                          className="mr-3 cursor-not-allowed"
                        />
                        <div>
                          <p className="font-medium text-gray-500">Credit/Debit Card</p>
                          <p className="text-sm text-gray-400">Pay securely with your card</p>
                          <p className="text-xs text-gray-400 mt-1">🚧 Coming Soon</p>
                              </div>
                            </label>
                          
                      {/* PayPal - Greyed Out */}
                      <label className="flex items-center p-4 border border-gray-300 bg-gray-100 rounded-lg cursor-not-allowed opacity-60">
                        <input
                              type="radio"
                              name="paymentMethod"
                              value="paypal"
                          disabled
                          className="mr-3 cursor-not-allowed"
                        />
                        <div>
                          <p className="font-medium text-gray-500">PayPal</p>
                          <p className="text-sm text-gray-400">Pay with your PayPal account</p>
                          <p className="text-xs text-gray-400 mt-1">🚧 Coming Soon</p>
                              </div>
                        </label>
                      </div>

                    {/* Paystack Payment Info */}
                    {paymentMethod === 'paystack' && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">P</span>
                        </div>
                          <div>
                            <h4 className="font-medium text-green-800">Paystack Payment</h4>
                            <p className="text-sm text-green-600">Secure payment gateway for Africa</p>
                          </div>
                        </div>
                        <div className="text-sm text-green-700 space-y-2">
                          <p>• Accepts all major cards (Visa, Mastercard, Verve)</p>
                          <p>• Bank transfers and USSD payments</p>
                          <p>• Mobile money (Ghana, Kenya, Rwanda)</p>
                          <p>• Instant payment confirmation</p>
                      </div>
                        <div className="mt-4 p-3 bg-white border border-green-200 rounded">
                          <p className="text-xs text-green-600">
                            <strong>Note:</strong> You will be redirected to Paystack's secure payment page after clicking "Complete Purchase".
                            </p>
                    </div>
                        </div>
                    )}
                      </div>
                  <div className="flex justify-between">
                    <button onClick={handlePrevStep} className="border px-6 py-2 rounded-lg">
                      Back
                  </button>
                    <button 
                      onClick={handlePaymentSubmit} 
                      disabled={isProcessing || !isShippingAvailable() || authLoading || !profile} 
                      className="bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing Payment...
                        </>
                      ) : authLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading Profile...
                        </>
                      ) : !profile ? (
                        'Profile Required'
                      ) : (
                        'Complete Purchase with Paystack'
                      )}
                    </button>
                </div>
                
                {/* Shipping unavailable message */}
                {purchaseType === 'shipping' && !isShippingAvailable() && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Cannot proceed with checkout</span>
                    </div>
                    <p className="mt-2 text-sm text-red-600">
                      {getShippingFailureMessage()}
                    </p>
                  </div>
                )}
              </div>
                  )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
              
                <div className="space-y-4 mb-6">
                {(() => {
                  return null;
                })()}
                {productsLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading cart items...</p>
                  </div>
                ) : approvedQuote ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-medium text-green-700">Custom Installation Quote</p>
                    <p className="text-sm text-gray-500">Approved installation service</p>
                  </div>
                ) : products.length > 0 ? (
                  products.map((product) => {
                    const cartItem = cartItems.find(item => item.id === product.id);
                    
                    
                    return (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image && product.image !== '/images/placeholder.jpg' ? (
                          <img 
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">{product.name.charAt(0).toUpperCase()}</span>
                        </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-500">Qty: {cartItem?.quantity || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(product.price * (cartItem?.quantity || 0))}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No items in cart</p>
                    <button 
                      onClick={() => router.push('/cart')}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      Go to Cart
                    </button>
                </div>
                )}
                  </div>
                  
              <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                    </div>
                {installationRequired && (
                    <div className="flex justify-between text-sm">
                    <span>Installation</span>
                    <span>
                      {approvedQuote ? (
                        <span className="text-green-600 font-medium">{formatCurrency(approvedQuote.amount)}</span>
                      ) : installationType === 'custom' ? (
                        <span className="text-blue-600 font-medium">Custom Quote</span>
                      ) : (
                        formatCurrency(getInstallationCost())
                      )}
                    </span>
                    </div>
                  )}
                  {/* Multi-vendor shipping breakdown */}
                  {purchaseType === 'shipping' && shippingBreakdown && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Shipping</span>
                        <span>{formatCurrency(shippingBreakdown.total_shipping_amount)}</span>
                      </div>
                      {shippingBreakdown.calculations.map((calc, index) => (
                        <div key={calc.supplier_id} className="ml-4 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>{calc.supplier_name}</span>
                            <span>{formatCurrency(calc.shipping_amount)}</span>
                          </div>
                          <div className="text-gray-500">
                            {calc.shipping_method} • {calc.estimated_days_min}-{calc.estimated_days_max} days
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Fallback for site pickup or loading */}
                  {purchaseType === 'site' && (
                  <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                      <span>Free (Site Pickup)</span>
                  </div>
                  )}
                  
                  {purchaseType === 'shipping' && shippingLoading && (
                  <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Calculating...
                      </span>
                  </div>
                  )}
                  
                  {purchaseType === 'shipping' && !shippingLoading && (!shippingBreakdown || !isShippingAvailable()) && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span className="text-red-600 font-medium">Not Available</span>
                      </div>
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        <div className="font-medium">Shipping not available</div>
                        <div className="mt-1">
                          {getShippingFailureMessage()}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>VAT</span>
                    {(() => {
                      if (taxLoading) {
                        return <span className="text-gray-500">Calculating...</span>;
                      } else if (taxCalculation) {
                        const taxAmount = getTax();
                        const formatted = formatCurrency(taxAmount);
                        return (
                          <div className="text-right">
                            <span>{formatted}</span>
                            <div className="text-xs text-gray-500">
                              ({taxCalculation.vat_rate}%)
                              {taxCalculation.is_exempt && ' - Exempt'}
                              {taxCalculation.calculation_method === 'tax_inclusive' && ' - Inclusive'}
                            </div>
                          </div>
                        );
                      } else {
                        const taxAmount = getTax();
                        const formatted = formatCurrency(taxAmount);
                        return <span>{formatted}</span>;
                      }
                    })()}
                  </div>
                  
                  {/* Platform Fees */}
                  {revenueBreakdown && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Platform Fee</span>
                        <span>{formatCurrency(revenueBreakdown.platform_fee_amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Payment Processing</span>
                        <span>{formatCurrency(revenueBreakdown.payment_processing_fee)}</span>
                      </div>
                      <div className="ml-4 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Commission ({revenueBreakdown.commission_amount > 0 ? ((revenueBreakdown.commission_amount / revenueBreakdown.subtotal) * 100).toFixed(1) : 0}%)</span>
                          <span>{formatCurrency(revenueBreakdown.commission_amount)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {revenueLoading && (
                    <div className="flex justify-between text-sm">
                      <span>Platform Fees</span>
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Calculating...
                      </span>
                    </div>
                  )}
                <div className="flex justify-between text-lg font-semibold border-t pt-3">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(getTotal())}</span>
                  </div>
                </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
