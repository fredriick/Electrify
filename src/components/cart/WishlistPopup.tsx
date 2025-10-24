'use client';

import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  comparePrice?: number;
  image: string;
  category: string;
}

interface WishlistPopupProps {
  wishlistItems: number[];
  products: any[];
  onRemoveFromWishlist: (productId: number) => void;
  onAddToCart: (productId: number) => void;
  onClose: () => void;
}

export function WishlistPopup({ 
  wishlistItems, 
  products, 
  onRemoveFromWishlist, 
  onAddToCart, 
  onClose 
}: WishlistPopupProps) {
  const { formatCurrency } = useCurrency();
  const wishlistProducts = products.filter(product => wishlistItems.includes(product.id));

  const handleMoveToCart = (productId: number) => {
    onAddToCart(productId);
    onRemoveFromWishlist(productId);
  };

  if (wishlistProducts.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Your wishlist is empty
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Start adding products to your wishlist to save them for later
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
        {wishlistProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="block" onClick={onClose}>
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img 
                  src={product.image_url || product.image || `https://via.placeholder.com/64x64/1e40af/ffffff?text=Solar`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/64x64/1e40af/ffffff?text=Solar`;
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {product.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
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
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMoveToCart(product.id);
                  }}
                  className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="Move to cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveFromWishlist(product.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClose}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            View All
          </button>
        </div>
      </div>
    </div>
  );
} 
 
 
 
 