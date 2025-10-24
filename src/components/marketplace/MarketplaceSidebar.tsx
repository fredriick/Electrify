'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Star, DollarSign, Truck, Shield } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';

const categories = [
  {
    id: 'solar-panels',
    name: 'Solar Panels',
    count: 2500,
    subcategories: ['Monocrystalline', 'Polycrystalline', 'Thin Film', 'Bifacial']
  },
  {
    id: 'inverters',
    name: 'Inverters',
    count: 800,
    subcategories: ['String Inverters', 'Microinverters', 'Hybrid Inverters', 'Grid-Tie']
  },
  {
    id: 'batteries',
    name: 'Batteries',
    count: 600,
    subcategories: ['Lithium-Ion', 'Lead-Acid', 'Flow Batteries', 'Home Storage']
  },
  {
    id: 'mounting-systems',
    name: 'Mounting Systems',
    count: 400,
    subcategories: ['Roof Mounts', 'Ground Mounts', 'Pole Mounts', 'Tracking Systems']
  },
  {
    id: 'residential',
    name: 'Residential',
    count: 1200,
    subcategories: ['Home Systems', 'DIY Kits', 'Complete Packages']
  },
  {
    id: 'commercial',
    name: 'Commercial',
    count: 900,
    subcategories: ['Large Scale', 'Industrial', 'Agricultural']
  }
];

const brands = [
  { id: 'sunpower', name: 'SunPower', count: 450 },
  { id: 'lg', name: 'LG Solar', count: 380 },
  { id: 'panasonic', name: 'Panasonic', count: 320 },
  { id: 'tesla', name: 'Tesla', count: 280 },
  { id: 'enphase', name: 'Enphase', count: 220 },
  { id: 'solaredge', name: 'SolarEdge', count: 190 },
  { id: 'canadian-solar', name: 'Canadian Solar', count: 180 },
  { id: 'jinko', name: 'Jinko Solar', count: 160 }
];

export function MarketplaceSidebar() {
  const { formatCurrency } = useCurrency();
  
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    rating: true,
    shipping: true
  });

  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRange: '',
    rating: '',
    shipping: [] as string[]
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => {
      if (type === 'categories' || type === 'brands' || type === 'shipping') {
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
    { id: '3', name: '3+ Stars', value: 3, count: 400 }
  ];

  const shippingOptions = [
    { id: 'free', name: 'Free Shipping', count: 1800 },
    { id: 'fast', name: 'Fast Delivery', count: 1200 },
    { id: 'local', name: 'Local Pickup', count: 300 }
  ];

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 dark:text-white mb-3"
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
              <div key={category.id} className="space-y-1">
                <Link
                  href={`/category/${category.id}`}
                  className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({category.count})
                  </span>
                </Link>
                <div className="ml-4 space-y-1">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      href={`/category/${category.id}/${sub.toLowerCase().replace(' ', '-')}`}
                      className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => toggleSection('brands')}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 dark:text-white mb-3"
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 dark:text-white mb-3"
        >
          <DollarSign className="w-4 h-4 mr-2" />
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 dark:text-white mb-3"
        >
          <Star className="w-4 h-4 mr-2" />
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

      {/* Shipping Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => toggleSection('shipping')}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 dark:text-white mb-3"
        >
          <Truck className="w-4 h-4 mr-2" />
          Shipping
          {expandedSections.shipping ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.shipping && (
          <div className="space-y-2">
            {shippingOptions.map((option) => (
              <label key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.shipping.includes(option.id)}
                  onChange={() => toggleFilter('shipping', option.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {option.name}
                </span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  ({option.count})
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
          shipping: []
        })}
        className="w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
      >
        Clear All Filters
      </button>
    </div>
  );
} 
 
 
 
 
 