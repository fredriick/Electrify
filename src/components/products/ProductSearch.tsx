'use client';

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

export function ProductSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { formatCurrency } = useCurrency();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <form onSubmit={handleSearch} className="flex items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for solar panels, inverters, batteries..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Search
        </button>

        {/* Mobile Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-3 rounded-lg transition-colors"
        >
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </form>

      {/* Search Suggestions */}
      {searchQuery && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Popular searches for "{searchQuery}"
          </h4>
          <div className="flex flex-wrap gap-2">
            {['solar panels', 'inverters', 'batteries', 'mounting systems'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                className="text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 px-3 py-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Active filters:
        </span>
        {/* Example active filters - replace with actual state */}
        <span className="inline-flex items-center bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
          Solar Panels
          <button className="ml-1 hover:text-primary-600 dark:hover:text-primary-300">
            <X className="w-3 h-3" />
          </button>
        </span>
        <span className="inline-flex items-center bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
          Under {formatCurrency(500)}
          <button className="ml-1 hover:text-primary-600 dark:hover:text-primary-300">
            <X className="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>
  );
} 
 
 
 
 
 