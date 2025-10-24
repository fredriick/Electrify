'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProductDetail } from '@/components/products/ProductDetail';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';
import { useCartWishlist } from '@/components/providers/Providers';
import { supabase } from '@/lib/auth';

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string; // Use UUID string directly
  const [product, setProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useCartWishlist();

  // Fetch all products for the header
  const fetchAllProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          compare_price,
          image_url,
          images,
          category,
          brand,
          stock_quantity
        `)
        .eq('is_active', true)
        .eq('is_approved', true);

      if (!productsError && productsData) {
        const transformedProducts = productsData.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          comparePrice: product.compare_price || 0,
          image: product.images?.[0] || product.image_url || '',
          category: product.category || 'Unknown',
          brand: product.brand || 'Unknown',
          stock: product.stock_quantity || 0 // Include stock for cart validation
        }));
        setAllProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching all products:', error);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      setError(null);
      
      // Fetch all products first for the header
      await fetchAllProducts();
      
      try {
        // Fetch real product data from your database
        const { data: productData, error: fetchError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            compare_price,
            stock_quantity,
            sku,
            status,
            category,
            brand,
            capacity,
            efficiency,
            warranty,
            warranty_terms,
            specifications,
            features,
            is_new,
            is_featured,
            delivery_fee,
            delivery_range,
            delivery_time_start,
            delivery_time_end,
            image_url,
            images,
            rating,
            review_count,
            created_at
          `)
          .eq('id', productId)
          .eq('is_active', true)
          .eq('is_approved', true)
          .single();

        if (fetchError) {
          console.error('Error fetching product:', fetchError);
          setError('Failed to fetch product');
          setProduct(null);
        } else if (productData) {
          // Transform the database product to match the expected format
          const transformedProduct = {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            comparePrice: productData.compare_price || 0,
            rating: productData.rating || 0,
            reviewCount: productData.review_count || 0,
            image: productData.images?.[0] || productData.image_url || '',
            category: productData.category || 'Unknown',
            brand: productData.brand || 'Unknown',
            efficiency: productData.efficiency || '',
            capacity: productData.capacity || '',
            warranty: productData.warranty || 'Standard',
            warrantyTerms: productData.warranty_terms || '',
            deliveryFee: productData.delivery_fee?.toString() || '',
            deliveryRange: productData.delivery_range || '',
            deliveryTimeStart: productData.delivery_time_start || '',
            deliveryTimeEnd: productData.delivery_time_end || '',
            inStock: (productData.stock_quantity || 0) > 0,
            stock: productData.stock_quantity || 0, // Include stock quantity for validation
            isNew: productData.is_new || false,
            isFeatured: productData.is_featured || false,
            description: productData.description || '',
            specifications: productData.specifications || {},
            features: productData.features || [],
            images: productData.images || [productData.image_url || '']
          };
          
          setProduct(transformedProduct);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error in fetchProduct:', err);
        setError('Failed to fetch product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <>
        <UnifiedHeader products={allProducts} />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <UnifiedHeader products={allProducts} />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Product</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <a 
              href="/" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Homepage
            </a>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <UnifiedHeader products={allProducts} />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The product you're looking for doesn't exist or may not be approved yet.</p>
            <a 
              href="/" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Homepage
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UnifiedHeader products={allProducts} />
      <ProductDetail 
        product={product} 
        allProducts={allProducts}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
        isInWishlist={isInWishlist}
      />
    </>
  );
} 