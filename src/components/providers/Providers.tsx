'use client';

import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from '@/store/store';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

interface ProvidersProps {
  children: React.ReactNode;
}

interface CartItem {
  id: number;
  quantity: number;
  stock?: number; // Available stock quantity
}

interface CartWishlistContextType {
  cartItems: CartItem[];
  wishlistItems: number[];
  addToCart: (productId: number, stock?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number, stock?: number) => void;
  getCartItemCount: () => number;
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  clearCart: () => void;
  clearWishlist: () => void;
  isHydrated: boolean;
}

const CartWishlistContext = createContext<CartWishlistContextType | undefined>(undefined);

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CurrencyProvider>
            <CartWishlistProvider>
              {children}
            </CartWishlistProvider>
          </CurrencyProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </Provider>
  );
}

export const CartWishlistProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with empty arrays to prevent hydration mismatch
  // Cart items will be loaded from localStorage after hydration
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart items from localStorage after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart-items');
      const savedWishlist = localStorage.getItem('wishlist-items');
      
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
      
      setIsHydrated(true);
    }
  }, []);

  const addToCart = (productId: number, stock?: number) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === productId);
      let newCartItems;
      
      if (existingItem) {
        // Check if adding one more would exceed stock
        if (stock !== undefined && existingItem.quantity >= stock) {
          console.warn(`Cannot add more items: only ${stock} available in stock`);
          return prev; // Return unchanged cart
        }
        
        newCartItems = prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1, stock: stock || item.stock }
            : item
        );
      } else {
        // Check if adding 1 would exceed stock
        if (stock !== undefined && stock <= 0) {
          console.warn(`Cannot add item: out of stock`);
          return prev; // Return unchanged cart
        }
        
        newCartItems = [...prev, { id: productId, quantity: 1, stock }];
      }
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart-items', JSON.stringify(newCartItems));
      }
      
      return newCartItems;
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => {
      const newCartItems = prev.filter(item => item.id !== productId);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart-items', JSON.stringify(newCartItems));
      }
      
      return newCartItems;
    });
  };

  const updateCartQuantity = (productId: number, quantity: number, stock?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prev => {
        // Check if the requested quantity exceeds stock
        if (stock !== undefined && quantity > stock) {
          console.warn(`Cannot set quantity to ${quantity}: only ${stock} available in stock`);
          return prev; // Return unchanged cart
        }
        
        const newCartItems = prev.map(item =>
          item.id === productId ? { ...item, quantity, stock: stock || item.stock } : item
        );
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart-items', JSON.stringify(newCartItems));
        }
        
        return newCartItems;
      });
    }
  };

  const getCartItemCount = () => {
    // Return 0 during hydration to prevent mismatch
    if (!isHydrated) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const toggleWishlist = (productId: number) => {
    setWishlistItems(prev => {
      const newWishlistItems = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('wishlist-items', JSON.stringify(newWishlistItems));
      }
      
      return newWishlistItems;
    });
  };

  const isInWishlist = (productId: number) => wishlistItems.includes(productId);
  
  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart-items');
    }
  };
  
  const clearWishlist = () => {
    setWishlistItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wishlist-items');
    }
  };

  return (
    <CartWishlistContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartItemCount,
        toggleWishlist,
        isInWishlist,
        clearCart,
        clearWishlist,
        isHydrated,
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  );
};

export const useCartWishlist = () => {
  const context = useContext(CartWishlistContext);
  if (!context) {
    throw new Error('useCartWishlist must be used within a CartWishlistProvider');
  }
  return context;
}; 