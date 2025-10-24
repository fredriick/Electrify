'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  Package, 
  Search, 
  Eye,
  Edit,
  Trash2,
  LayoutList,
  LayoutGrid,
  Download,
  Activity,
  Star,
  Settings,
  BarChart3,
  Database,
  Network,
  Globe,
  Server,
  Zap,
  Bell,
  Clock,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Cpu,
  HardDrive,
  MapPin,
  Monitor,
  Plus,
  X,
  CheckCircle,
  DollarSign,
  ShoppingCart,
  Users,
  Tag
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory: string;
  supplier: string;
  supplierId: string;
  status: 'active' | 'inactive' | 'pending' | 'draft' | 'rejected' | 'discontinued';
  stock: number;
  sku: string;
  barcode?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  salesCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  discountPercentage?: number;
  warranty: string;
  weight: number;
  dimensions: string;
  specifications: Record<string, string>;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  shippingClass: 'standard' | 'express' | 'free';
  taxClass: 'standard' | 'reduced' | 'zero';
  compliance: string[];
  certifications: string[];
  safetyRating: number;
  environmentalScore: number;
  energyEfficiency: string;
  installationRequired: boolean;
  maintenanceRequired: boolean;
  warrantyPeriod: string;
  returnPolicy: string;
  supplierRating: number;
  supplierVerified: boolean;
  supplierCertifications: string[];
  supplierLocation: string;
  supplierContact: string;
  supplierWebsite?: string;
  supplierTerms: string;
  commissionRate: number;
  profitMargin: number;
  costPrice: number;
  markupPercentage: number;
  competitiveAnalysis: {
    competitorPrice: number;
    competitorName: string;
    priceDifference: number;
  };
  marketTrends: {
    demandTrend: 'increasing' | 'stable' | 'decreasing';
    seasonality: string[];
    peakSeasons: string[];
  };
  inventoryAlerts: {
    lowStockThreshold: number;
    reorderPoint: number;
    maxStockLevel: number;
  };
  performanceMetrics: {
    conversionRate: number;
    clickThroughRate: number;
    averageOrderValue: number;
    customerSatisfaction: number;
  };
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Solar Panel 400W Monocrystalline',
    description: 'High-efficiency monocrystalline solar panel with 400W output, perfect for residential and commercial installations.',
    price: 299.99,
    originalPrice: 399.99,
    category: 'Solar Panels',
    subcategory: 'Monocrystalline',
    supplier: 'SolarTech Solutions',
    supplierId: 'supp_001',
    status: 'active',
    stock: 150,
    sku: 'SP-400W-MONO-001',
    barcode: '1234567890123',
    images: ['/images/solar-panel-1.jpg'],
    rating: 4.8,
    reviewCount: 127,
    salesCount: 89,
    revenue: 26699.11,
    createdAt: '2024-01-15',
    updatedAt: '2025-07-20',
    approvedAt: '2024-01-20',
    approvedBy: 'Alexander Thompson',
    isFeatured: true,
    isNew: false,
    isOnSale: true,
    discountPercentage: 25,
    warranty: '25 years',
    weight: 22.5,
    dimensions: '1765 x 1048 x 35 mm',
    specifications: {
      'Power Output': '400W',
      'Efficiency': '20.5%',
      'Cell Type': 'Monocrystalline',
      'Frame Material': 'Aluminum',
      'Glass Type': 'Tempered',
      'Operating Temperature': '-40°C to +85°C'
    },
    tags: ['solar', 'renewable energy', 'monocrystalline', 'high efficiency'],
    shippingClass: 'standard',
    taxClass: 'standard',
    compliance: ['UL 1703', 'IEC 61215', 'IEC 61730'],
    certifications: ['CEC Listed', 'FCC Compliant'],
    safetyRating: 4.9,
    environmentalScore: 4.7,
    energyEfficiency: 'A+',
    installationRequired: true,
    maintenanceRequired: false,
    warrantyPeriod: '25 years',
    returnPolicy: '30 days',
    supplierRating: 4.8,
    supplierVerified: true,
    supplierCertifications: ['ISO 9001', 'ISO 14001'],
    supplierLocation: 'California, USA',
    supplierContact: '+1 (555) 123-4567',
    supplierWebsite: 'https://solartech.com',
    supplierTerms: 'Net 30',
    commissionRate: 15,
    profitMargin: 35,
    costPrice: 194.99,
    markupPercentage: 54,
    competitiveAnalysis: {
      competitorPrice: 325.00,
      competitorName: 'SolarMax',
      priceDifference: -25.01
    },
    marketTrends: {
      demandTrend: 'increasing',
      seasonality: ['Spring', 'Summer'],
      peakSeasons: ['Q2', 'Q3']
    },
    inventoryAlerts: {
      lowStockThreshold: 20,
      reorderPoint: 30,
      maxStockLevel: 200
    },
    performanceMetrics: {
      conversionRate: 3.2,
      clickThroughRate: 2.8,
      averageOrderValue: 299.99,
      customerSatisfaction: 4.8
    }
  },
  {
    id: '2',
    name: 'Smart Solar Inverter 5000W Hybrid',
    description: 'Advanced hybrid solar inverter with battery backup capability and smart monitoring features.',
    price: 899.99,
    category: 'Solar Inverters',
    subcategory: 'Hybrid',
    supplier: 'PowerFlow Systems',
    supplierId: 'supp_002',
    status: 'active',
    stock: 75,
    sku: 'SI-5000W-HYB-001',
    images: ['/images/inverter-1.jpg'],
    rating: 4.9,
    reviewCount: 89,
    salesCount: 45,
    revenue: 40499.55,
    createdAt: '2024-02-10',
    updatedAt: '2025-07-19',
    approvedAt: '2024-02-15',
    approvedBy: 'Sarah Johnson',
    isFeatured: true,
    isNew: true,
    isOnSale: false,
    warranty: '10 years',
    weight: 15.2,
    dimensions: '450 x 300 x 150 mm',
    specifications: {
      'Power Output': '5000W',
      'Efficiency': '96.5%',
      'Battery Voltage': '48V',
      'Grid Connection': 'Yes',
      'Monitoring': 'WiFi/4G',
      'Protection': 'IP65'
    },
    tags: ['inverter', 'hybrid', 'smart', 'battery backup'],
    shippingClass: 'express',
    taxClass: 'standard',
    compliance: ['UL 1741', 'IEEE 1547'],
    certifications: ['CEC Listed'],
    safetyRating: 4.8,
    environmentalScore: 4.6,
    energyEfficiency: 'A+',
    installationRequired: true,
    maintenanceRequired: true,
    warrantyPeriod: '10 years',
    returnPolicy: '30 days',
    supplierRating: 4.7,
    supplierVerified: true,
    supplierCertifications: ['ISO 9001'],
    supplierLocation: 'Texas, USA',
    supplierContact: '+1 (555) 234-5678',
    supplierTerms: 'Net 45',
    commissionRate: 12,
    profitMargin: 40,
    costPrice: 539.99,
    markupPercentage: 67,
    competitiveAnalysis: {
      competitorPrice: 950.00,
      competitorName: 'InverterPro',
      priceDifference: -50.01
    },
    marketTrends: {
      demandTrend: 'increasing',
      seasonality: ['Year-round'],
      peakSeasons: ['Q1', 'Q2', 'Q3', 'Q4']
    },
    inventoryAlerts: {
      lowStockThreshold: 10,
      reorderPoint: 15,
      maxStockLevel: 100
    },
    performanceMetrics: {
      conversionRate: 4.1,
      clickThroughRate: 3.5,
      averageOrderValue: 899.99,
      customerSatisfaction: 4.9
    }
  },
  {
    id: '3',
    name: 'Solar Battery Storage 10kWh Lithium',
    description: 'High-capacity lithium-ion battery storage system for solar energy storage and backup power.',
    price: 2499.99,
    category: 'Battery Storage',
    subcategory: 'Lithium-Ion',
    supplier: 'EnergyStore Solutions',
    supplierId: 'supp_003',
    status: 'pending',
    stock: 25,
    sku: 'BS-10KWH-LI-001',
    images: ['/images/battery-1.jpg'],
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    revenue: 0,
    createdAt: '2025-07-15',
    updatedAt: '2025-07-20',
    isFeatured: false,
    isNew: true,
    isOnSale: false,
    warranty: '10 years',
    weight: 85.0,
    dimensions: '600 x 400 x 200 mm',
    specifications: {
      'Capacity': '10kWh',
      'Chemistry': 'Lithium-Ion',
      'Voltage': '48V',
      'Cycle Life': '6000 cycles',
      'Depth of Discharge': '90%',
      'Operating Temperature': '-10°C to +50°C'
    },
    tags: ['battery', 'storage', 'lithium-ion', 'backup power'],
    shippingClass: 'express',
    taxClass: 'standard',
    compliance: ['UL 1973', 'IEC 62619'],
    certifications: ['UN38.3'],
    safetyRating: 0,
    environmentalScore: 4.5,
    energyEfficiency: 'A',
    installationRequired: true,
    maintenanceRequired: false,
    warrantyPeriod: '10 years',
    returnPolicy: '30 days',
    supplierRating: 4.6,
    supplierVerified: true,
    supplierCertifications: ['ISO 9001', 'ISO 14001'],
    supplierLocation: 'Nevada, USA',
    supplierContact: '+1 (555) 345-6789',
    supplierTerms: 'Net 30',
    commissionRate: 18,
    profitMargin: 45,
    costPrice: 1374.99,
    markupPercentage: 82,
    competitiveAnalysis: {
      competitorPrice: 2800.00,
      competitorName: 'BatteryMax',
      priceDifference: -300.01
    },
    marketTrends: {
      demandTrend: 'increasing',
      seasonality: ['Year-round'],
      peakSeasons: ['Q2', 'Q3']
    },
    inventoryAlerts: {
      lowStockThreshold: 5,
      reorderPoint: 8,
      maxStockLevel: 50
    },
    performanceMetrics: {
      conversionRate: 0,
      clickThroughRate: 0,
      averageOrderValue: 0,
      customerSatisfaction: 0
    }
  },
  {
    id: '4',
    name: 'Solar Mounting System Rooftop',
    description: 'Complete rooftop solar mounting system with rails, clamps, and hardware for secure panel installation.',
    price: 199.99,
    category: 'Mounting Systems',
    subcategory: 'Rooftop',
    supplier: 'MountPro Industries',
    supplierId: 'supp_004',
    status: 'active',
    stock: 200,
    sku: 'MS-ROOF-001',
    images: ['/images/mounting-1.jpg'],
    rating: 4.6,
    reviewCount: 156,
    salesCount: 234,
    revenue: 46798.66,
    createdAt: '2024-03-20',
    updatedAt: '2025-07-18',
    approvedAt: '2024-03-25',
    approvedBy: 'Michael Chen',
    isFeatured: false,
    isNew: false,
    isOnSale: false,
    warranty: '5 years',
    weight: 8.5,
    dimensions: 'Package: 120 x 80 x 20 cm',
    specifications: {
      'Material': 'Aluminum',
      'Load Capacity': '2000 lbs',
      'Roof Pitch': '0-45 degrees',
      'Panel Compatibility': 'Standard',
      'Corrosion Resistance': 'Yes',
      'Wind Rating': '140 mph'
    },
    tags: ['mounting', 'rooftop', 'installation', 'hardware'],
    shippingClass: 'standard',
    taxClass: 'standard',
    compliance: ['UL 2703'],
    certifications: ['ICC-ES'],
    safetyRating: 4.7,
    environmentalScore: 4.8,
    energyEfficiency: 'N/A',
    installationRequired: true,
    maintenanceRequired: false,
    warrantyPeriod: '5 years',
    returnPolicy: '30 days',
    supplierRating: 4.5,
    supplierVerified: true,
    supplierCertifications: ['ISO 9001'],
    supplierLocation: 'Ohio, USA',
    supplierContact: '+1 (555) 456-7890',
    supplierTerms: 'Net 30',
    commissionRate: 10,
    profitMargin: 30,
    costPrice: 139.99,
    markupPercentage: 43,
    competitiveAnalysis: {
      competitorPrice: 225.00,
      competitorName: 'MountMaster',
      priceDifference: -25.01
    },
    marketTrends: {
      demandTrend: 'stable',
      seasonality: ['Spring', 'Summer'],
      peakSeasons: ['Q2', 'Q3']
    },
    inventoryAlerts: {
      lowStockThreshold: 30,
      reorderPoint: 50,
      maxStockLevel: 300
    },
    performanceMetrics: {
      conversionRate: 2.8,
      clickThroughRate: 2.1,
      averageOrderValue: 199.99,
      customerSatisfaction: 4.6
    }
  },
  {
    id: '5',
    name: 'Solar Monitoring System WiFi',
    description: 'Advanced WiFi-enabled solar monitoring system with real-time data tracking and mobile app integration.',
    price: 149.99,
    category: 'Monitoring Systems',
    subcategory: 'WiFi',
    supplier: 'MonitorTech',
    supplierId: 'supp_005',
    status: 'active',
    stock: 100,
    sku: 'MS-WIFI-001',
    images: ['/images/monitoring-1.jpg'],
    rating: 4.7,
    reviewCount: 89,
    salesCount: 67,
    revenue: 10049.33,
    createdAt: '2024-04-10',
    updatedAt: '2025-07-17',
    approvedAt: '2024-04-15',
    approvedBy: 'David Wilson',
    isFeatured: false,
    isNew: false,
    isOnSale: true,
    discountPercentage: 15,
    warranty: '3 years',
    weight: 0.5,
    dimensions: '100 x 80 x 25 mm',
    specifications: {
      'Connectivity': 'WiFi 2.4GHz',
      'Data Accuracy': '99.9%',
      'Update Frequency': 'Real-time',
      'App Compatibility': 'iOS/Android',
      'Cloud Storage': 'Yes',
      'Alerts': 'Email/SMS'
    },
    tags: ['monitoring', 'wifi', 'smart', 'tracking'],
    shippingClass: 'standard',
    taxClass: 'standard',
    compliance: ['FCC Part 15'],
    certifications: ['CE Mark'],
    safetyRating: 4.8,
    environmentalScore: 4.9,
    energyEfficiency: 'A+',
    installationRequired: false,
    maintenanceRequired: false,
    warrantyPeriod: '3 years',
    returnPolicy: '30 days',
    supplierRating: 4.4,
    supplierVerified: true,
    supplierCertifications: ['ISO 9001'],
    supplierLocation: 'Washington, USA',
    supplierContact: '+1 (555) 567-8901',
    supplierTerms: 'Net 30',
    commissionRate: 8,
    profitMargin: 25,
    costPrice: 112.49,
    markupPercentage: 33,
    competitiveAnalysis: {
      competitorPrice: 175.00,
      competitorName: 'MonitorPro',
      priceDifference: -25.01
    },
    marketTrends: {
      demandTrend: 'increasing',
      seasonality: ['Year-round'],
      peakSeasons: ['Q1', 'Q2', 'Q3', 'Q4']
    },
    inventoryAlerts: {
      lowStockThreshold: 15,
      reorderPoint: 25,
      maxStockLevel: 150
    },
    performanceMetrics: {
      conversionRate: 3.5,
      clickThroughRate: 2.9,
      averageOrderValue: 149.99,
      customerSatisfaction: 4.7
    }
  }
];

export default function AllProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filter products based on search and filters
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || product.supplier === supplierFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(currentProducts.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'draft': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'discontinued': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const activeProducts = mockProducts.filter(p => p.status === 'active').length;
  const pendingProducts = mockProducts.filter(p => p.status === 'pending').length;
  const totalProducts = mockProducts.length;
  const totalRevenue = mockProducts.reduce((sum, p) => sum + p.revenue, 0);

  // Modal handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetailModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditProductModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete this product "${product.name}"? This action cannot be undone.`)) {
      // Here you would typically make an API call to delete the product
      console.log('Deleting product:', product.id);
      alert('Product deleted successfully!');
    }
  };

  const handleSaveProductEdit = () => {
    if (editingProduct) {
      // Here you would typically make an API call to update the product
      console.log('Updating product:', editingProduct);
      setShowEditProductModal(false);
      setEditingProduct(null);
      alert('Product updated successfully!');
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Name',
      'SKU',
      'Category',
      'Supplier',
      'Status',
      'Price',
      'Stock',
      'Rating',
      'Sales Count',
      'Revenue',
      'Created At',
      'Approved At',
      'Approved By',
      'Warranty',
      'Weight',
      'Dimensions',
      'Is Featured',
      'Is New',
      'Is On Sale',
      'Discount Percentage',
      'Commission Rate',
      'Profit Margin',
      'Cost Price',
      'Markup Percentage'
    ];

    const csvData = filteredProducts.map(product => [
      product.id,
      product.name,
      product.sku,
      product.category,
      product.supplier,
      product.status,
      product.price,
      product.stock,
      product.rating,
      product.salesCount,
      product.revenue,
      new Date(product.createdAt).toLocaleDateString(),
      product.approvedAt ? new Date(product.approvedAt).toLocaleDateString() : '',
      product.approvedBy || '',
      product.warranty,
      product.weight,
      product.dimensions,
      product.isFeatured ? 'Yes' : 'No',
      product.isNew ? 'Yes' : 'No',
      product.isOnSale ? 'Yes' : 'No',
      product.discountPercentage || '',
      product.commissionRate,
      product.profitMargin,
      product.costPrice,
      product.markupPercentage
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `all_products_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              All Products
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive product management and oversight
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow text-purple-600' : 'text-gray-500 dark:text-gray-300'}`}
                title="List View"
              >
                <LayoutList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow text-purple-600' : 'text-gray-500 dark:text-gray-300'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={exportToCSV}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalProducts}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Products</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{activeProducts}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{pendingProducts}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products by name, description, SKU, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="Solar Panels">Solar Panels</option>
                <option value="Solar Inverters">Solar Inverters</option>
                <option value="Battery Storage">Battery Storage</option>
                <option value="Mounting Systems">Mounting Systems</option>
                <option value="Monitoring Systems">Monitoring Systems</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            {/* Supplier Filter */}
            <div className="lg:w-48">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Suppliers</option>
                <option value="SolarTech Solutions">SolarTech Solutions</option>
                <option value="PowerFlow Systems">PowerFlow Systems</option>
                <option value="EnergyStore Solutions">EnergyStore Solutions</option>
                <option value="MountPro Industries">MountPro Industries</option>
                <option value="MonitorTech">MonitorTech</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedProducts.length} selected
                </span>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Table or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{product.supplier}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${product.price}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{product.stock}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewProduct(product)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Product Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                    />
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleViewProduct(product)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.sku}</p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{product.category}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">${product.price}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{product.rating} ({product.reviewCount} reviews)</span>
                  </div>

                  {/* Stock */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    <span>Stock: {product.stock}</span>
                  </div>

                  {/* Supplier */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{product.supplier}</span>
                  </div>

                  {product.isFeatured && (
                    <div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
                      <Star className="w-4 h-4 mr-2" />
                      <span>Featured</span>
                    </div>
                  )}

                  {product.isOnSale && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <Tag className="w-4 h-4 mr-2" />
                      <span>{product.discountPercentage}% OFF</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Revenue: ${product.revenue.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Product Detail Modal */}
        {showProductDetailModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Details</h2>
                <button
                  onClick={() => setShowProductDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Product Images */}
                  <div>
                    <div className="w-full h-64 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center mb-4">
                      <Package className="w-16 h-16 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProduct.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selectedProduct.description}</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">SKU: {selectedProduct.sku}</p>
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedProduct.status)}`}>
                          {selectedProduct.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                        <p className="text-gray-900 dark:text-white">{selectedProduct.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subcategory</label>
                        <p className="text-gray-900 dark:text-white">{selectedProduct.subcategory}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</label>
                        <p className="text-gray-900 dark:text-white">{selectedProduct.supplier}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</label>
                        <p className="text-gray-900 dark:text-white">${selectedProduct.price}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock</label>
                        <p className="text-gray-900 dark:text-white">{selectedProduct.stock}</p>
                      </div>
                    </div>

                    {/* Product Stats */}
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProduct.rating}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProduct.reviewCount}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Reviews</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProduct.salesCount}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sales</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">${selectedProduct.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Financial Information</label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Cost Price</p>
                          <p className="text-gray-900 dark:text-white">${selectedProduct.costPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.profitMargin}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Commission Rate</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.commissionRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Markup Percentage</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.markupPercentage}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Details</label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Dimensions</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.dimensions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Warranty</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.warranty}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Warranty Period</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.warrantyPeriod}</p>
                        </div>
                      </div>
                    </div>

                    {/* Supplier Information */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier Information</label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.supplierLocation}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.supplierContact}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.supplierRating}/5</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.supplierVerified ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedProduct.tags.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedProduct.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compliance */}
                    {selectedProduct.compliance.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Compliance</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedProduct.compliance.map((comp, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Settings */}
                    <div className="flex gap-2">
                      {selectedProduct.isFeatured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </span>
                      )}
                      {selectedProduct.isNew && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          <Plus className="w-3 h-3 mr-1" />
                          New
                        </span>
                      )}
                      {selectedProduct.isOnSale && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <Tag className="w-3 h-3 mr-1" />
                          On Sale
                        </span>
                      )}
                    </div>

                    {/* Timeline Information */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeline</label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                          <p className="text-gray-900 dark:text-white">{new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Updated</p>
                          <p className="text-gray-900 dark:text-white">{new Date(selectedProduct.updatedAt).toLocaleDateString()}</p>
                        </div>
                        {selectedProduct.approvedAt && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                            <p className="text-gray-900 dark:text-white">{new Date(selectedProduct.approvedAt).toLocaleDateString()}</p>
                          </div>
                        )}
                        {selectedProduct.approvedBy && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Approved By</p>
                            <p className="text-gray-900 dark:text-white">{selectedProduct.approvedBy}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditProductModal && editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Product</h2>
                <button
                  onClick={() => setShowEditProductModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, sku: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, category: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={editingProduct.subcategory}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, subcategory: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="draft">Draft</option>
                    <option value="rejected">Rejected</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, stock: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.costPrice}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, costPrice: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editingProduct.commissionRate}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, commissionRate: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editingProduct.weight}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, weight: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={editingProduct.dimensions}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, dimensions: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty</label>
                  <input
                    type="text"
                    value={editingProduct.warranty}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, warranty: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProductEdit}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditProductModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
} 