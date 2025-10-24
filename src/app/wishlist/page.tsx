"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartWishlist } from '@/components/providers/Providers';
import { supabase } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  Package,
  Star,
  Eye
} from 'lucide-react';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';

// Real products will be fetched from the database

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist, addToCart } = useCartWishlist();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<number | null>(null);

  // Fetch real products from database
  useEffect(() => {
    const fetchProducts = async () => {
      // Don't return early if no user - cart/wishlist works for guests too
      if (wishlistItems.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        // Don't show loading if we already have products (prevents unnecessary loading on tab return)
        if (products.length === 0) {
          setLoading(true);
        }
        setError(null);
        
        
        // Fetch all products that are in the wishlist (works for both logged-in and guest users)
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
            brand
          `)
          .eq('status', 'active')
          .in('id', wishlistItems);
        
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
          description: product.description || ''
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
  }, [user?.id, wishlistItems]);

  const wishlistProducts = products.filter(product => wishlistItems.includes(product.id));

  const handleRemoveFromWishlist = (productId: number) => {
    setRemovingItem(productId);
    // Simulate API call delay
    setTimeout(() => {
      toggleWishlist(productId);
      setRemovingItem(null);
    }, 300);
  };

  const handleMoveToCart = (productId: number) => {
    addToCart(productId);
    toggleWishlist(productId);
  };

  const handleRemoveAll = () => {
    wishlistItems.forEach(productId => {
      toggleWishlist(productId);
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UnifiedHeader products={products} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Heart className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading wishlist...</p>
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
        <UnifiedHeader products={products} />
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

  if (wishlistProducts.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
          </div>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start adding products to your wishlist to save them for later. You can add items from our marketplace and they'll appear here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Package className="w-5 h-5 mr-2" />
              Browse Products
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRemoveAll}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Remove All
              </button>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                <Package className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/300x200/1e40af/ffffff?text=Solar`;
                  }}
                />
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    disabled={removingItem === product.id}
                    className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                    {product.category}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ₦{product.price.toFixed(2)}
                    </span>
                    {product.comparePrice && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        ₦{product.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                  <button
                    onClick={() => handleMoveToCart(product.id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Need help finding the right solar products?
          </p>
          <Link
            href="/contact"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            Contact our experts
          </Link>
        </div>

      </div>
    </div>
  );
} 