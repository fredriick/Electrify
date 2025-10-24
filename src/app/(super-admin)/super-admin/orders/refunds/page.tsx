"use client";

import React, { useState } from "react";
import {
  Grid,
  List,
  Search,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  DollarSign,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Modal } from '@/components/ui/Modal';

const mockRefunds = [
  {
    id: "1",
    refundNumber: "RF-1001",
    orderNumber: "ORD-1006",
    customer: "Frank Zhang",
    amount: 1500,
    status: "completed",
    requestedAt: "2024-04-07T10:00:00Z",
    processedAt: "2024-04-08T12:00:00Z",
    reason: "Product not as described",
    method: "Original Payment Method",
  },
  {
    id: "2",
    refundNumber: "RF-1002",
    orderNumber: "ORD-1005",
    customer: "Eve Martinez",
    amount: 900,
    status: "pending",
    requestedAt: "2024-04-06T09:00:00Z",
    processedAt: null,
    reason: "Order cancelled by customer",
    method: "Original Payment Method",
  },
  {
    id: "3",
    refundNumber: "RF-1003",
    orderNumber: "ORD-1002",
    customer: "Bob Smith",
    amount: 2500,
    status: "failed",
    requestedAt: "2024-04-05T14:00:00Z",
    processedAt: null,
    reason: "Payment gateway error",
    method: "Original Payment Method",
  },
];

const statusColors: { [key: string]: string } = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

const RefundsPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRefunds, setSelectedRefunds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [refunds, setRefunds] = useState(mockRefunds);
  const [viewRefund, setViewRefund] = useState<any>(null);

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.refundNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedRefunds.length === filteredRefunds.length) {
      setSelectedRefunds([]);
    } else {
      setSelectedRefunds(filteredRefunds.map((refund) => refund.id));
    }
  };

  const handleSelectRefund = (refundId: string) => {
    setSelectedRefunds((prev) =>
      prev.includes(refundId)
        ? prev.filter((id) => id !== refundId)
        : [...prev, refundId]
    );
  };

  const handleBulkAction = (action: string) => {
    setSelectedRefunds([]);
  };

  const handleViewRefund = (refund: any) => {
    setViewRefund(refund);
  };

  const handleDeleteRefund = (refundId: string) => {
    setRefunds((prev) => prev.filter((refund) => refund.id !== refundId));
  };

  return (
    <SuperAdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Refunds</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all refunds in the marketplace</p>
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
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockRefunds.filter(r => r.status === "completed").length}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockRefunds.filter(r => r.status === "pending").length}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockRefunds.filter(r => r.status === "failed").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Refunds</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockRefunds.length}</p>
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
                  placeholder="Search refunds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                onClick={() => setStatusDropdownOpen((open) => !open)}
              >
                <span>{statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {statusDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  <div className="py-1">
                    {[
                      { value: 'all', label: 'All Status' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'processing', label: 'Processing' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'failed', label: 'Failed' },
                      { value: 'cancelled', label: 'Cancelled' },
                      { value: 'refunded', label: 'Refunded' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
                          statusFilter === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
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
          {selectedRefunds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRefunds.length} selected
              </span>
              <button
                onClick={() => handleBulkAction("approve")}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction("reject")}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Reject
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
          Showing {filteredRefunds.length} of {mockRefunds.length} refunds
        </div>
        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRefunds.map((refund) => (
              <div
                key={refund.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${
                  selectedRefunds.includes(refund.id) ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[refund.status]}`}>
                          {refund.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {refund.refundNumber}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {refund.customer} &bull; {refund.orderNumber}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedRefunds.includes(refund.id)}
                      onChange={() => handleSelectRefund(refund.id)}
                      className="ml-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">${refund.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Requested:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{new Date(refund.requestedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Method:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{refund.method}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Reason: {refund.reason}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => handleViewRefund(refund)}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400" onClick={() => handleDeleteRefund(refund.id)}>
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
                        checked={selectedRefunds.length === filteredRefunds.length && filteredRefunds.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Refund #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRefunds.map((refund) => (
                    <tr key={refund.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRefunds.includes(refund.id)}
                          onChange={() => handleSelectRefund(refund.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                        {refund.refundNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{refund.orderNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{refund.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[refund.status]}`}>
                          {refund.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">${refund.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(refund.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" onClick={() => handleViewRefund(refund)}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" onClick={() => handleDeleteRefund(refund.id)}>
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
      {/* Modal for viewing refund details */}
      {viewRefund && (
        <Modal isOpen={!!viewRefund} onClose={() => setViewRefund(null)} title={`Refund #${viewRefund.refundNumber || viewRefund.id}`}>
          <div className="p-4 space-y-2">
            <div><b>Order Number:</b> {viewRefund.orderNumber}</div>
            <div><b>Customer:</b> {viewRefund.customer}</div>
            <div><b>Status:</b> {viewRefund.status}</div>
            <div><b>Amount:</b> ${viewRefund.amount?.toLocaleString?.() ?? ''}</div>
            <div><b>Reason:</b> {viewRefund.reason}</div>
            <div><b>Requested At:</b> {viewRefund.requestedAt ? new Date(viewRefund.requestedAt).toLocaleString() : ''}</div>
            <div><b>Processed At:</b> {viewRefund.processedAt ? new Date(viewRefund.processedAt).toLocaleString() : ''}</div>
          </div>
        </Modal>
      )}
    </SuperAdminLayout>
  );
};

export default RefundsPage; 