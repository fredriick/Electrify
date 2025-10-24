import { getSupabaseClient, supabase } from './auth'

// Helper function to get authenticated client
const getAuthenticatedClient = async () => {
  console.log('🔍 getAuthenticatedClient: Starting authentication check...')
  
  // First try to get the authenticated client
  let client = getSupabaseClient()
  
  if (client) {
    console.log('✅ Found getSupabaseClient() instance')
    
    // Check if this client has a valid session
    const { data: { session }, error: sessionError } = await client.auth.getSession()
    console.log('📋 Session check result:', { session: !!session, error: sessionError })
    
    if (session?.user) {
      console.log('✅ Using authenticated client with user:', session.user.id)
      return client
    } else {
      console.log('❌ Session exists but no user:', session)
      
      // Try to refresh the session
      console.log('🔄 Attempting to refresh session...')
      const { data: { session: refreshedSession }, error: refreshError } = await client.auth.refreshSession()
      console.log('📋 Session refresh result:', { session: !!refreshedSession, error: refreshError })
      
      if (refreshedSession?.user) {
        console.log('✅ Session refreshed successfully, user:', refreshedSession.user.id)
        return client
      }
    }
  }
  
  // If we get here, try using the static supabase client
  console.log('🔄 Trying static supabase client...')
  const { data: { session }, error: staticSessionError } = await supabase.auth.getSession()
  console.log('📋 Static client session check:', { session: !!session, error: staticSessionError })
  
  if (session?.user) {
    console.log('✅ Static client has valid session, user:', session.user.id)
    return supabase
  }
  
  // Try to refresh the static client session
  console.log('🔄 Attempting to refresh static client session...')
  const { data: { session: refreshedStaticSession }, error: refreshStaticError } = await supabase.auth.refreshSession()
  console.log('📋 Static client session refresh result:', { session: !!refreshedStaticSession, error: refreshStaticError })
  
  if (refreshedStaticSession?.user) {
    console.log('✅ Static client session refreshed successfully, user:', refreshedStaticSession.user.id)
    return supabase
  }
  
  console.log('⚠️ No authenticated client available, using static client (this will likely fail RLS)')
  return supabase
}

// Alternative approach: Create a new client with the current session
const createAuthenticatedClient = async () => {
  console.log('🔍 createAuthenticatedClient: Creating new client with current session...')
  
  // Get the current session from any available client
  let currentSession = null
  
  // Try the main client first
  const mainClient = getSupabaseClient()
  if (mainClient) {
    const { data: { session } } = await mainClient.auth.getSession()
    if (session?.user) {
      currentSession = session
      console.log('✅ Got session from main client:', session.user.id)
    }
  }
  
  // If no session from main client, try static client
  if (!currentSession) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      currentSession = session
      console.log('✅ Got session from static client:', session.user.id)
    }
  }
  
  if (currentSession?.user) {
    // Create a new client with the current session
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseAnonKey) {
      const newClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false // Don't persist, just use the current session
        }
      })
      
      // Set the session manually
      await newClient.auth.setSession(currentSession)
      console.log('✅ Created new authenticated client with session:', currentSession.user.id)
      return newClient
    }
  }
  
  console.log('❌ Could not create authenticated client')
  return null
}

export interface Product {
  id: string;
  supplier_id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  compare_price?: number;
  stock_quantity: number;
  sku: string;
  status: 'active' | 'out_of_stock' | 'draft' | 'archived';
  description?: string;
  capacity?: string;
  efficiency?: string;
  warranty?: string;
  warranty_terms?: string;
  specifications: Array<{ key: string; value: string }>;
  features: string[];
  is_new: boolean;
  is_featured: boolean;
  delivery_fee?: number;
  delivery_range?: string;
  delivery_time_start?: string;
  delivery_time_end?: string;
  image_url?: string;
  images: string[];
  created_at: string;
  updated_at: string;
  // Approval status fields
  approval_status?: 'pending' | 'under_review' | 'approved' | 'rejected';
  admin_notes?: string;
  rejection_reason?: string;
  rejected_at?: string;
  approved_at?: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  compare_price?: number;
  stock_quantity: number;
  sku: string;
  status: 'active' | 'out_of_stock' | 'draft' | 'archived';
  category: string;
  brand: string;
  capacity?: string;
  efficiency?: string;
  warranty?: string;
  warranty_terms?: string;
  specifications: Array<{ key: string; value: string }>;
  features: string[];
  is_new: boolean;
  is_featured: boolean;
  delivery_fee?: number;
  delivery_range?: string;
  delivery_time_start?: string;
  delivery_time_end?: string;
  image_url?: string;
  images: File[]; // For upload
}

export interface UpdateProductData extends Omit<CreateProductData, 'images'> {
  images?: string[]; // For updates, we use URLs
}

class ProductService {
  async getProducts(supplierId: string): Promise<Product[]> {
    const supabaseClient = await getAuthenticatedClient();
    
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error;
    }
  }

  async getProduct(productId: string): Promise<Product | null> {
    const supabaseClient = await getAuthenticatedClient();
    
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProduct:', error);
      return null;
    }
  }

  async createProduct(supplierId: string, productData: CreateProductData): Promise<Product | null> {
    const supabaseClient = await getAuthenticatedClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    try {
      // Debug: Check if we have an authenticated user
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      console.log('🔍 createProduct: User check result:', { user: !!user, userId: user?.id, error: userError });
      
      // Also check session
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      console.log('🔍 createProduct: Session check result:', { session: !!session, sessionUserId: session?.user?.id, error: sessionError });
      
      // If no user or session, throw an authentication error
      if (!user || !session) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      console.log('📝 Creating product with user:', user.id);
      console.log('📝 Supplier ID to use:', supplierId);
      console.log('📝 Client being used:', supabaseClient === supabase ? 'static client' : 'authenticated client');

      const { data, error } = await supabaseClient
        .from('products')
        .insert([
          {
            ...productData,
            supplier_id: supplierId,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating product:', error);
        throw error;
      }
      
      console.log('✅ Product created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in createProduct:', error);
      throw error;
    }
  }

  // New method that accepts a pre-authenticated client
  async createProductWithClient(supplierId: string, productData: CreateProductData, supabaseClient: any): Promise<Product | null> {
    try {
      // Debug: Check if we have an authenticated user
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      console.log('🔍 createProductWithClient: User check result:', { user: !!user, userId: user?.id, error: userError });
      
      // Also check session
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      console.log('🔍 createProductWithClient: Session check result:', { session: !!session, sessionUserId: session?.user?.id, error: sessionError });
      
      // If no user or session, throw an authentication error
      if (!user || !session) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      console.log('📝 Creating product with user:', user.id);
      console.log('📝 Supplier ID to use:', supplierId);
      console.log('📝 Using provided authenticated client');

      // First, create the product to get an ID
      const { data: productDataWithoutImages, error: insertError } = await supabaseClient
        .from('products')
        .insert([
          {
            ...productData,
            supplier_id: supplierId,
            // Temporarily set images to empty array, we'll update after upload
            images: [],
            image_url: undefined
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating product:', insertError);
        throw insertError;
      }

      console.log('✅ Product created with ID:', productDataWithoutImages.id);

      // Now upload images if we have any
      if (productData.images && productData.images.length > 0) {
        console.log('🖼️ Starting image upload for product:', productDataWithoutImages.id);
        
        // Check if we have actual File objects
        const hasFileObjects = productData.images.some(img => img instanceof File);
        
        if (hasFileObjects) {
          console.log('✅ Found File objects, proceeding with upload');
          const uploadResult = await this.uploadProductImages(productDataWithoutImages.id, productData.images, supabaseClient);
          
          if (uploadResult.success && uploadResult.urls) {
            console.log('✅ Images uploaded successfully, updating product');
            
            // Update the product with the uploaded image URLs
            const { error: updateError } = await supabaseClient
              .from('products')
              .update({
                images: uploadResult.urls,
                image_url: uploadResult.urls[0] // Set first image as main image
              })
              .eq('id', productDataWithoutImages.id);

            if (updateError) {
              console.error('❌ Error updating product with image URLs:', updateError);
              // Don't throw here, the product was created successfully
            } else {
              console.log('✅ Product updated with image URLs');
              // Update the returned data - cast to any to avoid type issues
              (productDataWithoutImages as any).images = uploadResult.urls;
              (productDataWithoutImages as any).image_url = uploadResult.urls[0];
            }
          } else {
            console.error('❌ Image upload failed:', uploadResult.error);
            // Don't throw here, the product was created successfully
          }
        } else {
          console.log('⚠️ No File objects found in images array');
        }
      }

      console.log('✅ Product creation completed successfully');
      return productDataWithoutImages;
      
    } catch (error) {
      console.error('❌ Error in createProductWithClient:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, productData: Partial<CreateProductData>): Promise<Product | null> {
    const supabaseClient = await getAuthenticatedClient();
    
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabaseClient
        .from('products')
        .update(productData)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  }

  // New method that accepts a pre-authenticated client
  async updateProductWithClient(productId: string, productData: Partial<CreateProductData>, supabaseClient: any): Promise<Product | null> {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .update(productData)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProductWithClient:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    const supabaseClient = await getAuthenticatedClient();
    
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw error;
    }
  }

  async archiveProduct(productId: string): Promise<boolean> {
    return this.updateProduct(productId, { status: 'archived' }) !== null;
  }

  async unarchiveProduct(productId: string): Promise<boolean> {
    return this.updateProduct(productId, { status: 'active' }) !== null;
  }

  // New methods that accept a pre-authenticated client
  async archiveProductWithClient(productId: string, supabaseClient: any): Promise<boolean> {
    return this.updateProductWithClient(productId, { status: 'archived' }, supabaseClient) !== null;
  }

  async unarchiveProductWithClient(productId: string, supabaseClient: any): Promise<boolean> {
    return this.updateProductWithClient(productId, { status: 'active' }, supabaseClient) !== null;
  }

  async duplicateProduct(productId: string, supplierId: string): Promise<Product | null> {
    const originalProduct = await this.getProduct(productId);
    if (!originalProduct) return null;

    const duplicateData: CreateProductData = {
      name: `${originalProduct.name} (Copy)`,
      description: originalProduct.description || '',
      price: originalProduct.price,
      compare_price: originalProduct.compare_price,
      stock_quantity: 0, // Start with 0 stock for duplicates
      sku: `${originalProduct.sku}-COPY`,
      status: 'draft',
      category: originalProduct.category,
      brand: originalProduct.brand || '',
      capacity: originalProduct.capacity,
      efficiency: originalProduct.efficiency,
      warranty: originalProduct.warranty,
      warranty_terms: originalProduct.warranty_terms,
      specifications: originalProduct.specifications,
      features: originalProduct.features,
      is_new: false,
      is_featured: false,
      delivery_fee: originalProduct.delivery_fee,
      delivery_range: originalProduct.delivery_range,
      delivery_time_start: originalProduct.delivery_time_start,
      delivery_time_end: originalProduct.delivery_time_end,
      image_url: originalProduct.image_url,
      images: [] // Start with no images for duplicates
    };

    return this.createProduct(supplierId, duplicateData);
  }

  // Helper function to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Helper function to get status color
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  // Helper function to get status label
  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'draft':
        return 'Draft';
      case 'archived':
        return 'Archived';
      default:
        return 'Unknown';
    }
  }

  // New method that accepts a pre-authenticated client
  async deleteProductWithClient(productId: string, supabaseClient: any): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // New method that accepts a pre-authenticated client
  async getProductsWithClient(supplierId: string, supabaseClient: any): Promise<Product[]> {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Upload product images to Supabase Storage
   */
  async uploadProductImages(productId: string, imageFiles: File[], supabaseClient: any): Promise<{ success: boolean; urls?: string[]; error?: string }> {
    try {
      console.log('🖼️ Starting image upload for product:', productId);
      console.log('📁 Number of images to upload:', imageFiles.length);
      
      if (!supabaseClient) {
        return { success: false, error: 'No Supabase client available' };
      }
      
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        console.log(`📤 Uploading image ${i + 1}/${imageFiles.length}:`, file.name);
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.warn(`⚠️ Skipping non-image file: ${file.name}`);
          continue;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.warn(`⚠️ Skipping oversized file: ${file.name} (${file.size} bytes)`);
          continue;
        }
        
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `product-${productId}-${Date.now()}-${i}.${fileExt}`;
        const filePath = `product-images/${fileName}`;
        
        console.log(`📁 File path: ${filePath}`);
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseClient.storage
          .from('products')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error(`❌ Error uploading image ${file.name}:`, uploadError);
          return { success: false, error: `Failed to upload ${file.name}: ${uploadError.message}` };
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabaseClient.storage
          .from('products')
          .getPublicUrl(filePath);
        
        console.log(`✅ Image ${file.name} uploaded successfully, URL:`, publicUrl);
        uploadedUrls.push(publicUrl);
      }
      
      console.log('🎉 All images uploaded successfully:', uploadedUrls);
      return { success: true, urls: uploadedUrls };
      
    } catch (error) {
      console.error('❌ Error in uploadProductImages:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during image upload' 
      };
    }
  }
}

export const productService = new ProductService(); 