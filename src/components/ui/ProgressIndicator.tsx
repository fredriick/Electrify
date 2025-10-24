import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  completed?: number;
  total?: number;
  percentage?: number;
  className?: string;
}

export function ProgressIndicator({ 
  completed, 
  total, 
  percentage: propPercentage, 
  className = '' 
}: ProgressIndicatorProps) {
  // Use provided percentage or calculate from completed/total
  const percentage = propPercentage !== undefined 
    ? propPercentage 
    : total && total > 0 
      ? Math.round((completed || 0) / total * 100) 
      : 0;
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Completion</h3>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {completed || 0} of {total || 0} sections complete
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-4">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400 min-w-[3rem] text-right">
            {percentage}%
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {percentage === 100 ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400" />
          )}
          <span className={`text-sm font-medium ${
            percentage === 100 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {percentage === 100 ? 'Profile Complete!' : 'Complete all sections to finish setup'}
          </span>
        </div>
      </div>
    </div>
  );
} 