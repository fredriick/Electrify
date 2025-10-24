"use client";

import { useState } from "react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { 
  Package, 
  Search, 
  Eye,
  Edit,
  Trash2,
  LayoutList,
  LayoutGrid,
  Download,
  CheckCircle,
  XCircle,
  X
} from "lucide-react";

// Mock data (copy structure from All Products page, but only pending products)
const mockProducts = [
  {
    id: "p1",
    name: "Solar Panel X100",
    description: "High-efficiency solar panel for residential use.",
    price: 299.99,
    category: "Solar Panels",
    subcategory: "Monocrystalline",
    supplier: "SunPower Inc.",
    supplierId: "s1",
    status: "pending",
    stock: 50,
    sku: "SPX100",
    images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop"],
    rating: 4.5,
    reviewCount: 12,
    salesCount: 0,
    revenue: 0,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-12T12:00:00Z",
    isFeatured: false,
    isNew: true,
    isOnSale: false,
    warranty: "10 years",
    weight: 18,
    dimensions: "1.7m x 1m x 0.04m",
    specifications: { Power: "400W", Efficiency: "22%" },
    tags: ["solar", "panel", "energy"],
    shippingClass: "standard",
    taxClass: "standard",
    compliance: ["CE", "UL"],
    certifications: ["TUV"],
    safetyRating: 5,
    environmentalScore: 9,
    energyEfficiency: "A+",
    installationRequired: true,
    maintenanceRequired: false,
    warrantyPeriod: "10 years",
    returnPolicy: "30 days",
    supplierRating: 4.7,
    supplierVerified: true,
    supplierCertifications: ["ISO 9001"],
    supplierLocation: "California, USA",
    supplierContact: "contact@sunpower.com",
    supplierTerms: "Net 30",
    commissionRate: 10,
    profitMargin: 20,
    costPrice: 240,
    markupPercentage: 25,
    competitiveAnalysis: { competitorPrice: 320, competitorName: "SolarMax", priceDifference: -20 },
    marketTrends: { demandTrend: "increasing", seasonality: ["Spring", "Summer"], peakSeasons: ["Summer"] },
    inventoryAlerts: { lowStockThreshold: 10, reorderPoint: 20, maxStockLevel: 100 },
    performanceMetrics: { conversionRate: 0, clickThroughRate: 0, averageOrderValue: 0, customerSatisfaction: 0 }
  },
  // Add more mock pending products as needed
];

export default function PendingApprovalProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Filter products based on search and filters
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesSupplier = supplierFilter === 'all' || product.supplier === supplierFilter;
    return matchesSearch && matchesCategory && matchesSupplier;
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

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'ID', 'Name', 'SKU', 'Category', 'Supplier', 'Status', 'Price', 'Stock', 'Rating', 'Created At'
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
      product.createdAt
    ]);
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pending_products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApprove = (productId: string) => {
    if (confirm('Are you sure you want to approve this product?')) {
      // Here you would typically make an API call to approve the product
      console.log('Approving product:', productId);
      alert('Product approved successfully!');
      // Remove the product from the list or update its status
      // For now, we'll just show a success message
    }
  };

  const handleReject = (productId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      // Here you would typically make an API call to reject the product
      console.log('Rejecting product:', productId, 'Reason:', reason);
      alert('Product rejected successfully!');
      // Remove the product from the list or update its status
      // For now, we'll just show a success message
    }
  };

  const handleView = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowProductModal(true);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Package className="w-7 h-7 text-yellow-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Product Approvals</h1>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            {/* Icon-only Grid/List Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => setViewMode('list')}
              type="button"
                title="List View"
            >
                <LayoutList className="w-5 h-5" />
            </button>
            <button
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-purple-600 dark:text-purple-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => setViewMode('grid')}
              type="button"
                title="Grid View"
            >
                <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            </div>
          </div>
          
          {/* Purple Export Button */}
            <button
              onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
              type="button"
            >
            <Download className="w-4 h-4" />
            Export
            </button>
        </div>
        {/* Bulk actions and filters can be added here if needed */}
        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {viewMode === 'list' ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={e => handleSelectProduct(product.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{product.name}</td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">{product.supplier}</td>
                    <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">{new Date(product.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button 
                        className="text-green-600 hover:text-green-800 transition-colors" 
                        title="Approve"
                        onClick={() => handleApprove(product.id)}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 transition-colors" 
                        title="Reject"
                        onClick={() => handleReject(product.id)}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-800 transition-colors" 
                        title="View"
                        onClick={() => handleView(product.id)}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {currentProducts.map(product => (
                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop";
                      }}
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h2>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{product.category}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Supplier: {product.supplier}</div>
                    </div>
                  </div>
                  <div className="flex-1" />
                  <div className="flex gap-2 mt-2">
                    <button 
                      className="text-green-600 hover:text-green-800 transition-colors" 
                      title="Approve"
                      onClick={() => handleApprove(product.id)}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-800 transition-colors" 
                      title="Reject"
                      onClick={() => handleReject(product.id)}
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button 
                      className="text-blue-600 hover:text-blue-800 transition-colors" 
                      title="View"
                      onClick={() => handleView(product.id)}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} pending products
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Details</h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Image */}
                <div>
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop";
                    }}
                  />
                </div>

                {/* Product Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProduct.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{selectedProduct.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">${selectedProduct.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedProduct.stock}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</label>
                      <p className="text-gray-900 dark:text-white">{selectedProduct.sku}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                      <p className="text-gray-900 dark:text-white">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</label>
                      <p className="text-gray-900 dark:text-white">{selectedProduct.supplier}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        {selectedProduct.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Warranty</label>
                    <p className="text-gray-900 dark:text-white">{selectedProduct.warranty}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Dimensions</label>
                    <p className="text-gray-900 dark:text-white">{selectedProduct.dimensions}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</label>
                    <p className="text-gray-900 dark:text-white">{selectedProduct.weight} kg</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                    <p className="text-gray-900 dark:text-white">{new Date(selectedProduct.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Specifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{key}</label>
                      <p className="text-gray-900 dark:text-white">{value as string}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    handleApprove(selectedProduct.id);
                    setShowProductModal(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Product
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedProduct.id);
                    setShowProductModal(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Product
                </button>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
} 