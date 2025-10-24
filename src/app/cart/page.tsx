"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartWishlist } from '@/components/providers/Providers';
import { supabase } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  Package,
  Star,
  Eye,
  Minus,
  Plus,
  Heart,
  CreditCard,
  Truck,
  Shield,
  ArrowRight
} from 'lucide-react';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';

// Real products will be fetched from the database

export default function CartPage() {
  const { cartItems, updateCartQuantity, removeFromCart, addToCart, toggleWishlist, isInWishlist } = useCartWishlist();
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  // Fetch real products from database
  useEffect(() => {
    const fetchProducts = async () => {
      // Don't return early if no user - cart works for guests too
      if (cartItems.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        // Don't show loading if we already have products (prevents unnecessary loading on tab return)
        if (products.length === 0) {
          setLoading(true);
        }
        setError(null);
        
        
        // Get unique product IDs from cart items
        const productIds = Array.from(new Set(cartItems.map(item => item.id)));
        
        // Fetch all products that are in the cart (works for both logged-in and guest users)
        const { data: productsData, error: productsError } = await supabase
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
            category,
            brand,
            stock_quantity
          `)
          .eq('status', 'active')
          .in('id', productIds);
        
        if (productsError) {
          console.error('❌ Error fetching products:', productsError);
          setError('Failed to fetch products');
          return;
        }
        
        
        // Transform the data to match the expected format
        const transformedProducts = productsData?.map((product: any) => ({
          id: product.id,
          name: product.name,
          category: product.category || 'Unknown',
          price: product.price,
          comparePrice: product.compare_price || 0,
          rating: product.rating || 0,
          reviews: product.review_count || 0,
          image: product.images?.[0] || '/images/placeholder.jpg',
          description: product.description || '',
          stock: product.stock_quantity || 0
        })) || [];
        
        setProducts(transformedProducts);
        
      } catch (err) {
        console.error('❌ Error in fetchProducts:', err);
        setError('Failed to fetch products data');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user?.id, cartItems]);

  const cartProducts = products.filter(product => 
    cartItems.some(item => item.id === product.id)
  ).map(product => {
    const cartItem = cartItems.find(item => item.id === product.id);
    return {
      ...product,
      quantity: cartItem?.quantity || 0
    };
  });

  const subtotal = cartProducts.reduce((total, product) => 
    total + (product.price * product.quantity), 0
  );
  const shipping = subtotal > 0 ? 29.99 : 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    setUpdatingItem(productId);
    // Find the product to get its stock information
    const product = products.find(p => p.id === productId);
    // Simulate API call delay
    setTimeout(() => {
      updateCartQuantity(productId, newQuantity, product?.stock);
      setUpdatingItem(null);
    }, 300);
  };

  const handleRemoveFromCart = (productId: number) => {
    removeFromCart(productId);
  };

  const handleMoveToWishlist = (productId: number) => {
    toggleWishlist(productId);
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    // Check if user is authenticated
    if (!user || !profile) {
      // User not logged in, redirect to login page
      router.push('/login?redirect=/checkout');
      return;
    }

    // User is authenticated, proceed to checkout
    router.push('/checkout');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <ShoppingCart className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Package className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
          </div>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to find the perfect solar products for your needs.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Package className="w-5 h-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UnifiedHeader products={products} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {cartProducts.length} item{cartProducts.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Package className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cart Items</h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartProducts.map((product) => (
                  <div key={product.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                        <img 
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/80x80/1e40af/ffffff?text=Solar`;
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {product.category}
                            </p>
                            <div className="flex items-center mt-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                                {product.rating} ({product.reviews} reviews)
                              </span>
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right sm:text-right flex-shrink-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                ₦{product.price.toFixed(2)}
                              </span>
                              {product.comparePrice && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                  ₦{product.comparePrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              ${(product.price * product.quantity).toFixed(2)} total
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                              <button
                                onClick={() => handleUpdateQuantity(product.id, Math.max(1, product.quantity - 1))}
                                disabled={updatingItem === product.id || product.quantity <= 1}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-3 py-2 text-gray-900 dark:text-white font-medium">
                                {product.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)}
                                disabled={updatingItem === product.id || product.quantity >= product.stock}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {product.stock} in stock
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              onClick={() => handleMoveToWishlist(product.id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Move to wishlist"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveFromCart(product.id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Remove from cart"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">₦{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-white">₦{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-900 dark:text-white">₦{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">₦{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </button>

                {/* Security & Shipping Info */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4 mr-2" />
                    Secure checkout
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Truck className="w-4 h-4 mr-2" />
                    Fast shipping
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {products.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">You might also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700">
                    <img 
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/300x200/1e40af/ffffff?text=Solar`;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₦{product.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
} 