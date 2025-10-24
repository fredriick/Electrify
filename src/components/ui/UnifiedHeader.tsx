import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Package, 
  Store,
  Settings as SettingsIcon,
  LogOut,
  BarChart3,
  CreditCard,
  MessageSquare,
  RefreshCw,
  Phone,
  X,
  Bell
} from 'lucide-react';
import { PopupMenu } from '@/components/ui/PopupMenu';
import { WishlistPopup } from '@/components/cart/WishlistPopup';
import { CartPopup } from '@/components/cart/CartPopup';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { useCartWishlist } from '@/components/providers/Providers';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from './Logo';
import { userDataService } from '@/lib/userData';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  [key: string]: any;
}

interface UnifiedHeaderProps {
  products?: Product[];
  onToggleWishlist?: (productId: number) => void;
  isInWishlist?: (productId: number) => boolean;
  onAddToCart?: (productId: number) => void;
  getCartItemCount?: () => number;
  cartItems?: {id: number, quantity: number}[];
  wishlistItems?: number[];
  onUpdateQuantity?: (productId: number, quantity: number) => void;
  onRemoveFromCart?: (productId: number) => void;
}

export function UnifiedHeader({ 
  products, 
  onToggleWishlist: externalToggleWishlist,
  isInWishlist: externalIsInWishlist,
  onAddToCart: externalAddToCart,
  getCartItemCount: externalGetCartItemCount,
  cartItems: externalCartItems,
  wishlistItems: externalWishlistItems,
  onUpdateQuantity: externalUpdateCartQuantity,
  onRemoveFromCart: externalRemoveFromCart
}: UnifiedHeaderProps) {
  const router = useRouter();
  const context = useCartWishlist();
  const { user, profile, signIn, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to homepage with search query
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    router.push('/');
  };

  // Sync search term with URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam !== searchTerm) {
      setSearchTerm(searchParam || '');
    }
  }, []);

  // Handle manual search term clearing with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm === '' && window.location.search.includes('search=')) {
        router.push('/');
      } else if (searchTerm !== '' && !window.location.search.includes('search=')) {
        // If user types something but URL doesn't have search param, update URL
        router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, router]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any);
    }
  };

  // Check if user is logged in and their role
  const isLoggedIn = !!user;
  const isSeller = profile?.role === 'SUPPLIER';
  const isCustomer = profile?.role === 'CUSTOMER';
  
  // Always show customer menu for customers, seller menu for sellers
  // This ensures customers never see seller options
  const showCustomerMenu = isCustomer;
  const showSellerMenu = isSeller;


  // Fetch user data (orders, wishlist, cart)
  const fetchUserData = async () => {
    setLoadingUserData(true);
    try {
      if (user) {
        // For logged-in users, fetch their specific data
        const userData = await userDataService.getUserData(user.id);
        setOrderCount(userData.orderCount);
        setWishlistCount(userData.wishlistCount);
        setCartCount(userData.cartCount);
      } else {
        // For non-logged-in users, fetch general/guest data
        const guestData = userDataService.getGuestData();
        setOrderCount(guestData.orderCount);
        setWishlistCount(guestData.wishlistCount);
        setCartCount(guestData.cartCount);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to context data
      setOrderCount(0);
      setWishlistCount(wishlistItems.length);
      setCartCount(getCartItemCount());
    } finally {
      setLoadingUserData(false);
    }
  };

  // Fetch user data when user changes or context data changes
  useEffect(() => {
    fetchUserData();
  }, [user]);

  // Get display name for user menu
  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (profile?.full_name) {
      return profile.full_name;
    }
    if (user?.email) {
      // Extract name from email (before @ symbol) as fallback
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Guest';
  };

  // Click outside handler for user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Use context values if external props are not provided
  const toggleWishlist = externalToggleWishlist || context.toggleWishlist;
  const isInWishlist = externalIsInWishlist || context.isInWishlist;
  const addToCart = externalAddToCart || context.addToCart;
  const getCartItemCount = externalGetCartItemCount || context.getCartItemCount;
  const cartItems = externalCartItems || context.cartItems;
  const wishlistItems = externalWishlistItems || context.wishlistItems;
  const updateCartQuantity = externalUpdateCartQuantity || context.updateCartQuantity;
  const removeFromCart = externalRemoveFromCart || context.removeFromCart;
  
  // Create a wrapper function for updateCartQuantity that includes stock information
  const handleUpdateQuantity = (productId: number, quantity: number, stock?: number) => {
    // If stock is not provided, try to find it from the products array
    const productStock = stock || products?.find(p => p.id === productId)?.stock;
    updateCartQuantity(productId, quantity, productStock);
  };

  // Update counts when context data changes (after context variables are defined)
  useEffect(() => {
    if (!user) {
      // For non-logged-in users, update from context data
      setWishlistCount(wishlistItems.length);
      setCartCount(getCartItemCount());
    }
  }, [wishlistItems.length, getCartItemCount, user]);

  // Use real data if available, otherwise fall back to context data
  // Ensure consistent values between server and client to prevent hydration mismatch
  const displayWishlistCount = wishlistCount > 0 ? wishlistCount : (context.isHydrated ? (wishlistItems?.length || 0) : 0);
  const displayCartCount = cartCount > 0 ? cartCount : (context.isHydrated ? (cartItems?.length || 0) : 0);


  // User functions
  const handleLogout = () => {
    signOut();
    setShowUserMenu(false);
  };
  const handleShowLoginModal = () => {
    setShowUserMenu(false);
    setShowLoginModal(true);
  };
  const handleShowRegisterModal = () => {
    setShowUserMenu(false);
    setShowRegisterModal(true);
  };
  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };
  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="2xl" />
          </div>

          {/* Search Bar - Hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search solar products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-r-lg border border-primary-600 hover:border-primary-700 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Mobile Search Button */}
          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Right Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Sell Button - Smaller on mobile */}
            <Link href="/sell" className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <Store className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sell</span>
            </Link>

            {/* Wishlist */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowUserMenu(false);
                  setShowCartPopup(false);
                  setShowWishlistPopup(!showWishlistPopup);
                }}
                className="p-1 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 relative"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center z-10 ${displayWishlistCount > 0 ? 'block' : 'hidden'}`}>
                  {displayWishlistCount}
                </span>
              </button>
            </div>

            {/* Cart */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowUserMenu(false);
                  setShowWishlistPopup(false);
                  setShowCartPopup(!showCartPopup);
                }}
                className="p-1 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 relative"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className={`absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center z-10 ${displayCartCount > 0 ? 'block' : 'hidden'}`}>
                  {displayCartCount}
                </span>
              </button>
            </div>

            {/* Notifications - Only show for logged-in users */}
            {isLoggedIn && (
              <div className="relative">
                <NotificationDropdown />
              </div>
            )}

            {/* User Profile */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <User className="w-5 h-5" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.email || ''}
                        </p>
                      </div>
                      
                      {showSellerMenu ? (
                        // Seller Menu Items
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Seller Dashboard
                          </Link>
                          <Link
                            href="/supplier/products"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            My Products
                          </Link>
                          <Link
                            href="/supplier/orders"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Orders ({loadingUserData ? '...' : orderCount})
                          </Link>
                          <Link
                            href="/supplier/analytics"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                          </Link>
                          <Link
                            href="/supplier/payouts"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Payouts
                          </Link>
                          <Link
                            href="/contact"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Contact Support
                          </Link>
                        </>
                      ) : (
                        // Customer Menu Items
                        <>
                          <Link
                            href="/my-orders"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            My Orders ({loadingUserData ? '...' : orderCount})
                          </Link>
                          <Link
                            href="/my-quotes"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            My Quotes
                          </Link>
                          <Link
                            href="/my-orders/refund-history"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refund History
                          </Link>
                          <Link
                            href="/wishlist"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Wishlist ({loadingUserData ? '...' : displayWishlistCount})
                          </Link>
                          <Link
                            href="/cart"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Cart ({loadingUserData ? '...' : displayCartCount})
                          </Link>
                          <Link
                            href="/contact"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Contact Support
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <Link
                          href={showSellerMenu ? "/supplier/profile" : "/settings"}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <SettingsIcon className="w-4 h-4 mr-2" />
                          {showSellerMenu ? "Profile" : "Settings"}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleShowLoginModal}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Login
                      </button>
                      <button
                        onClick={handleShowRegisterModal}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
      {/* Wishlist Popup */}
      <PopupMenu
        isOpen={showWishlistPopup}
        onClose={() => setShowWishlistPopup(false)}
        title="Wishlist"
        position="right"
      >
        <WishlistPopup
          wishlistItems={externalWishlistItems || wishlistItems}        
          products={products || []}
          onRemoveFromWishlist={toggleWishlist}
          onAddToCart={addToCart}
          onClose={() => setShowWishlistPopup(false)}
        />
      </PopupMenu>
      {/* Cart Popup */}
      <PopupMenu
        isOpen={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        title="Shopping Cart"
        position="right"
      >
        <CartPopup
          cartItems={externalCartItems || cartItems}
          products={products || []}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveFromCart={removeFromCart}
          onClose={() => setShowCartPopup(false)}
        />
      </PopupMenu>
      
      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search solar products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-r-lg border border-primary-600 hover:border-primary-700 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
} 