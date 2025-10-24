"use client";

import React, { useState } from "react";
import {
  Grid,
  List,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Plus,
  Package,
  User,
  Calendar,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Modal } from '@/components/ui/Modal';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  supplier: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  total: number;
  createdAt: string;
  updatedAt: string;
  items: number;
  paymentMethod: string;
  shippingAddress: string;
  deliveryDate?: string;
  trackingNumber?: string;
  isPriority: boolean;
  isDisputed: boolean;
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-1001",
    customer: "Alice Johnson",
    supplier: "SolarTech Inc.",
    status: "pending",
    total: 1200,
    createdAt: "2024-04-01T10:00:00Z",
    updatedAt: "2024-04-01T10:00:00Z",
    items: 3,
    paymentMethod: "Credit Card",
    shippingAddress: "123 Main St, Springfield",
    isPriority: false,
    isDisputed: false,
  },
  {
    id: "2",
    orderNumber: "ORD-1002",
    customer: "Bob Smith",
    supplier: "GreenEnergy Ltd.",
    status: "processing",
    total: 2500,
    createdAt: "2024-04-02T12:30:00Z",
    updatedAt: "2024-04-03T09:00:00Z",
    items: 5,
    paymentMethod: "PayPal",
    shippingAddress: "456 Oak Ave, Metropolis",
    isPriority: true,
    isDisputed: false,
  },
  {
    id: "3",
    orderNumber: "ORD-1003",
    customer: "Carol Lee",
    supplier: "SunPower Solutions",
    status: "shipped",
    total: 1800,
    createdAt: "2024-04-03T15:45:00Z",
    updatedAt: "2024-04-04T08:00:00Z",
    items: 2,
    paymentMethod: "Bank Transfer",
    shippingAddress: "789 Pine Rd, Gotham",
    deliveryDate: "2024-04-10T00:00:00Z",
    trackingNumber: "TRK-12345",
    isPriority: false,
    isDisputed: false,
  },
  {
    id: "4",
    orderNumber: "ORD-1004",
    customer: "David Kim",
    supplier: "SolarTech Inc.",
    status: "delivered",
    total: 3200,
    createdAt: "2024-04-04T11:20:00Z",
    updatedAt: "2024-04-11T14:00:00Z",
    items: 6,
    paymentMethod: "Credit Card",
    shippingAddress: "321 Elm St, Star City",
    deliveryDate: "2024-04-11T00:00:00Z",
    trackingNumber: "TRK-67890",
    isPriority: true,
    isDisputed: false,
  },
  {
    id: "5",
    orderNumber: "ORD-1005",
    customer: "Eve Martinez",
    supplier: "GreenEnergy Ltd.",
    status: "cancelled",
    total: 900,
    createdAt: "2024-04-05T09:10:00Z",
    updatedAt: "2024-04-05T10:00:00Z",
    items: 1,
    paymentMethod: "Credit Card",
    shippingAddress: "654 Maple Dr, Central City",
    isPriority: false,
    isDisputed: true,
  },
  {
    id: "6",
    orderNumber: "ORD-1006",
    customer: "Frank Zhang",
    supplier: "SunPower Solutions",
    status: "refunded",
    total: 1500,
    createdAt: "2024-04-06T13:00:00Z",
    updatedAt: "2024-04-07T10:00:00Z",
    items: 2,
    paymentMethod: "PayPal",
    shippingAddress: "987 Cedar Ln, Coast City",
    isPriority: false,
    isDisputed: true,
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-red-100 text-red-800",
};

const OrdersPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkAction = (action: string) => {
    // Implement bulk action logic here
    setSelectedOrders([]);
  };

  const handleViewOrder = (order: Order) => {
    setViewOrder(order);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  return (
    <SuperAdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Orders</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all orders in the marketplace</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockOrders.filter(o => o.status === "delivered").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockOrders.filter(o => o.status === "pending").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disputed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockOrders.filter(o => o.isDisputed).length}</p>
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
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  onClick={() => setStatusDropdownOpen((open) => !open)}
                >
                  <span>{statusFilter === "all" ? "All Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {statusDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                    <div className="py-1">
                      {[
                        { value: "all", label: "All Status" },
                        { value: "pending", label: "Pending" },
                        { value: "processing", label: "Processing" },
                        { value: "shipped", label: "Shipped" },
                        { value: "delivered", label: "Delivered" },
                        { value: "cancelled", label: "Cancelled" },
                        { value: "refunded", label: "Refunded" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
                            statusFilter === option.value ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                          }`}
                          onClick={() => {
                            setStatusFilter(option.value);
                            setStatusDropdownOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle and Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedOrders.length} selected
              </span>
              <button
                onClick={() => handleBulkAction("cancel")}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction("refund")}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Refund
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Showing {filteredOrders.length} of {mockOrders.length} orders
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${
                  selectedOrders.includes(order.id) ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {order.customer} &bull; {order.supplier}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="ml-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total:</span>
                      <span className="font-medium text-gray-900 dark:text-white">${order.total.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Items:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{order.items}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Payment: {order.paymentMethod}</span>
                      <span>Priority: {order.isPriority ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => handleViewOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400" onClick={() => handleDeleteOrder(order.id)}>
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
        {viewMode === "list" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Items
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
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.supplier}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">${order.total.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.items}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" onClick={() => handleViewOrder(order)}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" onClick={() => handleDeleteOrder(order.id)}>
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
      </div>

      {/* Modal for viewing order details */}
      {viewOrder && (
        <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order #${viewOrder.orderNumber}`}>
          <div className="p-4 space-y-2">
            <div><b>Customer:</b> {viewOrder.customer}</div>
            <div><b>Supplier:</b> {viewOrder.supplier}</div>
            <div><b>Status:</b> {viewOrder.status}</div>
            <div><b>Total:</b> ${viewOrder.total.toLocaleString()}</div>
            <div><b>Items:</b> {viewOrder.items}</div>
            <div><b>Payment Method:</b> {viewOrder.paymentMethod}</div>
            <div><b>Shipping Address:</b> {viewOrder.shippingAddress}</div>
            <div><b>Created At:</b> {new Date(viewOrder.createdAt).toLocaleString()}</div>
            {viewOrder.deliveryDate && <div><b>Delivery Date:</b> {new Date(viewOrder.deliveryDate).toLocaleString()}</div>}
            {viewOrder.trackingNumber && <div><b>Tracking Number:</b> {viewOrder.trackingNumber}</div>}
            <div><b>Priority:</b> {viewOrder.isPriority ? 'Yes' : 'No'}</div>
            <div><b>Disputed:</b> {viewOrder.isDisputed ? 'Yes' : 'No'}</div>
          </div>
        </Modal>
      )}
    </SuperAdminLayout>
  );
};

export default OrdersPage; 