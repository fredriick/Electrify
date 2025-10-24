'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Zap,
  Battery,
  Settings,
  ShoppingCart,
  Heart,
  Menu,
  LogOut,
  Settings as SettingsIcon,
  Store,
  Wrench
} from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGrid } from '@/components/products/ProductGrid';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { useCartWishlist } from '@/components/providers/Providers';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/lib/auth';

// Category icons mapping
const categoryIcons = {
  'Solar Panels': Package,
  'Inverters': Zap,
  'Batteries': Battery,
  'Mounting Systems': Settings,
  'Monitoring Systems': Settings,
  'Accessories': Package
};

const wattageRanges = [
  '100W - 200W',
  '200W - 300W',
  '300W - 400W',
  '400W - 500W',
  '500W+'
];

const efficiencyRanges = [
  '15% - 18%',
  '18% - 20%',
  '20% - 22%',
  '22% - 25%',
  '25%+'
];

const priceRanges = [
  { label: 'Under ₦100', min: 0, max: 100 },
  { label: '₦100 - ₦500', min: 100, max: 500 },
  { label: '₦500 - ₦1000', min: 500, max: 1000 },
  { label: '₦1000 - ₦5000', min: 1000, max: 5000 },
  { label: '₦5000+', min: 5000, max: Infinity }
];

export default function HomePage() {
  const { user, profile } = useAuth();
  const { formatCurrency } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedWattages, setSelectedWattages] = useState<string[]>([]);
  const [selectedEfficiencies, setSelectedEfficiencies] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [visibleProducts, setVisibleProducts] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [showHero, setShowHero] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  
  // Real data state
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Handle search from URL parameters
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    setSearchTerm(searchQuery || '');
  }, [searchParams]);

  // Auto-redirect suppliers to dashboard
  useEffect(() => {
    const checkAndRedirect = () => {
      if (user && profile?.role === 'SUPPLIER') {
        router.push('/dashboard');
      }
    };

    const timer = setTimeout(checkAndRedirect, 1000);
    return () => clearTimeout(timer);
  }, [user, profile, router]);

  // Fetch real data from database
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setDataLoading(true);
        setDataError(null);
        
        // Fetch categories with product counts from the categories table
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select(`
            id,
            name
          `)
          .order('name');  // Order by name to group duplicates together
        
        if (categoriesError) {
          console.error('❌ Error fetching categories:', categoriesError);
          setDataError('Failed to fetch categories');
          return;
        }
        
        // Remove duplicate categories by name (keep only unique names)
        const uniqueCategories = categoriesData?.filter((category: any, index: number, self: any[]) => 
          index === self.findIndex((c: any) => c.name === category.name)
        ) || [];
        
        // Get product counts for each category using the direct category field
        const categoriesWithCounts = await Promise.all(
          uniqueCategories?.map(async (category: any) => {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('category', category.name)  // Use direct category field instead of category_id
              .eq('is_active', true)
              .eq('is_approved', true);
            
            return {
              name: category.name,
              icon: categoryIcons[category.name as keyof typeof categoryIcons] || Package,
              count: count || 0
            };
          }) || []
        );
        
        // Transform categories data
        const transformedCategories = categoriesWithCounts;
        
        setCategories(transformedCategories);
        
        // Fetch brands from products
        const { data: brandsData, error: brandsError } = await supabase
          .from('products')
          .select('brand')
          .eq('is_active', true)
          .eq('is_approved', true)
          .not('brand', 'is', null);
        
        if (brandsError) {
          console.error('❌ Error fetching brands:', brandsError);
        } else {
          // Extract unique brands
          const uniqueBrands = Array.from(new Set(brandsData?.map((p: any) => p.brand).filter(Boolean))) as string[];
          setBrands(uniqueBrands);
        }
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            is_active,
            is_approved,
            description,
            price,
            compare_price,
            rating,
            review_count,
            images,
            category,
            stock_quantity,
            brand,
            efficiency,
            capacity,
            created_at
          `)
          .eq('is_active', true)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        
        // Simple validation
        if (productsError) {
          console.error('❌ Products query error:', productsError);
          setDataError('Failed to fetch products');
          return;
        }
        
        if (!productsData) {
          console.error('❌ No products data returned');
          setDataError('No products data received');
          return;
        }
        
        // Products are already filtered at database level (is_active = true AND is_approved = true)
        let filteredProducts = productsData || [];
        
        // Transform products data
        try {
          // Products already have direct category field, no need for enrichment
          let finalProductsData = filteredProducts;
          
          const transformedProducts = finalProductsData?.map((product: any) => {
            const transformed = {
              id: product.id,
              name: product.name,
              price: product.price,
              comparePrice: product.compare_price || 0,
              rating: product.rating || 0,
              reviewCount: product.review_count || 0,
              image: product.images?.[0] || product.image_url || '',
              category: product.category || 'Unknown',
              brand: product.brand || 'Unknown',
              efficiency: product.efficiency || 0,
              capacity: product.capacity || 0,
              inStock: (product.stock_quantity || 0) > 0,
              stock: product.stock_quantity || 0, // Include stock quantity for cart validation
              isNew: new Date(product.created_at).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days
              isFeatured: product.rating >= 4.5 // High-rated products are featured
            };
            return transformed;
          }) || [];
          
          setProducts(transformedProducts);
        } catch (transformError) {
          console.error('❌ Error during product transformation:', transformError);
          setProducts([]);
        }
        
              } catch (err) {
          console.error('❌ Error in fetchData:', err);
          setDataError('Failed to fetch data');
        } finally {
          if (isMounted) {
            setDataLoading(false);
          }
        }
      };
    
      fetchData();
      
      // Cleanup function
      return () => {
        isMounted = false;
      };
    }, []);
  
  const {
    cartItems,
    wishlistItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartItemCount,
    toggleWishlist,
    isInWishlist
  } = useCartWishlist();

  const selectedPriceRangeObj = priceRanges.find(range => range.label === selectedPriceRanges[0]);

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    
    let filtered = products.filter(product => {
      // Search filter - search in name, category, description, and brand
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower)) ||
        (product.brand && product.brand.toLowerCase().includes(searchLower));

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);

      // Brand filter
      const productBrand = product.brand || product.name.split(' ')[0];
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(productBrand);

      // Wattage filter - use actual efficiency and capacity fields
      // Handle both numeric and string values like "300W"
      const parseWattage = (value: any) => {
        if (typeof value === 'string') {
          // Extract number from strings like "300W", "300", etc.
          const match = value.toString().match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }
        return parseInt(value) || 0;
      };
      
      const productEfficiency = parseWattage(product.efficiency);
      const productCapacity = parseWattage(product.capacity);
      const productWattage = Math.max(productEfficiency, productCapacity); // Use the higher value
      
      
      const matchesWattage = selectedWattages.length === 0 || selectedWattages.some(w => {
        if (w === '100W - 200W') return productWattage >= 100 && productWattage <= 200;
        if (w === '200W - 300W') return productWattage >= 200 && productWattage <= 300;
        if (w === '300W - 400W') return productWattage >= 300 && productWattage <= 400;
        if (w === '400W - 500W') return productWattage >= 400 && productWattage <= 500;
        if (w === '500W+') return productWattage >= 500;
        return true;
      });

      // Price filter
      const matchesPrice = selectedPriceRanges.length === 0 || selectedPriceRanges.some(p => {
        const range = priceRanges.find(pr => pr.label === p);
        if (!range) return false;
        if (range.max === Infinity) {
          return product.price >= range.min;
        }
        return product.price >= range.min && product.price <= range.max;
      });

      return matchesSearch && matchesCategory && matchesBrand && matchesWattage && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (a.isNew ? 1 : 0) - (b.isNew ? 1 : 0));
        break;
      default: // featured - keep original order
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategories, selectedBrands, selectedWattages, selectedPriceRanges, sortBy, products]);

  const displayedProducts = filteredProducts.slice(0, visibleProducts);
  const hasMoreProducts = visibleProducts < filteredProducts.length;

  // Infinite scroll logic
  useEffect(() => {
    const loadMore = () => {
      if (hasMoreProducts && !isLoading) {
        setIsLoading(true);
        setTimeout(() => {
          setVisibleProducts(prev => Math.min(prev + 12, filteredProducts.length));
          setIsLoading(false);
        }, 500);
      }
    };

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(loadMore, {
        rootMargin: '100px',
        threshold: 0.1
      });
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMoreProducts, isLoading, filteredProducts.length]);

  const activeFilterCount = selectedCategories.length + 
    selectedBrands.length + 
    selectedWattages.length + 
    selectedEfficiencies.length +
    selectedPriceRanges.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UnifiedHeader products={products} />

      {/* Loading State */}
      {dataLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading marketplace...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {dataError && !dataLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-2">{dataError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Only show when data is loaded */}
      {!dataLoading && !dataError && (
        <>
          {/* Hero Section Toggle Button */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <button
                  onClick={() => setShowHero(!showHero)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {showHero ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Hide Marketplace Options
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      Sell or Install Solar?
                    </>
                  )}
                </button>
                
                {/* Currency Selector */}
                <CurrencySelector showExchangeRates={true} />
              </div>
            </div>
          </div>

          {/* Collapsible Hero Section */}
          {showHero && (
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 overflow-hidden transition-all duration-500 ease-in-out">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Solar Energy for Everyone
                  </h1>
                  <p className="text-lg text-primary-100 mb-6 max-w-2xl mx-auto">
                    Discover the best solar panels, inverters, and equipment from trusted suppliers. 
                    Join our marketplace to buy, sell, or install solar solutions.
                  </p>
                  
                  {/* Call to Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                      href="/sell"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-base transition-colors shadow-lg hover:shadow-xl"
                    >
                      <Store className="w-4 h-4" />
                      Sell Solar Products
                    </Link>
                    <div className="relative">
                      <button
                        disabled
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-400 text-gray-600 rounded-lg font-semibold text-base cursor-not-allowed opacity-60"
                      >
                        <Wrench className="w-4 h-4" />
                        Become an Installer
                      </button>
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Coming Soon
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-primary-200 mt-4 text-sm">
                    Join thousands of professionals in the solar industry
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category Navigation */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8 py-3 overflow-x-auto scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategories([category.name])}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex-shrink-0 ${
                      selectedCategories.includes(category.name)
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <category.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">{category.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  {/* Mobile Filters Header */}
                  <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowMobileFilters(!showMobileFilters)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategories([]);
                            setSelectedBrands([]);
                            setSelectedWattages([]);
                            setSelectedEfficiencies([]);
                            setSelectedPriceRanges([]);
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Clear All
                        </button>
                        {showMobileFilters ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Desktop Filters Header */}
                  <div className="hidden lg:block p-6 pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                      <button
                        onClick={() => {
                          setSelectedCategories([]);
                          setSelectedBrands([]);
                          setSelectedWattages([]);
                          setSelectedEfficiencies([]);
                          setSelectedPriceRanges([]);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Filters Content */}
                  <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block p-6 lg:pt-0`}>

                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label key={category.name} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category.name]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== category.name));
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {category.name} ({category.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Brands */}
                  {brands.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Brands</h3>
                      <div className="space-y-2">
                        {brands.map((brand) => (
                          <label key={brand} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBrands([...selectedBrands, brand]);
                                } else {
                                  setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                }
                              }}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {brand}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Wattage Ranges */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Wattage</h3>
                    <div className="space-y-2">
                      {wattageRanges.map((range) => (
                        <label key={range} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedWattages.includes(range)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWattages([...selectedWattages, range]);
                              } else {
                                setSelectedWattages(selectedWattages.filter(w => w !== range));
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {range}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Ranges */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Price Range</h3>
                    <div className="space-y-2">
                      {priceRanges.map((range) => (
                        <label key={range.label} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedPriceRanges.includes(range.label)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPriceRanges([range.label]);
                              } else {
                                setSelectedPriceRanges(selectedPriceRanges.filter(p => p !== range.label));
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {range.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="lg:col-span-3">
                {/* Sort and Results */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Showing {displayedProducts.length} of {filteredProducts.length} products
                    {activeFilterCount > 0 && (
                      <span className="ml-2 text-primary-600 dark:text-primary-400">
                        (filtered)
                      </span>
                    )}
                    {hasMoreProducts && (
                      <span className="ml-2 text-gray-500 dark:text-gray-400">
                        (scroll for more)
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 text-xs px-2 py-1 rounded-full">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="featured">Featured</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>

                {/* Products */}
                <ProductGrid 
                  products={displayedProducts} 
                  viewMode={viewMode}
                />

                {/* Infinite Scroll Trigger */}
                {hasMoreProducts && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading more products...
                      </div>
                    ) : (
                      <div className="h-4"></div>
                    )}
                  </div>
                )}

                {/* No more products message */}
                {!hasMoreProducts && displayedProducts.length > 0 && (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    You've reached the end of the products
                  </div>
                )}

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
