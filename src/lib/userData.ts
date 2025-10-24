import { getSupabaseClient } from './auth';

export interface UserData {
  orderCount: number;
  wishlistCount: number;
  cartCount: number;
}

export const userDataService = {
  // Fetch user order count
  async getOrderCount(userId: string): Promise<number> {
    try {
      const { count, error } = await getSupabaseClient()
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching order count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getOrderCount:', error);
      return 0;
    }
  },

  // Fetch user wishlist count
  async getWishlistCount(userId: string): Promise<number> {
    try {
      // TODO: Implement wishlist count when wishlist table is created
      // For now, return 0 to prevent errors
      return 0;
      
      // Original code (commented out until wishlist table exists):
      // const { count, error } = await getSupabaseClient()
      //   .from('wishlist')
      //   .select('*', { count: 'exact', head: true })
      //   .eq('user_id', userId);

      // if (error) {
      //   console.error('Error fetching wishlist count:', error);
      //   return 0;
      // }

      // return count || 0;
    } catch (error) {
      console.error('Error in getWishlistCount:', error);
      return 0;
    }
  },

  // Fetch user cart count
  async getCartCount(userId: string): Promise<number> {
    try {
      // TODO: Implement cart count when cart_items table is created
      // For now, return 0 to prevent errors
      return 0;
      
      // Original code (commented out until cart_items table exists):
      // const { data, error } = await getSupabaseClient()
      //   .from('cart_items')
      //   .select('quantity')
      //   .eq('user_id', userId);

      // if (error) {
      //   console.error('Error fetching cart count:', error);
      //   return 0;
      // }

      // // Sum up all quantities
      // const totalItems = data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      // return totalItems;
    } catch (error) {
      console.error('Error in getCartCount:', error);
      return 0;
    }
  },

  // Get guest wishlist count from localStorage
  getGuestWishlistCount(): number {
    try {
      const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
      return guestWishlist.length;
    } catch (error) {
      console.error('Error getting guest wishlist count:', error);
      return 0;
    }
  },

  // Get guest cart count from localStorage
  getGuestCartCount(): number {
    try {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      return guestCart.reduce((total: number, item: any) => total + (item.quantity || 1), 0);
    } catch (error) {
      console.error('Error getting guest cart count:', error);
      return 0;
    }
  },

  // Fetch all user data at once
  async getUserData(userId: string): Promise<UserData> {
    try {
      const [orderCount, wishlistCount, cartCount] = await Promise.all([
        this.getOrderCount(userId),
        this.getWishlistCount(userId),
        this.getCartCount(userId)
      ]);

      return {
        orderCount,
        wishlistCount,
        cartCount
      };
    } catch (error) {
      console.error('Error in getUserData:', error);
      return {
        orderCount: 0,
        wishlistCount: 0,
        cartCount: 0
      };
    }
  },

  // Get guest user data
  getGuestData(): UserData {
    return {
      orderCount: 0, // Guests don't have orders
      wishlistCount: this.getGuestWishlistCount(),
      cartCount: this.getGuestCartCount()
    };
  }
}; 
