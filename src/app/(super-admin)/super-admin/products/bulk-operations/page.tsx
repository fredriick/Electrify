'use client';

import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,

  RefreshCw,
  FileText,
  Settings,
  Users,
  Package,
  Tag,
  DollarSign,
  Calendar,
  BarChart3,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';

interface BulkOperation {
  id: string;
  name: string;
  type: 'update' | 'delete' | 'status_change' | 'category_change' | 'price_update' | 'bulk_import' | 'bulk_export';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  createdBy: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  description: string;
  filters: Record<string, any>;
  actions: string[];
  errorMessage?: string;
}

const BulkOperationsPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'createdAt' | 'startedAt' | 'completedAt' | 'type'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewOperation, setShowNewOperation] = useState(false);

  // Mock data for bulk operations
  const [bulkOperations] = useState<BulkOperation[]>([
    {
      id: '1',
      name: 'Update Product Prices - Q1 2024',
      type: 'price_update',
      status: 'completed',
      progress: 100,
      totalItems: 1250,
      processedItems: 1250,
      failedItems: 0,
      createdBy: 'admin@electrify.com',
      createdAt: '2024-01-15T10:30:00Z',
      startedAt: '2024-01-15T10:32:00Z',
      completedAt: '2024-01-15T10:45:00Z',
      description: 'Bulk price update for all solar panels with 5% increase',
      filters: { category: 'solar-panels', priceRange: '1000-5000' },
      actions: ['price_update']
    },
    {
      id: '2',
      name: 'Activate Pending Products',
      type: 'status_change',
      status: 'running',
      progress: 65,
      totalItems: 450,
      processedItems: 292,
      failedItems: 3,
      createdBy: 'admin@electrify.com',
      createdAt: '2024-01-20T14:15:00Z',
      startedAt: '2024-01-20T14:20:00Z',
      description: 'Activate all products with pending status',
      filters: { status: 'pending' },
      actions: ['status_change']
    },
    {
      id: '3',
      name: 'Bulk Category Reorganization',
      type: 'category_change',
      status: 'pending',
      progress: 0,
      totalItems: 800,
      processedItems: 0,
      failedItems: 0,
      createdBy: 'admin@electrify.com',
      createdAt: '2024-01-22T09:45:00Z',
      description: 'Move products from old categories to new structure',
      filters: { oldCategories: ['accessories', 'components'] },
      actions: ['category_change']
    },
    {
      id: '4',
      name: 'Delete Discontinued Products',
      type: 'delete',
      status: 'failed',
      progress: 0,
      totalItems: 150,
      processedItems: 0,
      failedItems: 150,
      createdBy: 'admin@electrify.com',
      createdAt: '2024-01-18T16:30:00Z',
      startedAt: '2024-01-18T16:35:00Z',
      completedAt: '2024-01-18T16:40:00Z',
      description: 'Remove all discontinued products from inventory',
      filters: { status: 'discontinued', lastUpdated: '2023-12-01' },
      actions: ['delete'],
      errorMessage: 'Permission denied for bulk delete operation'
    },
    {
      id: '5',
      name: 'Bulk Import - New Supplier Products',
      type: 'bulk_import',
      status: 'completed',
      progress: 100,
      totalItems: 300,
      processedItems: 300,
      failedItems: 0,
      createdBy: 'admin@electrify.com',
      createdAt: '2024-01-10T11:20:00Z',
      startedAt: '2024-01-10T11:25:00Z',
      completedAt: '2024-01-10T11:35:00Z',
      description: 'Import new product catalog from TechSolar supplier',
      filters: { supplier: 'techsolar', category: 'monitoring-systems' },
      actions: ['bulk_import']
    },
    {
      id: '6',
      name: 'Update Product Descriptions',
      type: 'update',
      status: 'cancelled',
      progress: 25,
      totalItems: 600,
      processedItems: 150,
      failedItems: 0,
      createdBy: 'admin@electrify.com',
      createdAt: '2024-01-12T13:10:00Z',
      startedAt: '2024-01-12T13:15:00Z',
      description: 'Update SEO descriptions for all products',
      filters: { hasSeoDescription: false },
      actions: ['update']
    },
    {
      id: '7',
      name: 'Export Product Data - Q4 Report',
      type: 'bulk_export',
      status: 'completed',
      progress: 100,
      totalItems: 2000,
      processedItems: 2000,
      failedItems: 0,
      createdBy: 'admin@electrify.com',
      createdAt: '2024-01-05T08:45:00Z',
      startedAt: '2024-01-05T08:50:00Z',
      completedAt: '2024-01-05T09:05:00Z',
      description: 'Export all product data for quarterly report',
      filters: { dateRange: '2024-01-01 to 2024-03-31' },
      actions: ['bulk_export']
    },
    {
      id: '8',
      name: 'Bulk Price Reduction - Clearance',
      type: 'price_update',
      status: 'running',
      progress: 40,
      totalItems: 350,
      processedItems: 140,
      failedItems: 2,
      createdBy: 'admin@electrify.com',
      createdAt: '2024-01-25T10:00:00Z',
      startedAt: '2024-01-25T10:05:00Z',
      description: 'Apply 15% discount to clearance products',
      filters: { category: 'clearance', priceRange: '500-2000' },
      actions: ['price_update']
    }
  ]);

  const filteredOperations = bulkOperations.filter(operation => {
    const matchesSearch = operation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || operation.status === statusFilter;
    const matchesType = typeFilter === 'all' || operation.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedOperations = [...filteredOperations].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'createdAt' || sortBy === 'startedAt' || sortBy === 'completedAt') {
      aValue = new Date(aValue as string).getTime() as any;
      bValue = new Date(bValue as string).getTime() as any;
    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return (aValue || 0) > (bValue || 0) ? 1 : -1;
    } else {
      return (aValue || 0) < (bValue || 0) ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedOperations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOperations = sortedOperations.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedOperations.length === currentOperations.length) {
      setSelectedOperations([]);
    } else {
      setSelectedOperations(currentOperations.map(operation => operation.id));
    }
  };

  const handleSelectOperation = (operationId: string) => {
    setSelectedOperations(prev => 
      prev.includes(operationId) 
        ? prev.filter(id => id !== operationId)
        : [...prev, operationId]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for operations:`, selectedOperations);
    setSelectedOperations([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price_update': return <DollarSign className="w-4 h-4" />;
      case 'status_change': return <Settings className="w-4 h-4" />;
      case 'category_change': return <Tag className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      case 'bulk_import': return <Upload className="w-4 h-4" />;
      case 'bulk_export': return <Download className="w-4 h-4" />;
      case 'update': return <Edit className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'price_update': return 'bg-green-100 text-green-800';
      case 'status_change': return 'bg-blue-100 text-blue-800';
      case 'category_change': return 'bg-purple-100 text-purple-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'bulk_import': return 'bg-orange-100 text-orange-800';
      case 'bulk_export': return 'bg-indigo-100 text-indigo-800';
      case 'update': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SuperAdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Operations</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage bulk operations and job processing</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowNewOperation(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Operation
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Operations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{bulkOperations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bulkOperations.filter(op => op.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bulkOperations.filter(op => op.status === 'running').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bulkOperations.filter(op => op.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search operations..."
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
                <option value="createdAt">Sort by Created Date</option>
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="type">Sort by Type</option>
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
                  <option value="pending">Pending</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="price_update">Price Update</option>
                  <option value="status_change">Status Change</option>
                  <option value="category_change">Category Change</option>
                  <option value="delete">Delete</option>
                  <option value="bulk_import">Bulk Import</option>
                  <option value="bulk_export">Bulk Export</option>
                  <option value="update">Update</option>
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

          {selectedOperations.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedOperations.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('cancel')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction('retry')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedOperations.length)} of {sortedOperations.length} operations
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentOperations.map((operation) => (
              <div
                key={operation.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${
                  selectedOperations.includes(operation.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(operation.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(operation.type)}`}>
                          {operation.type.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {operation.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {operation.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedOperations.includes(operation.id)}
                      onChange={() => handleSelectOperation(operation.id)}
                      className="ml-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                        {getStatusIcon(operation.status)}
                        <span className="ml-1">{operation.status}</span>
                      </span>
                    </div>
                    
                    {operation.status === 'running' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${operation.progress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {operation.processedItems}/{operation.totalItems}
                      </span>
                    </div>
                    
                    {operation.failedItems > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Failed:</span>
                        <span className="font-medium text-red-600">{operation.failedItems}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(operation.createdAt).toLocaleDateString()}</span>
                      <span>By: {operation.createdBy}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <Eye className="w-4 h-4" />
                      </button>
                      {operation.status === 'pending' && (
                        <button className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {operation.status === 'running' && (
                        <button className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400">
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
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
                        checked={selectedOperations.length === currentOperations.length && currentOperations.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Progress
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
                  {currentOperations.map((operation) => (
                    <tr key={operation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOperations.includes(operation.id)}
                          onChange={() => handleSelectOperation(operation.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {operation.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {operation.description}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            By: {operation.createdBy}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(operation.type)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(operation.type)}`}>
                            {operation.type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                          {getStatusIcon(operation.status)}
                          <span className="ml-1">{operation.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${operation.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {operation.processedItems}/{operation.totalItems}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(operation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            <Eye className="w-4 h-4" />
                          </button>
                          {operation.status === 'pending' && (
                            <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {operation.status === 'running' && (
                            <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300">
                              <Pause className="w-4 h-4" />
                            </button>
                          )}
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
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
              Showing {startIndex + 1} to {Math.min(endIndex, sortedOperations.length)} of {sortedOperations.length} results
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
      </div>
    </SuperAdminLayout>
  );
};

export default BulkOperationsPage; 