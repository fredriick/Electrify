"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PieChart, Users, DollarSign, TrendingUp } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { segmentsService, CustomerSegment, SegmentStats } from '@/lib/segmentsService';

export default function SegmentsPage() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [stats, setStats] = useState<SegmentStats>({
    totalCustomers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    segments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const { currentCurrency, formatCurrency, getCurrencySymbol } = useCurrency();

  useEffect(() => {
    const fetchSegmentsData = async () => {
      if (authLoading) {
        return;
      }

      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching customer segments for supplier:', user.id);
        const segmentsData = await segmentsService.getCustomerSegments(user.id);
        
        console.log('Segments data received:', segmentsData);
        
        setSegments(segmentsData.segments);
        setStats(segmentsData);
      } catch (err) {
        console.error('Error fetching segments data:', err);
        setError('Failed to fetch segments data');
      } finally {
        setLoading(false);
      }
    };

    fetchSegmentsData();
  }, [user?.id, authLoading]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 text-center text-red-500 break-words">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
              <PieChart className="w-5 h-5 sm:w-7 sm:h-7 text-primary-600 flex-shrink-0" /> 
              <span className="break-words">Customer Segments</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 break-words">
              Analyze your customer base by segment
            </p>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">{segmentsService.formatCurrency(stats.totalRevenue, currentCurrency)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Avg Order Value</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">{segmentsService.formatCurrency(stats.averageOrderValue, currentCurrency)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Segment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {segments.map((seg) => (
            <div key={seg.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0 ${seg.color}`}>
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center break-words">{seg.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-2 text-center break-words px-2">{seg.description}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{seg.customers}</span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">customers</span>
              </div>
              <div className="mt-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{seg.percentage}% of total</div>
              <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center break-words">
                Total spent: {segmentsService.formatCurrency(seg.totalSpent, currentCurrency)}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center break-words">
                Avg: {segmentsService.formatCurrency(seg.averageOrderValue, currentCurrency)}
              </div>
            </div>
          ))}
        </div>

        {/* Simple Pie Chart Representation */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 relative overflow-hidden mb-4 flex-shrink-0">
            {/* Pie chart segments can be improved with a real chart lib */}
            <div className="absolute inset-0 bg-blue-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 60%, 50% 60%)' }} />
            <div className="absolute inset-0 bg-green-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 80%, 50% 80%)' }} />
            <div className="absolute inset-0 bg-purple-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)' }} />
          </div>
          <div className="flex gap-3 sm:gap-6 flex-wrap justify-center px-4">
            {segments.map((seg) => (
              <div key={seg.name} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${seg.color}`} />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">{seg.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 