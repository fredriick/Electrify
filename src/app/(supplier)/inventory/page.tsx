'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Copy,
  Archive,
  Settings,
  Grid3X3,
  List,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { productService, Product, CreateProductData } from '@/lib/productService';
import { getSupabaseClient, getSupabaseSessionClient } from '@/lib/auth';

export default function InventoryPage() {
  const { user, profile } = useAuth();
  const { formatCurrency } = useCurrency();
  
  // Get the appropriate Supabase client based on storage type
  const getCurrentSupabaseClient = () => {
    const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
    if (storageType === 'sessionStorage') {
      return getSupabaseSessionClient();
    } else {
      return getSupabaseClient();
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Function to generate automatic SKU
  const generateSKU = (productName: string, category: string) => {
    if (!productName || !category) return '';
    
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const namePrefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    const categoryPrefix = category.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    
    return `${namePrefix}${categoryPrefix}${timestamp}`;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    category: string;
    brand: string;
    price: string;
    comparePrice: string;
    stock: string;
    sku: string;
    status: string;
    images: File[];
    description: string;
    capacity: string;
    efficiency: string;
    warranty: string;
    warrantyTerms: string;
    specifications: { key: string; value: string }[];
    features: string[];
    isNew: boolean;
    isFeatured: boolean;
    deliveryFee: string;
    deliveryRange: string;
    deliveryTimeStart: string;
    deliveryTimeEnd: string;
  }>({
    name: '',
    category: '',
    brand: '',
    price: '',
    comparePrice: '',
    stock: '',
    sku: generateSKU('', ''),
    status: 'active',
    images: [],
    description: '',
    capacity: '',
    efficiency: '',
    warranty: '',
    warrantyTerms: '',
    specifications: [{ key: '', value: '' }],
    features: [''],
    isNew: false,
    isFeatured: false,
    deliveryFee: '',
    deliveryRange: '',
    deliveryTimeStart: '',
    deliveryTimeEnd: '',
  });



  const fetchProducts = async () => {
    
    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const supabaseClient = getCurrentSupabaseClient()
      const fetchedProducts = await productService.getProductsWithClient(user.id, supabaseClient);
      setProducts(fetchedProducts);
    } catch (err) {
      setError(`Failed to load products: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  // Categories will be fetched dynamically from the database only
  const [predefinedCategories, setPredefinedCategories] = useState<string[]>([]);

  // Function to get display status including approval status
  const getDisplayStatus = (product: Product) => {
    // If product has approval status, show that instead of regular status
    if (product.approval_status && product.approval_status !== 'approved') {
      return product.approval_status;
    }
    return product.status;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || getDisplayStatus(product) === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const statuses = ['all', 'active', 'out_of_stock', 'draft', 'archived', 'pending', 'rejected', 'under_review'];

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '✅';
      case 'out_of_stock':
        return '❌';
      case 'draft':
        return '📝';
      case 'archived':
        return '📦';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      case 'under_review':
        return '🔍';
      default:
        return '❓';
    }
  };

  // Image handling functions
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      
      // Check if we're within the 6 image limit
      if (imageFiles.length + newFiles.length <= 6) {
        setImageFiles(prev => [...prev, ...newFiles]);
        
        // Create preview URLs for display only
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
      } else {
        alert('Maximum 6 images allowed');
      }
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke the blob URL to free memory
      if (prev[index] && prev[index].startsWith('blob:')) {
        URL.revokeObjectURL(prev[index]);
      }
      return newPreviews;
    });
  };

  const clearAllImages = () => {
    // Revoke all blob URLs to free memory
    imagePreviews.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setImageFiles([]);
    setImagePreviews([]);
  };

  // Handle dropdown toggle
  const toggleDropdown = (productId: string) => {
    setOpenDropdown(openDropdown === productId ? null : productId);
  };

  // Handle dropdown actions
  const handleDropdownAction = async (action: string, product: Product) => {
    if (!user?.id) return;

    switch (action) {
      case 'view':
        openViewModal(product);
        break;
      case 'edit':
        openEditModal(product);
        break;
      case 'duplicate':
        await duplicateProduct(product);
        break;
      case 'archive':
        await archiveProduct(product.id);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
          await deleteProduct(product.id);
        }
        break;
    }
    setOpenDropdown(null);
  };

  // Duplicate product function
  const duplicateProduct = async (product: Product) => {
    if (!user?.id) return;

    try {
      const duplicatedProduct = await productService.duplicateProduct(product.id, user.id);
      if (duplicatedProduct) {
        await fetchProducts(); // Refresh the list
        alert(`Product "${product.name}" has been duplicated successfully!`);
      } else {
        alert('Failed to duplicate product. Please try again.');
      }
    } catch (error) {
      alert('Failed to duplicate product. Please try again.');
    }
  };

  // Archive product function
  const archiveProduct = async (productId: string) => {
    try {
      const supabaseClient = getCurrentSupabaseClient()
      const success = await productService.archiveProductWithClient(productId, supabaseClient);
      if (success) {
        await fetchProducts(); // Refresh the list
        alert('Product has been archived successfully!');
      } else {
        alert('Failed to archive product. Please try again.');
      }
    } catch (error) {
      alert('Failed to archive product. Please try again.');
    }
  };

  // Unarchive product function
  const unarchiveProduct = async (productId: string) => {
    try {
      const supabaseClient = getCurrentSupabaseClient()
      const success = await productService.unarchiveProductWithClient(productId, supabaseClient);
      if (success) {
        await fetchProducts(); // Refresh the list
        alert('Product has been unarchived successfully!');
      } else {
        alert('Failed to unarchive product. Please try again.');
      }
    } catch (error) {
      alert('Failed to unarchive product. Please try again.');
    }
  };

  // Delete product function
  const deleteProduct = async (productId: string) => {
    try {
      const supabaseClient = getCurrentSupabaseClient()
      const success = await productService.deleteProductWithClient(productId, supabaseClient);
      if (success) {
        await fetchProducts(); // Refresh the list
        alert('Product has been deleted successfully!');
      } else {
        alert('Failed to delete product. Please try again.');
      }
    } catch (error) {
      alert('Failed to delete product. Please try again.');
    }
  };

  // Open edit modal with product data
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      brand: product.brand || '',
      price: product.price.toString(),
      comparePrice: product.compare_price?.toString() || '',
      stock: product.stock_quantity.toString(),
      sku: product.sku,
      status: product.status,
      images: [],
      description: product.description || '',
      capacity: product.capacity || '',
      efficiency: product.efficiency || '',
      warranty: product.warranty || '',
      warrantyTerms: product.warranty_terms || '',
      specifications: product.specifications || [{ key: '', value: '' }],
      features: product.features || [''],
      isNew: product.is_new || false,
      isFeatured: product.is_featured || false,
      deliveryFee: product.delivery_fee?.toString() || '',
      deliveryRange: product.delivery_range || '',
      deliveryTimeStart: product.delivery_time_start || '',
      deliveryTimeEnd: product.delivery_time_end || '',
    });
    // Set image previews for existing images, but clear imageFiles for new uploads
    setImagePreviews(product.images || [product.image_url || '']);
    setImageFiles([]); // Clear any existing image files
    setShowCustomCategory(!predefinedCategories.includes(product.category));
    setShowEditModal(true);
  };

  // Update product function
  const updateProduct = async () => {
    if (!editingProduct || !user?.id) return;

    setSubmitting(true);

    try {
      const supabaseClient = getCurrentSupabaseClient();
      
      // First, update the product without images
      const productData: Partial<CreateProductData> = {
        name: form.name,
        category: form.category,
        brand: form.brand,
        price: parseFloat(form.price),
        compare_price: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        stock_quantity: parseInt(form.stock),
        sku: form.sku,
        status: form.status as 'active' | 'out_of_stock' | 'draft' | 'archived',
        description: form.description,
        capacity: form.capacity,
        efficiency: form.efficiency,
        warranty: form.warranty,
        warranty_terms: form.warrantyTerms,
        specifications: form.specifications.filter(spec => spec.key && spec.value),
        features: form.features.filter(feature => feature.trim()),
        is_new: form.isNew,
        is_featured: form.isFeatured,
        delivery_fee: form.deliveryFee ? parseFloat(form.deliveryFee) : undefined,
        delivery_range: form.deliveryRange,
        delivery_time_start: form.deliveryTimeStart || undefined,
        delivery_time_end: form.deliveryTimeEnd || undefined,
      };

      // Update product first
      const updatedProduct = await productService.updateProductWithClient(editingProduct.id, productData, supabaseClient);
      
      if (updatedProduct) {
        // Now handle image uploads if we have new images
        if (imageFiles && imageFiles.length > 0 && imageFiles.every(file => file instanceof File)) {
          
          const uploadResult = await productService.uploadProductImages(editingProduct.id, imageFiles as File[], supabaseClient);
          
          if (uploadResult.success && uploadResult.urls) {
            
            // Update the product with the uploaded image URLs
            await productService.updateProductWithClient(editingProduct.id, {
              images: uploadResult.urls as any,
              image_url: uploadResult.urls[0] // Set first image as main image
            }, supabaseClient);
            
          } else {
            alert('Product updated but image upload failed. Please try uploading images again.');
          }
        }

        await fetchProducts(); // Refresh the list
        alert(`Product "${form.name}" has been updated successfully!`);
        resetForm();
        setShowEditModal(false);
      } else {
        alert('Failed to update product. Please try again.');
      }
    } catch (error) {
      alert('Failed to update product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Add product function
  const addProduct = async () => {
    
    if (!user?.id) {
      alert('User not logged in. Please log in again.')
      return
    }
    
    // Check authentication state
    try {
      const { data: { session } } = await getCurrentSupabaseClient().auth.getSession()
      
      if (!session?.user) {
        alert('Authentication required. Please log in again.')
        return
      }
      
      // Validate required fields
      if (imageFiles.length < 3) {
        alert('Please upload at least 3 images.')
        return
      }
      
      setSubmitting(true)
      
      try {
        // Prepare product data
        const productData = {
          name: form.name,
          category: form.category,
          brand: form.brand,
          price: parseFloat(form.price),
          compare_price: parseFloat(form.comparePrice),
          stock_quantity: parseInt(form.stock),
          sku: form.sku,
          status: form.status as 'active' | 'out_of_stock' | 'draft' | 'archived',
          description: form.description,
          capacity: form.capacity,
          efficiency: form.efficiency,
          warranty: form.warranty,
          warranty_terms: form.warrantyTerms,
          specifications: form.specifications.filter(spec => spec.key && spec.value),
          features: form.features.filter(feature => feature.trim()),
          is_new: form.isNew,
          is_featured: form.isFeatured,
          delivery_fee: form.deliveryFee ? parseFloat(form.deliveryFee) : undefined,
          delivery_range: form.deliveryRange,
          delivery_time_start: form.deliveryTimeStart || undefined,
          delivery_time_end: form.deliveryTimeEnd || undefined,
          image_url: undefined, // Will be set after image upload
          images: imageFiles, // Pass actual File objects for upload
        };
        
        
        // Create product using the service with authenticated client
        const supabaseClient = getCurrentSupabaseClient()
        const result = await productService.createProductWithClient(user.id, productData, supabaseClient)
        
        if (result) {
          alert('Product added successfully!')
          // Reset form
          resetForm()
          // Close modal
          setShowAddModal(false)
          // Refresh products list
          fetchProducts()
        } else {
          alert('Failed to create product. Please try again.')
        }
      } catch (error) {
        alert('Failed to create product. Please try again.')
      } finally {
        setSubmitting(false)
      }
    } catch (error) {
      alert('Authentication error. Please log in again.')
    }
  };

  // Open view modal with product data
  const openViewModal = (product: Product) => {
    setViewingProduct(product);
    setShowViewModal(true);
  };

  // Reset form when modal is closed
  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      brand: '',
      price: '',
      comparePrice: '',
      stock: '',
      sku: generateSKU('', ''),
      status: 'active',
      images: [],
      description: '',
      capacity: '',
      efficiency: '',
      warranty: '',
      warrantyTerms: '',
      specifications: [{ key: '', value: '' }],
      features: [''],
      isNew: false,
      isFeatured: false,
      deliveryFee: '',
      deliveryRange: '',
      deliveryTimeStart: '',
      deliveryTimeEnd: '',
    });
    
    // Clear image files and previews
    clearAllImages();
    setShowCustomCategory(false);
    setEditingProduct(null);
  };



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch categories from the categories table (not products table)
  const fetchCategories = async () => {
    try {
      const supabaseClient = getCurrentSupabaseClient();
      const { data: categoriesData, error } = await supabaseClient
        .from('categories')
        .select('name')
        .eq('is_active', true)
        .order('name');
      
      if (!error && categoriesData) {
        // Extract category names from the categories table
        const categoryNames = categoriesData.map((cat: any) => cat.name).filter(Boolean);
        
        if (categoryNames.length > 0) {
          setPredefinedCategories(categoryNames);
        } else {
          // If no categories found, set some basic defaults
          const defaultCategories = ['Solar Panels', 'Solar Inverters', 'Solar Batteries', 'Other'];
          setPredefinedCategories(defaultCategories);
        }
      }
    } catch (err) {
      // Keep empty array if fetch fails
    }
  };

  // Fetch products and categories on component mount
  useEffect(() => {
    if (user && profile) {
      fetchProducts();
      fetchCategories();
    }
  }, [user, profile]);

  // Force grid view on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'list') {
        setViewMode('grid');
      }
    };

    // Check on mount
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  return (
    <DashboardLayout>
      <div className="p-6" onClick={() => setOpenDropdown(null)}>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Inventory
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage your product catalog and stock levels
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* View Toggle - List view hidden on mobile */}
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                <button
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  className={`p-2 rounded-md transition-colors hidden md:block ${
                    viewMode === 'list' 
                      ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button
                className="bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : 
                     status === 'active' ? 'Active' :
                     status === 'out_of_stock' ? 'Out of Stock' :
                     status === 'draft' ? 'Draft' :
                     status === 'archived' ? 'Archived' :
                     status === 'pending' ? 'Pending' :
                     status === 'rejected' ? 'Rejected' :
                     status === 'under_review' ? 'Under Review' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading products...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 mb-4 text-lg font-medium">{error}</div>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={fetchProducts}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add Your First Product
            </button>
          </div>
        )}

        {/* Products Display */}
        {!loading && !error && filteredProducts.length > 0 && viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${product.status === 'archived' ? 'opacity-75' : ''}`}>
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-200 dark:bg-gray-700">
                  {product.image_url || (product.images && product.images[0]) ? (
                    <img 
                      src={product.image_url || (product.images && product.images[0])} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Archive Badge */}
                  {product.status === 'archived' && (
                    <div className="absolute top-2 left-2 bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Archived
                    </div>
                  )}
                  
                  {/* Three-dot menu positioned at top-right */}
                  <div className="relative dropdown-container">
                    <button 
                      className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(product.id);
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {openDropdown === product.id && (
                      <div className="absolute top-8 right-2 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
                        {product.status !== 'archived' ? (
                          <>
                            <button
                              onClick={() => handleDropdownAction('view', product)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleDropdownAction('edit', product)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Product
                            </button>
                            <button
                              onClick={() => handleDropdownAction('duplicate', product)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDropdownAction('archive', product)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Archive className="w-4 h-4" />
                              Archive
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button
                              onClick={() => handleDropdownAction('delete', product)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDropdownAction('view', product)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleDropdownAction('edit', product)}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Product
                            </button>
                            <button
                              onClick={() => handleDropdownAction('duplicate', product)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => unarchiveProduct(product.id)}
                              className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                            >
                              <Archive className="w-4 h-4" />
                              Unarchive
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button
                              onClick={() => handleDropdownAction('delete', product)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {product.category}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(product.price)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getDisplayStatus(product))}`}>
                      {getStatusIcon(getDisplayStatus(product))} {getDisplayStatus(product).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    
                    {/* Show approval status details for rejected products */}
                    {product.approval_status === 'rejected' && product.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="text-xs text-red-700 dark:text-red-300 font-medium mb-1">
                          ❌ Product Rejected
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400">
                          <strong>Reason:</strong> {product.rejection_reason}
                        </div>
                        {product.admin_notes && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                            <strong>Admin Notes:</strong> {product.admin_notes}
                          </div>
                        )}
                        {product.rejected_at && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                            <strong>Rejected:</strong> {new Date(product.rejected_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Show approval status details for pending products */}
                    {product.approval_status === 'pending' && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                          ⏳ Awaiting Admin Approval
                        </div>
                      </div>
                    )}
                    
                    {/* Show approval status details for under review products */}
                    {product.approval_status === 'under_review' && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                          🔍 Under Admin Review
                        </div>
                        {product.admin_notes && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            <strong>Admin Notes:</strong> {product.admin_notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>Stock: {product.stock_quantity}</span>
                    <span>SKU: {product.sku}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {product.status !== 'archived' ? (
                      <>
                        <button 
                          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          onClick={() => openEditModal(product)}
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg"
                          onClick={() => handleDropdownAction('view', product)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-red-400 hover:text-red-600 border border-gray-300 dark:border-gray-600 rounded-lg"
                          onClick={() => handleDropdownAction('delete', product)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          onClick={() => unarchiveProduct(product.id)}
                        >
                          <Archive className="w-3 h-3" />
                          Unarchive
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg"
                          onClick={() => handleDropdownAction('view', product)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-red-400 hover:text-red-600 border border-gray-300 dark:border-gray-600 rounded-lg"
                          onClick={() => handleDropdownAction('delete', product)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 hidden md:table-header-group">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      Category
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      Stock
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                      SKU
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${product.status === 'archived' ? 'opacity-75' : ''}`}>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center min-w-0">
                          <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 relative">
                            {product.image_url || (product.images && product.images[0]) ? (
                              <img 
                                className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover"
                                src={product.image_url || (product.images && product.images[0])} 
                                alt={product.name}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            {product.status === 'archived' && (
                              <div className="absolute -top-1 -left-1 bg-gray-600 text-white px-1 py-0.5 rounded-full text-xs">
                                A
                              </div>
                            )}
                          </div>
                          <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {product.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                              {product.brand}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 dark:text-white hidden md:table-cell">
                        <div className="truncate max-w-[100px]">{product.category}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 dark:text-white hidden md:table-cell">
                        {product.stock_quantity}
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getDisplayStatus(product))}`}>
                          {getStatusIcon(getDisplayStatus(product))} <span className="hidden sm:inline">{getDisplayStatus(product).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </span>
                        
                        {/* Show rejection reason for rejected products */}
                        {product.approval_status === 'rejected' && product.rejection_reason && (
                          <div className="mt-1 text-xs text-red-600 dark:text-red-400 truncate max-w-[150px]">
                            ❌ {product.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                        <div className="truncate max-w-[80px]">{product.sku}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDropdownAction('view', product)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <div className="relative dropdown-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(product.id);
                              }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              title="More"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            
                            {/* Dropdown Menu for List View */}
                            {openDropdown === product.id && (
                              <div className="absolute right-0 top-8 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
                                {product.status !== 'archived' ? (
                                  <>
                                    <button
                                      onClick={() => handleDropdownAction('duplicate', product)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                      <Copy className="w-4 h-4" />
                                      Duplicate
                                    </button>
                                    <button
                                      onClick={() => handleDropdownAction('archive', product)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                      <Archive className="w-4 h-4" />
                                      Archive
                                    </button>
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                    <button
                                      onClick={() => handleDropdownAction('delete', product)}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleDropdownAction('duplicate', product)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                      <Copy className="w-4 h-4" />
                                      Duplicate
                                    </button>
                                    <button
                                      onClick={() => unarchiveProduct(product.id)}
                                      className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                                    >
                                      <Archive className="w-4 h-4" />
                                      Unarchive
                                    </button>
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                    <button
                                      onClick={() => handleDropdownAction('delete', product)}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl p-0 relative flex flex-col max-h-[90vh]">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
              onClick={() => {
                resetForm();
                setShowAddModal(false);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 px-6 pt-6">Add Product</h2>
            <form className="space-y-4 px-6 pb-6 overflow-y-auto" style={{maxHeight: '75vh'}} onSubmit={e => { e.preventDefault(); addProduct(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.name} onChange={e => {
                  const newName = e.target.value;
                  setForm(f => ({
                    ...f, 
                    name: newName,
                    sku: generateSKU(newName, f.category)
                  }));
                }} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  {!showCustomCategory ? (
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                      value={form.category} 
                      onChange={e => {
                        if (e.target.value === 'Other') {
                          setShowCustomCategory(true);
                          setForm(f => ({...f, category: ''}));
                        } else {
                          setForm(f => ({...f, category: e.target.value}));
                        }
                      }}
                      required
                    >
                      <option value="">Select a category</option>
                      {predefinedCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                        value={form.category} 
                        onChange={e => setForm(f => ({...f, category: e.target.value}))} 
                        placeholder="Enter custom category" 
                        required 
                      />
                      <button 
                        type="button" 
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        onClick={() => {
                          setShowCustomCategory(false);
                          setForm(f => ({...f, category: ''}));
                        }}
                      >
                        ← Back to predefined categories
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.brand} onChange={e => setForm(f => ({...f, brand: e.target.value}))} required placeholder="e.g. SunPower" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                  <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Compare Price</label>
                  <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.comparePrice} onChange={e => setForm(f => ({...f, comparePrice: e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.capacity} onChange={e => setForm(f => ({...f, capacity: e.target.value}))} placeholder="e.g. 400W, 13.5 kWh" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Efficiency</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.efficiency} onChange={e => setForm(f => ({...f, efficiency: e.target.value}))} placeholder="e.g. 22.8%" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.warranty} onChange={e => setForm(f => ({...f, warranty: e.target.value}))} placeholder="e.g. 25 years" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                  <input type="number" min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} required />
                </div>
              </div>
              {/* Warranty Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty Terms</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={2} value={form.warrantyTerms} onChange={e => setForm(f => ({...f, warrantyTerms: e.target.value}))} placeholder="e.g. Covers manufacturing defects, excludes accidental damage, etc." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} required>
                    <option value="active">Active</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              {/* Image Upload - unchanged */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Images (min 3)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagePreviews.map((url, idx: number) => (
                    <div key={idx} className="relative w-20 h-20 rounded overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <img src={url} alt={`Product ${idx+1}`} className="object-cover w-full h-full" />
                      <button type="button" className="absolute top-0 right-0 bg-white dark:bg-gray-800 text-red-500 rounded-bl px-1 py-0.5 text-xs" onClick={() => removeImage(idx)}>&times;</button>
                    </div>
                  ))}
                </div>
                {form.images.length < 3 && <p className="text-xs text-red-500 mt-1">Please upload at least 3 images.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} required />
              </div>
              {/* Specifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specifications</label>
                {form.specifications.map((spec, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" placeholder="Key" className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={spec.key} onChange={e => setForm(f => { const specs = [...f.specifications]; specs[idx].key = e.target.value; return { ...f, specifications: specs }; })} />
                    <input type="text" placeholder="Value" className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={spec.value} onChange={e => setForm(f => { const specs = [...f.specifications]; specs[idx].value = e.target.value; return { ...f, specifications: specs }; })} />
                    <button type="button" className="text-red-500" onClick={() => setForm(f => ({ ...f, specifications: f.specifications.filter((_, i) => i !== idx) }))}>&times;</button>
                  </div>
                ))}
                <button type="button" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium" onClick={() => setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }))}>+ Add Specification</button>
              </div>
              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features</label>
                {form.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={feature} onChange={e => setForm(f => { const features = [...f.features]; features[idx] = e.target.value; return { ...f, features }; })} />
                    <button type="button" className="text-red-500" onClick={() => setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== idx) }))}>&times;</button>
                  </div>
                ))}
                <button type="button" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium" onClick={() => setForm(f => ({ ...f, features: [...f.features, ''] }))}>+ Add Feature</button>
              </div>
              {/* Shipping Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Fee</label>
                <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2" value={form.deliveryFee} onChange={e => setForm(f => ({...f, deliveryFee: e.target.value}))} placeholder="e.g. 10.00" />
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Range</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2" value={form.deliveryRange} onChange={e => setForm(f => ({...f, deliveryRange: e.target.value}))} placeholder="e.g. Within 20km" />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Time Start</label>
                    <input type="time" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.deliveryTimeStart} onChange={e => setForm(f => ({...f, deliveryTimeStart: e.target.value}))} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Time End</label>
                    <input type="time" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.deliveryTimeEnd} onChange={e => setForm(f => ({...f, deliveryTimeEnd: e.target.value}))} />
                  </div>
                </div>
              </div>
              {/* Flags */}
              <div className="flex gap-6 items-center mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">New Arrival</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  disabled={imageFiles.length < 3 || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl p-0 relative flex flex-col max-h-[90vh]">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
              onClick={() => {
                resetForm();
                setShowEditModal(false);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 px-6 pt-6">Edit Product</h2>
            <form className="space-y-4 px-6 pb-6 overflow-y-auto" style={{maxHeight: '75vh'}} onSubmit={e => { e.preventDefault(); updateProduct(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  {!showCustomCategory ? (
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                      value={form.category} 
                      onChange={e => {
                        if (e.target.value === 'Other') {
                          setShowCustomCategory(true);
                          setForm(f => ({...f, category: ''}));
                        } else {
                          setForm(f => ({...f, category: e.target.value}));
                        }
                      }}
                      required
                    >
                      <option value="">Select a category</option>
                      {predefinedCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                        value={form.category} 
                        onChange={e => setForm(f => ({...f, category: e.target.value}))} 
                        placeholder="Enter custom category" 
                        required 
                      />
                      <button 
                        type="button" 
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        onClick={() => {
                          setShowCustomCategory(false);
                          setForm(f => ({...f, category: ''}));
                        }}
                      >
                        ← Back to predefined categories
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.brand} onChange={e => setForm(f => ({...f, brand: e.target.value}))} required placeholder="e.g. SunPower" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                  <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Compare Price</label>
                  <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.comparePrice} onChange={e => setForm(f => ({...f, comparePrice: e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.capacity} onChange={e => setForm(f => ({...f, capacity: e.target.value}))} placeholder="e.g. 400W, 13.5 kWh" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Efficiency</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.efficiency} onChange={e => setForm(f => ({...f, efficiency: e.target.value}))} placeholder="e.g. 22.8%" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.warranty} onChange={e => setForm(f => ({...f, warranty: e.target.value}))} placeholder="e.g. 25 years" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                  <input type="number" min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} required />
                </div>
              </div>
              {/* Warranty Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty Terms</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={2} value={form.warrantyTerms} onChange={e => setForm(f => ({...f, warrantyTerms: e.target.value}))} placeholder="e.g. Covers manufacturing defects, excludes accidental damage, etc." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} required>
                    <option value="active">Active</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Images</label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Show existing images */}
                  {imagePreviews.map((url, idx: number) => (
                    <div key={idx} className="relative w-20 h-20 rounded overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <img src={url} alt={`Product ${idx+1}`} className="object-cover w-full h-full" />
                      <button type="button" className="absolute top-0 right-0 bg-white dark:bg-gray-800 text-red-500 rounded-bl px-1 py-0.5 text-xs" onClick={() => removeImage(idx)}>&times;</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} required />
              </div>
              {/* Specifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specifications</label>
                {form.specifications.map((spec, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" placeholder="Key" className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={spec.key} onChange={e => setForm(f => { const specs = [...f.specifications]; specs[idx].key = e.target.value; return { ...f, specifications: specs }; })} />
                    <input type="text" placeholder="Value" className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={spec.value} onChange={e => setForm(f => { const specs = [...f.specifications]; specs[idx].value = e.target.value; return { ...f, specifications: specs }; })} />
                    <button type="button" className="text-red-500" onClick={() => setForm(f => ({ ...f, specifications: f.specifications.filter((_, i) => i !== idx) }))}>&times;</button>
                  </div>
                ))}
                <button type="button" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium" onClick={() => setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }))}>+ Add Specification</button>
              </div>
              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features</label>
                {form.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={feature} onChange={e => setForm(f => { const features = [...f.features]; features[idx] = e.target.value; return { ...f, features }; })} />
                    <button type="button" className="text-red-500" onClick={() => setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== idx) }))}>&times;</button>
                  </div>
                ))}
                <button type="button" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium" onClick={() => setForm(f => ({ ...f, features: [...f.features, ''] }))}>+ Add Feature</button>
              </div>
              {/* Shipping Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Fee</label>
                <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2" value={form.deliveryFee} onChange={e => setForm(f => ({...f, deliveryFee: e.target.value}))} placeholder="e.g. 10.00" />
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Range</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2" value={form.deliveryRange} onChange={e => setForm(f => ({...f, deliveryRange: e.target.value}))} placeholder="e.g. Within 20km" />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Time Start</label>
                    <input type="time" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.deliveryTimeStart} onChange={e => setForm(f => ({...f, deliveryTimeStart: e.target.value}))} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Time End</label>
                    <input type="time" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.deliveryTimeEnd} onChange={e => setForm(f => ({...f, deliveryTimeEnd: e.target.value}))} />
                  </div>
                </div>
              </div>
              {/* Flags */}
              <div className="flex gap-6 items-center mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">New Arrival</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    resetForm();
                    setShowEditModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {showViewModal && viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl p-6 relative flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
              onClick={() => setShowViewModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {viewingProduct.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {viewingProduct.description}
              </p>
            </div>

            {/* Product Images */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Product Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(viewingProduct.images || [viewingProduct.image_url]).filter((url): url is string => Boolean(url)).map((imageUrl: string, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={imageUrl} 
                      alt={`${viewingProduct.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingProduct.category}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Brand:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingProduct.brand}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">SKU:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingProduct.sku}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      viewingProduct.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      viewingProduct.status === 'out_of_stock' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {viewingProduct.status === 'active' ? 'Active' : 
                       viewingProduct.status === 'out_of_stock' ? 'Out of Stock' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Pricing & Stock</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Price:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(viewingProduct.price)}</p>
                  </div>
                  {viewingProduct.compare_price && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Compare Price:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(viewingProduct.compare_price)}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Stock:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingProduct.stock_quantity} units</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Technical Specs</h3>
                <div className="space-y-2">
                  {viewingProduct.capacity && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Capacity:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{viewingProduct.capacity}</p>
                    </div>
                  )}
                  {viewingProduct.efficiency && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{viewingProduct.efficiency}</p>
                    </div>
                  )}
                  {viewingProduct.warranty && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Warranty:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{viewingProduct.warranty}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Shipping</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Fee:</span>
                    <p className="font-medium text-gray-900 dark:text-white">${viewingProduct.delivery_fee}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Range:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingProduct.delivery_range}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Time:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingProduct.delivery_time_start} - {viewingProduct.delivery_time_end}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Flags</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">New Arrival:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      viewingProduct.is_new ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {viewingProduct.is_new ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Featured:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      viewingProduct.is_featured ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {viewingProduct.is_featured ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {viewingProduct.specifications && viewingProduct.specifications.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Specifications</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingProduct.specifications.map((spec: { key: string; value: string }, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{spec.key}:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            {viewingProduct.features && viewingProduct.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Features</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1">
                    {viewingProduct.features.map((feature: string, idx: number) => (
                      <li key={idx} className="text-gray-900 dark:text-white">{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(viewingProduct);
                }}
              >
                Edit Product
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 
 
 
 
 
 