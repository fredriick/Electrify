"use client";

import React from "react";
import {
  BarChart3,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart,
  LineChart,
} from "lucide-react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";

const stats = [
  {
    label: "Total Users",
    value: 12450,
    icon: <Users className="w-6 h-6 text-blue-600" />,
    change: "+3.2%",
    trend: "up",
  },
  {
    label: "Total Orders",
    value: 3890,
    icon: <Package className="w-6 h-6 text-green-600" />,
    change: "+1.8%",
    trend: "up",
  },
  {
    label: "Revenue",
    value: "$1,250,000",
    icon: <DollarSign className="w-6 h-6 text-yellow-600" />,
    change: "+5.1%",
    trend: "up",
  },
  {
    label: "Refunds",
    value: "$12,500",
    icon: <DollarSign className="w-6 h-6 text-red-600" />,
    change: "-0.7%",
    trend: "down",
  },
];

const AnalyticsPage = () => {
  return (
    <SuperAdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Marketplace analytics and performance overview</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {stat.icon}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mocked Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Orders Over Time</h2>
            </div>
            <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
              {/* Replace with real chart */}
              <LineChart className="w-32 h-32" />
              <span className="ml-4">[Chart Placeholder]</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <PieChart className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Distribution</h2>
            </div>
            <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
              {/* Replace with real chart */}
              <PieChart className="w-32 h-32" />
              <span className="ml-4">[Chart Placeholder]</span>
            </div>
          </div>
        </div>

        {/* Recent Orders Table (Mock) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Package className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">ORD-1008</td>
                  <td className="px-6 py-4 whitespace-nowrap">Jane Doe</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">delivered</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">$2,500</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2024-04-12</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">ORD-1007</td>
                  <td className="px-6 py-4 whitespace-nowrap">Grace Lee</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">pending</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">$1,200</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2024-04-11</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">ORD-1006</td>
                  <td className="px-6 py-4 whitespace-nowrap">Frank Zhang</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">refunded</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">$1,500</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2024-04-10</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default AnalyticsPage; 