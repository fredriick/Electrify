'use client';

import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  efficiency?: string;
  capacity?: string;
  warranty: string;
  inStock: boolean;
  isNew: boolean;
  isFeatured?: boolean;
  material?: string;
}

interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
}

export function ProductGrid({ 
  products, 
  viewMode
}: ProductGridProps) {
  return (
    <div>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              viewMode="list"
            />
          ))}
        </div>
      )}
      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
} 
 
 
 
 
 