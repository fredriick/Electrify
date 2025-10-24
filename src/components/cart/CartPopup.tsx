'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getSupabaseClient } from '@/lib/auth';
import { 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus 
} from 'lucide-react';

interface CartPopupProps {
  cartItems: {id: number, quantity: number, stock?: number}[];
  products: any[];
  onUpdateQuantity: (productId: number, quantity: number, stock?: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onClose: () => void;
}

export function CartPopup({ 
  cartItems, 
  products, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onClose 
}: CartPopupProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [fetchedProducts, setFetchedProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [updatingQuantities, setUpdatingQuantities] = useState<Set<number>>(new Set());
  
  // Use provided products or fetch them if empty
  const allProducts = products.length > 0 ? products : fetchedProducts;
  
  // Fetch products if not provided and we have cart items
  useEffect(() => {
    const fetchCartProducts = async () => {
      // Don't fetch if we already have products or no cart items
      if (products.length > 0 || cartItems.length === 0) return;
      
      // Don't fetch if we already have fetched products for these items
      const currentProductIds = cartItems.map(item => item.id).sort();
      const fetchedProductIds = fetchedProducts.map(p => p.id).sort();
      if (JSON.stringify(currentProductIds) === JSON.stringify(fetchedProductIds)) {
        return;
      }
      
      setIsLoadingProducts(true);
      try {
        const supabase = getSupabaseClient();
        const productIds = cartItems.map(item => item.id);
        
        const { data: cartProducts, error } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);
        
        if (error) {
          console.error('Error fetching cart products:', error);
        } else {
          // Transform the data to match the expected format
          const transformedProducts = cartProducts?.map((product: any) => ({
            id: product.id,
            name: product.name,
            category: product.categories?.name || 'Unknown',
            price: product.price,
            comparePrice: product.compare_price || 0,
            rating: product.rating || 0,
            reviews: product.review_count || 0,
            image: product.images?.[0] || '/images/placeholder.jpg',
            description: product.description || '',
            stock: product.stock_quantity || 0, // Transform stock_quantity to stock
            supplier_id: product.supplier_id,
            weight_kg: product.weight || 0
          })) || [];
          
          setFetchedProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Error fetching cart products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    fetchCartProducts();
  }, [JSON.stringify(cartItems.map(item => item.id).sort()), products.length]);
  
  const cartProducts = allProducts.filter(product => 
    cartItems.some(item => item.id === product.id)
  );

  const getCartItemQuantity = (productId: number) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalPrice = () => {
    return cartProducts.reduce((total, product) => {
      const quantity = getCartItemQuantity(product.id);
      return total + (product.price * quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Wrapper function to handle quantity updates with loading state
  const handleUpdateQuantity = async (productId: number, quantity: number, stock?: number) => {
    setUpdatingQuantities(prev => new Set(prev).add(productId));
    
    try {
      await onUpdateQuantity(productId, quantity, stock);
    } finally {
      // Remove loading state after a short delay to prevent flickering
      setTimeout(() => {
        setUpdatingQuantities(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }, 200);
    }
  };

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if authentication is still loading
    if (authLoading) {
      // Still loading, wait a bit and try again
      setTimeout(() => {
        handleCheckout(e);
      }, 500);
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      // User not logged in, redirect to login page
      onClose(); // Close the cart popup
      router.push('/login?redirect=/checkout');
      return;
    }

    // User is authenticated, proceed to checkout (profile is optional for checkout)
    onClose(); // Close the cart popup
    router.push('/checkout');
  };

  if (isLoadingProducts) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading cart items...</p>
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Start shopping to add items to your cart
        </p>
        <button
          onClick={onClose}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-4">
        {cartProducts.map((product) => {
          const quantity = getCartItemQuantity(product.id);
          return (
            <Link key={product.id} href={`/products/${product.id}`} className="block" onClick={onClose}>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                {/* Main Product Row */}
                <div className="flex items-start gap-4 mb-3">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {(() => {
                      // Try multiple possible image fields
                      const imageUrl = product.image_url || product.imageUrl || product.image || product.images?.[0];
                      
                      if (imageUrl) {
                        return (
                          <img 
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        );
                      }
                      
                      // Fallback: Show product initial
                      return (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-medium">
                          {product.name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {product.category}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          {formatCurrency(product.comparePrice)}
                        </span>
                      )}
                    </div>
                    {product.stock !== undefined && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.stock > 0 ? (
                          quantity >= product.stock ? (
                            <span className="text-orange-600 dark:text-orange-400">
                              Max quantity reached ({product.stock} available)
                            </span>
                          ) : (
                            `${product.stock} in stock`
                          )
                        ) : (
                          <span className="text-red-600 dark:text-red-400">
                            Out of stock
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quantity:</span>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 px-2 py-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpdateQuantity(product.id, quantity - 1, product.stock);
                        }}
                        className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity <= 1 || updatingQuantities.has(product.id)}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                        {updatingQuantities.has(product.id) ? '...' : quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpdateQuantity(product.id, quantity + 1, product.stock);
                        }}
                        className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={product.stock !== undefined && product.stock > 0 && quantity >= product.stock || updatingQuantities.has(product.id)}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveFromCart(product.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(getTotalPrice())}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 
 
 