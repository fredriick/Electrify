'use client';

import { useState } from 'react';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield, 
  RotateCcw, 
  Check,
  ChevronLeft,
  Share2,
  MessageCircle,
  Package,
  Zap,
  Battery,
  Settings,
  Trash,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useCartWishlist } from '@/components/providers/Providers';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Review {
  id: number;
  user: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  brand: string;
  efficiency?: string;
  capacity?: string;
  warranty: string;
  warrantyTerms?: string;
  deliveryFee?: string;
  deliveryRange?: string;
  deliveryTimeStart?: string;
  deliveryTimeEnd?: string;
  inStock: boolean;
  stock?: number; // Available stock quantity
  isNew: boolean;
  isFeatured?: boolean;
  description: string;
  specifications: Record<string, string>;
  features: string[];
  images: string[];
  reviews: Review[];
}

interface ProductDetailProps {
  product: Product;
  allProducts?: Product[];
  onAddToCart?: (productId: number) => void;
  onToggleWishlist?: (productId: number) => void;
  isInWishlist?: (productId: number) => boolean;
}

export function ProductDetail({ product, allProducts = [], onAddToCart, onToggleWishlist, isInWishlist }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [localWishlist, setLocalWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [imageLoading, setImageLoading] = useState(true);
  const { cartItems, addToCart, updateCartQuantity, removeFromCart, toggleWishlist, isInWishlist: contextIsInWishlist } = useCartWishlist();
  const cartItem = cartItems.find(item => item.id === product.id);
  const { formatCurrency } = useCurrency();

  const handleAddToCart = () => {
    if (onAddToCart) {
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product.id);
      }
    } else {
      // fallback: local only
      console.log(`Added ${quantity} of ${product.name} to cart`);
    }
  };

  const handleToggleWishlist = () => {
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    } else {
      setLocalWishlist(!localWishlist);
    }
  };

  const wishlistStatus = isInWishlist ? isInWishlist(product.id) : localWishlist;

  const handleImageChange = (index: number) => {
    setImageLoading(true);
    setSelectedImage(index);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'solar panels':
        return Package;
      case 'inverters':
        return Zap;
      case 'batteries':
        return Battery;
      default:
        return Settings;
    }
  };

  const CategoryIcon = getCategoryIcon(product.category);

  // Find similar products (same category, different brand, or same brand, different category)
  const getSimilarProducts = () => {
    if (allProducts.length === 0) return [];
    
    return allProducts
      .filter(p => p.id !== product.id) // Exclude current product
      .filter(p => 
        p.category === product.category || // Same category
        p.brand === product.brand // Same brand
      )
      .sort((a, b) => {
        // Prioritize same category AND brand
        const aScore = (a.category === product.category ? 2 : 0) + (a.brand === product.brand ? 1 : 0);
        const bScore = (b.category === product.category ? 2 : 0) + (b.brand === product.brand ? 1 : 0);
        return bScore - aScore;
      })
      .slice(0, 4); // Show max 4 similar products
  };

  const similarProducts = getSimilarProducts();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
              Home
            </Link>
            <ChevronLeft className="w-4 h-4" />
            <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
              {product.category}
            </Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              )}
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/600x600/1e40af/ffffff?text=${encodeURIComponent(product.name)}`;
                }}
                onLoad={handleImageLoad}
                style={{ opacity: imageLoading ? 0 : 1 }}
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={`${product.id}-${index}`}
                  onClick={() => handleImageChange(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === index
                      ? 'border-primary-600 ring-2 ring-primary-200'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/150x150/1e40af/ffffff?text=${encodeURIComponent(product.name)}`;
                    }}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6 relative">
            {/* Wishlist Icon Top Right */}
            <button
              onClick={() => (isInWishlist ? onToggleWishlist?.(product.id) : toggleWishlist(product.id))}
              className={`absolute top-0 right-0 p-3 rounded-full shadow bg-white dark:bg-gray-800 border transition-colors z-10
                ${
                  (isInWishlist ? isInWishlist(product.id) : contextIsInWishlist(product.id))
                    ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-red-600 dark:hover:text-red-400'
                }
              `}
              title="Add to Wishlist"
            >
              <Heart className={`w-6 h-6 ${(isInWishlist ? isInWishlist(product.id) : contextIsInWishlist(product.id)) ? 'fill-current' : ''}`} />
            </button>
            {/* Category and Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CategoryIcon className="w-4 h-4" />
                {product.category}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Brand: <span className="font-medium text-gray-900 dark:text-white">{product.brand}</span>
              </div>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
              {product.comparePrice && (
                <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-medium">
                  Save {formatCurrency(product.comparePrice - product.price)}
                </span>
              )}
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {product.efficiency && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{product.efficiency}</p>
                </div>
              )}
              {product.capacity && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Capacity</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{product.capacity}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Warranty</span>
                <p className="font-semibold text-gray-900 dark:text-white">{product.warranty}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Availability</span>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </p>
                {product.stock !== undefined && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.stock} available
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity:
                </label>
                {cartItem ? (
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2">
                    {cartItem.quantity > 1 ? (
                      <>
                        <button
                          onClick={() => updateCartQuantity(product.id, cartItem.quantity - 1, product.stock)}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1, product.stock)}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={product.stock !== undefined && cartItem.quantity >= product.stock}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                          title="Remove from cart"
                        >
                          <Trash className="w-4 h-4" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-red-200 text-red-600 transition-colors"
                          title="Remove from cart"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1, product.stock)}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={product.stock !== undefined && cartItem.quantity >= product.stock}
                        >
                          +
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product.id, product.stock)}
                    disabled={!product.inStock || (product.stock !== undefined && product.stock <= 0)}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {!product.inStock || (product.stock !== undefined && product.stock <= 0) ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shipping Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.deliveryFee && parseFloat(product.deliveryFee) > 0 
                    ? `Delivery fee: ${formatCurrency(parseFloat(product.deliveryFee))}`
                    : 'Free delivery'
                  }
                  {product.deliveryRange && ` (${product.deliveryRange})`}
                </span>
                <Link 
                  href="/shipping-policy" 
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                >
                  Details
                </Link>
              </div>
              {product.deliveryTimeStart && product.deliveryTimeEnd && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Delivery available {product.deliveryTimeStart} - {product.deliveryTimeEnd}
                    {product.deliveryTimeStart && (
                      <span className="block text-xs text-gray-500 mt-1">
                        Orders placed 6+ hours before {product.deliveryTimeStart} will be delivered same day
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.warranty} warranty included
                </span>
                <Link 
                  href="/warranty-policy" 
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                >
                  Details
                </Link>
              </div>
              {product.warrantyTerms && (
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.warrantyTerms}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-gray-400" />
                <Link 
                  href="/return-policy" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 underline"
                >
                  30-day return policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {product.description}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  This high-quality solar product is designed to provide reliable and efficient energy generation for your home or business. 
                  With advanced technology and robust construction, it offers excellent performance and durability in various environmental conditions.
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{key}</span>
                    <span className="text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Customer Reviews ({product.reviews.length})
                  </h3>
                  <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                    <MessageCircle className="w-4 h-4" />
                    Write a Review
                  </button>
                </div>

                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{review.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{review.user}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Similar Products
              </h2>
              <Link 
                href="/" 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                View All Products →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <Link key={similarProduct.id} href={`/products/${similarProduct.id}`} className="block">
                  <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <img 
                        src={similarProduct.image}
                        alt={similarProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/400x400/1e40af/ffffff?text=${encodeURIComponent(similarProduct.name)}`;
                        }}
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {similarProduct.isNew && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            New
                          </span>
                        )}
                        {!similarProduct.inStock && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      {/* Category */}
                      <div className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">
                        {similarProduct.category}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                        {similarProduct.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(similarProduct.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({similarProduct.reviewCount})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(similarProduct.price)}
                        </span>
                        {similarProduct.comparePrice && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            {formatCurrency(similarProduct.comparePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 