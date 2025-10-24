'use client';

import { motion } from 'framer-motion';
import { Sun, Zap, Battery, Settings, Home, Factory, Leaf, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    id: 1,
    name: 'Solar Panels',
    description: 'High-efficiency photovoltaic panels',
    icon: Sun,
    slug: 'solar-panels',
    color: 'from-yellow-400 to-orange-500',
    count: '2,500+'
  },
  {
    id: 2,
    name: 'Inverters',
    description: 'Convert DC to AC power',
    icon: Zap,
    slug: 'inverters',
    color: 'from-blue-400 to-purple-500',
    count: '800+'
  },
  {
    id: 3,
    name: 'Batteries',
    description: 'Energy storage solutions',
    icon: Battery,
    slug: 'batteries',
    color: 'from-green-400 to-teal-500',
    count: '600+'
  },
  {
    id: 4,
    name: 'Mounting Systems',
    description: 'Secure installation hardware',
    icon: Settings,
    slug: 'mounting-systems',
    color: 'from-gray-400 to-slate-500',
    count: '400+'
  },
  {
    id: 5,
    name: 'Residential',
    description: 'Home solar solutions',
    icon: Home,
    slug: 'residential',
    color: 'from-pink-400 to-rose-500',
    count: '1,200+'
  },
  {
    id: 6,
    name: 'Commercial',
    description: 'Business solar systems',
    icon: Factory,
    slug: 'commercial',
    color: 'from-indigo-400 to-blue-500',
    count: '900+'
  },
  {
    id: 7,
    name: 'Green Energy',
    description: 'Sustainable solutions',
    icon: Leaf,
    slug: 'green-energy',
    color: 'from-emerald-400 to-green-500',
    count: '300+'
  },
  {
    id: 8,
    name: 'Monitoring',
    description: 'Performance tracking',
    icon: TrendingUp,
    slug: 'monitoring',
    color: 'from-cyan-400 to-blue-500',
    count: '200+'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export function Categories() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-4">
            Browse by Category
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find exactly what you need with our comprehensive selection of solar energy products
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="block bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {category.count}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {category.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Categories CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
          >
            View All Categories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 
 
 
 
 
 