'use client';

import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentCategory?: string;
  productCount: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  imageUrl?: string;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}

const CategoriesPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState<'name' | 'productCount' | 'createdAt' | 'updatedAt' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryDetailModal, setShowCategoryDetailModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Mock data for categories
  const [categories] = useState<Category[]>([
    {
      id: '1',
      name: 'Solar Panels',
      description: 'High-efficiency solar panels for residential and commercial use',
      slug: 'solar-panels',
      productCount: 45,
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:22:00Z',
      createdBy: 'admin@electrify.com',
      imageUrl: '/images/categories/solar-panels.jpg',
      isFeatured: true,
      sortOrder: 1,
      seoTitle: 'Solar Panels - Premium Quality',
      seoDescription: 'Browse our selection of high-quality solar panels'
    },
    {
      id: '2',
      name: 'Inverters',
      description: 'Solar inverters for converting DC to AC power',
      slug: 'inverters',
      productCount: 32,
      status: 'active',
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-18T11:45:00Z',
      createdBy: 'admin@electrify.com',
      imageUrl: '/images/categories/inverters.jpg',
      isFeatured: true,
      sortOrder: 2,
      seoTitle: 'Solar Inverters',
      seoDescription: 'Quality solar inverters for your solar system'
    },
    {
      id: '3',
      name: 'Batteries',
      description: 'Energy storage solutions for solar systems',
      slug: 'batteries',
      productCount: 28,
      status: 'active',
      createdAt: '2024-01-12T16:20:00Z',
      updatedAt: '2024-01-19T13:30:00Z',
      createdBy: 'admin@electrify.com',
      imageUrl: '/images/categories/batteries.jpg',
      isFeatured: false,
      sortOrder: 3,
      seoTitle: 'Solar Batteries',
      seoDescription: 'Reliable energy storage solutions'
    },
    {
      id: '4',
      name: 'Mounting Systems',
      description: 'Racking and mounting solutions for solar installations',
      slug: 'mounting-systems',
      productCount: 19,
      status: 'active',
      createdAt: '2024-01-08T14:45:00Z',
      updatedAt: '2024-01-17T10:15:00Z',
      createdBy: 'admin@electrify.com',
      imageUrl: '/images/categories/mounting.jpg',
      isFeatured: false,
      sortOrder: 4,
      seoTitle: 'Solar Mounting Systems',
      seoDescription: 'Professional mounting solutions for solar panels'
    },
    {
      id: '5',
      name: 'Monitoring Systems',
      description: 'Real-time monitoring and control systems',
      slug: 'monitoring-systems',
      productCount: 15,
      status: 'pending',
      createdAt: '2024-01-25T11:30:00Z',
      updatedAt: '2024-01-25T11:30:00Z',
      createdBy: 'supplier@techsolar.com',
      imageUrl: '/images/categories/monitoring.jpg',
      isFeatured: false,
      sortOrder: 5,
      seoTitle: 'Solar Monitoring Systems',
      seoDescription: 'Advanced monitoring solutions for solar installations'
    },
    {
      id: '6',
      name: 'Accessories',
      description: 'Cables, connectors, and other solar accessories',
      slug: 'accessories',
      productCount: 67,
      status: 'active',
      createdAt: '2024-01-05T08:20:00Z',
      updatedAt: '2024-01-16T15:40:00Z',
      createdBy: 'admin@electrify.com',
      imageUrl: '/images/categories/accessories.jpg',
      isFeatured: false,
      sortOrder: 6,
      seoTitle: 'Solar Accessories',
      seoDescription: 'Complete range of solar installation accessories'
    },
    {
      id: '7',
      name: 'Commercial Systems',
      description: 'Large-scale commercial solar solutions',
      slug: 'commercial-systems',
      productCount: 12,
      status: 'active',
      createdAt: '2024-01-20T13:10:00Z',
      updatedAt: '2024-01-22T09:25:00Z',
      createdBy: 'admin@electrify.com',
      imageUrl: '/images/categories/commercial.jpg',
      isFeatured: true,
      sortOrder: 7,
      seoTitle: 'Commercial Solar Systems',
      seoDescription: 'Professional commercial solar solutions'
    },
    {
      id: '8',
      name: 'Residential Kits',
      description: 'Complete residential solar system packages',
      slug: 'residential-kits',
      productCount: 23,
      status: 'inactive',
      createdAt: '2024-01-14T10:50:00Z',
      updatedAt: '2024-01-21T16:35:00Z',
      createdBy: 'admin@electrify.com',
      imageUrl: '/images/categories/residential.jpg',
      isFeatured: false,
      sortOrder: 8,
      seoTitle: 'Residential Solar Kits',
      seoDescription: 'Complete solar solutions for homes'
    }
  ]);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = sortedCategories.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedCategories.length === currentCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(currentCategories.map(category => category.id));
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for categories:`, selectedCategories);
    setSelectedCategories([]);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Description', 'Slug', 'Product Count', 'Status', 'Created At', 'Updated At', 'Created By', 'Featured', 'Sort Order'];
    const csvContent = [
      headers.join(','),
      ...filteredCategories.map(category => [
        category.id,
        `"${category.name}"`,
        `"${category.description}"`,
        category.slug,
        category.productCount,
        category.status,
        category.createdAt,
        category.updatedAt,
        category.createdBy,
        category.isFeatured,
        category.sortOrder
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'pending': return <div className="w-4 h-4 rounded-full bg-yellow-400 animate-pulse" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  // Modal handlers
  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryDetailModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditCategoryModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    if (confirm(`Are you sure you want to delete this category "${category.name}"? This action cannot be undone.`)) {
      // Here you would typically make an API call to delete the category
      console.log('Deleting category:', category.id);
      alert('Category deleted successfully!');
    }
  };

  const handleSaveCategoryEdit = () => {
    if (editingCategory) {
      // Here you would typically make an API call to update the category
      console.log('Updating category:', editingCategory);
      setShowEditCategoryModal(false);
      setEditingCategory(null);
      alert('Category updated successfully!');
    }
  };

  return (
    <SuperAdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage product categories and their organization</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="productCount">Sort by Product Count</option>
                <option value="createdAt">Sort by Created Date</option>
                <option value="updatedAt">Sort by Updated Date</option>
                <option value="status">Sort by Status</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* View Toggle and Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {selectedCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCategories.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedCategories.length)} of {sortedCategories.length} categories
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCategories.map((category) => (
              <div
                key={category.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${
                  selectedCategories.includes(category.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleSelectCategory(category.id)}
                      className="ml-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Products:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{category.productCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                        {category.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Featured:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.isFeatured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {category.isFeatured ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                      <span>Order: {category.sortOrder}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleViewCategory(category)}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCategories.length === currentCategories.length && currentCategories.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sort Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleSelectCategory(category.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {category.slug}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {category.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {category.productCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                          {getStatusIcon(category.status)}
                          <span className="ml-1">{category.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.isFeatured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {category.isFeatured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {category.sortOrder}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewCategory(category)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCategory(category)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Edit Category"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedCategories.length)} of {sortedCategories.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Category Detail Modal */}
        {showCategoryDetailModal && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Category Details</h2>
                <button
                  onClick={() => setShowCategoryDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Category Image */}
                  <div>
                    <div className="w-full h-64 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center mb-4">
                      <Grid className="w-16 h-16 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCategory.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selectedCategory.description}</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">Slug: {selectedCategory.slug}</p>
                    </div>
                  </div>

                  {/* Category Information */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCategory.status)}`}>
                          {getStatusIcon(selectedCategory.status)}
                          <span className="ml-1">{selectedCategory.status}</span>
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Featured</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedCategory.isFeatured ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {selectedCategory.isFeatured ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Count</label>
                        <p className="text-gray-900 dark:text-white">{selectedCategory.productCount}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Sort Order</label>
                        <p className="text-gray-900 dark:text-white">{selectedCategory.sortOrder}</p>
                      </div>
                    </div>

                    {/* Parent Category */}
                    {selectedCategory.parentCategory && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Parent Category</label>
                        <p className="text-gray-900 dark:text-white">{selectedCategory.parentCategory}</p>
                      </div>
                    )}

                    {/* SEO Information */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">SEO Information</label>
                      <div className="space-y-2 mt-1">
                        {selectedCategory.seoTitle && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">SEO Title</p>
                            <p className="text-gray-900 dark:text-white">{selectedCategory.seoTitle}</p>
                          </div>
                        )}
                        {selectedCategory.seoDescription && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">SEO Description</p>
                            <p className="text-gray-900 dark:text-white">{selectedCategory.seoDescription}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline Information */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeline</label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                          <p className="text-gray-900 dark:text-white">{new Date(selectedCategory.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Updated</p>
                          <p className="text-gray-900 dark:text-white">{new Date(selectedCategory.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Created By</p>
                          <p className="text-gray-900 dark:text-white">{selectedCategory.createdBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditCategoryModal && editingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Category</h2>
                <button
                  onClick={() => setShowEditCategoryModal(false)}
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
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                  <input
                    type="text"
                    value={editingCategory.slug}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, slug: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editingCategory.status}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Featured</label>
                  <select
                    value={editingCategory.isFeatured ? 'true' : 'false'}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, isFeatured: e.target.value === 'true' } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCategory.sortOrder}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, sortOrder: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={editingCategory.seoTitle || ''}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, seoTitle: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Description</label>
                  <textarea
                    value={editingCategory.seoDescription || ''}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, seoDescription: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveCategoryEdit}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditCategoryModal(false)}
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
};

export default CategoriesPage; 