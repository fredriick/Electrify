'use client';

import { Star, Heart, ShoppingCart, Trash, Package } from 'lucide-react';
import Link from 'next/link';
import { useCartWishlist } from '@/components/providers/Providers';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Product {
  id: number;
  name: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  efficiency?: string;
  capacity?: string;
  warranty: string;
  inStock: boolean;
  isNew: boolean;
  isFeatured?: boolean;
  material?: string;
  stock?: number; // Available stock quantity
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist, cartItems, updateCartQuantity, removeFromCart } = useCartWishlist();
  const { formatCurrency, convertCurrency, currentCurrency, baseCurrency } = useCurrency();
  
  // Convert prices to user's selected currency
  const convertedPrice = currentCurrency === baseCurrency 
    ? product.price 
    : convertCurrency(product.price, baseCurrency, currentCurrency) || product.price;
    
  const convertedComparePrice = product.comparePrice && currentCurrency !== baseCurrency
    ? convertCurrency(product.comparePrice, baseCurrency, currentCurrency) || product.comparePrice
    : product.comparePrice;
  
  const cartItem = cartItems.find(item => item.id === product.id);

  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product.id}`} className="block">
        <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer">
          <div className="flex flex-col sm:flex-row">
            {/* Product Image */}
            <div className="relative w-full sm:w-48 h-48 sm:h-48 bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
              {product.image ? (
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="hidden absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    New
                  </span>
                )}
                {!product.inStock && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  {/* Category */}
                  <div className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">
                    {product.category}
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      ({product.reviewCount})
                    </span>
                  </div>

                  {/* Specifications */}
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                    {product.efficiency && (
                      <div>Efficiency: {product.efficiency}</div>
                    )}
                    {product.capacity && (
                      <div>Capacity: {product.capacity}</div>
                    )}
                    <div>Warranty: {product.warranty}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-col sm:text-right sm:ml-6 mt-4 sm:mt-0">
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(convertedPrice)}
                    </span>
                    {convertedComparePrice && (
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                        {formatCurrency(convertedComparePrice)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className={`p-2 rounded-lg border transition-colors ${
                        isInWishlist(product.id)
                          ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400'
                          : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-red-600 dark:hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </button>
                    {cartItem ? (
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateCartQuantity(product.id, cartItem.quantity - 1, product.stock);
                          }}
                          className={`bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded ${cartItem.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={cartItem.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-2 font-medium text-sm">{cartItem.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateCartQuantity(product.id, cartItem.quantity + 1, product.stock);
                          }}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm"
                          disabled={product.stock !== undefined && cartItem.quantity >= product.stock}
                        >
                          +
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFromCart(product.id);
                          }}
                          className="ml-auto text-red-600 hover:text-red-800 p-1"
                          title="Remove from cart"
                        >
                          <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={!product.inStock || (product.stock !== undefined && product.stock <= 0)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(product.id, product.stock);
                        }}
                        className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 sm:px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base flex-1"
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                        {!product.inStock || (product.stock !== undefined && product.stock <= 0) ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // grid view
  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {product.image ? (
            <img 
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Fallback placeholder for broken images */}
          <div className="hidden absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                New
              </span>
            )}
            {!product.inStock && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Out of Stock
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow ${
                isInWishlist(product.id)
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4">
          {/* Category */}
          <div className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">
            {product.category}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm sm:text-base">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              ({product.reviewCount})
            </span>
          </div>

          {/* Specifications */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-1">
            {product.efficiency && (
              <div>Efficiency: {product.efficiency}</div>
            )}
            <div>Warranty: {product.warranty}</div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(convertedPrice)}
            </span>
            {convertedComparePrice && (
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                {formatCurrency(convertedComparePrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {cartItem ? (
            <div className="flex items-center gap-2 w-full">
              {cartItem.quantity > 1 ? (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateCartQuantity(product.id, cartItem.quantity - 1, product.stock);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm"
                  >
                    -
                  </button>
                  <span className="px-2 font-medium text-sm">{cartItem.quantity}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateCartQuantity(product.id, cartItem.quantity + 1, product.stock);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm"
                    disabled={product.stock !== undefined && cartItem.quantity >= product.stock}
                  >
                    +
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromCart(product.id);
                    }}
                    className="ml-2 text-red-600 hover:text-red-800"
                    title="Remove from cart"
                  >
                    <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="sr-only">Remove</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromCart(product.id);
                    }}
                    className="bg-gray-200 hover:bg-red-200 text-red-600 px-2 py-1 rounded"
                    title="Remove from cart"
                  >
                    <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <span className="px-2 font-medium text-sm">{cartItem.quantity}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateCartQuantity(product.id, cartItem.quantity + 1, product.stock);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm"
                    disabled={product.stock !== undefined && cartItem.quantity >= product.stock}
                  >
                    +
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              disabled={!product.inStock || (product.stock !== undefined && product.stock <= 0)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product.id, product.stock);
              }}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 sm:px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
              {!product.inStock || (product.stock !== undefined && product.stock <= 0) ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
} 
 
 
 
 
 