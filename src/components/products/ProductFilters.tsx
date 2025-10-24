'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

const categories = [
  { id: 'solar-panels', name: 'Solar Panels', count: 2500 },
  { id: 'inverters', name: 'Inverters', count: 800 },
  { id: 'batteries', name: 'Batteries', count: 600 },
  { id: 'mounting-systems', name: 'Mounting Systems', count: 400 },
  { id: 'residential', name: 'Residential', count: 1200 },
  { id: 'commercial', name: 'Commercial', count: 900 },
];

const brands = [
  { id: 'sunpower', name: 'SunPower', count: 450 },
  { id: 'lg', name: 'LG Solar', count: 380 },
  { id: 'panasonic', name: 'Panasonic', count: 320 },
  { id: 'tesla', name: 'Tesla', count: 280 },
  { id: 'enphase', name: 'Enphase', count: 220 },
  { id: 'solaredge', name: 'SolarEdge', count: 190 },
];

export function ProductFilters() {
  const { formatCurrency } = useCurrency();
  
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    rating: true,
  });

  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRange: '',
    rating: '',
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => {
      if (type === 'categories' || type === 'brands') {
        const current = prev[type] as string[];
        const newValue = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        return { ...prev, [type]: newValue };
      } else {
        return { ...prev, [type]: prev[type] === value ? '' : value };
      }
    });
  };

  // Dynamic price ranges with currency formatting
  const priceRanges = [
    { id: '0-100', name: `Under ${formatCurrency(100)}`, min: 0, max: 100 },
    { id: '100-500', name: `${formatCurrency(100)} - ${formatCurrency(500)}`, min: 100, max: 500 },
    { id: '500-1000', name: `${formatCurrency(500)} - ${formatCurrency(1000)}`, min: 500, max: 1000 },
    { id: '1000-5000', name: `${formatCurrency(1000)} - ${formatCurrency(5000)}`, min: 1000, max: 5000 },
    { id: '5000+', name: `Over ${formatCurrency(5000)}`, min: 5000, max: null },
  ];

  const ratings = [
    { id: '5', name: '5 Stars', value: 5, count: 1200 },
    { id: '4', name: '4+ Stars', value: 4, count: 800 },
    { id: '3', name: '3+ Stars', value: 3, count: 400 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Filters
      </h3>

      {/* Categories */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white mb-3"
        >
          Categories
          {expandedSections.categories ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.categories && (
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.categories.includes(category.id)}
                  onChange={() => toggleFilter('categories', category.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {category.name}
                </span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  ({category.count})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('brands')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white mb-3"
        >
          Brands
          {expandedSections.brands ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.brands && (
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.brands.includes(brand.id)}
                  onChange={() => toggleFilter('brands', brand.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {brand.name}
                </span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  ({brand.count})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white mb-3"
        >
          Price Range
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.price && (
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <label key={range.id} className="flex items-center">
                <input
                  type="radio"
                  name="priceRange"
                  checked={selectedFilters.priceRange === range.id}
                  onChange={() => toggleFilter('priceRange', range.id)}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {range.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white mb-3"
        >
          Rating
          {expandedSections.rating ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.rating && (
          <div className="space-y-2">
            {ratings.map((rating) => (
              <label key={rating.id} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedFilters.rating === rating.id}
                  onChange={() => toggleFilter('rating', rating.id)}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {rating.name}
                </span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  ({rating.count})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => setSelectedFilters({
          categories: [],
          brands: [],
          priceRange: '',
          rating: '',
        })}
        className="w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
      >
        Clear All Filters
      </button>
    </div>
  );
} 
 
 
 
 
 