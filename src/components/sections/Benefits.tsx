'use client';

import { motion } from 'framer-motion';
import { Shield, Truck, DollarSign, Users, Clock, Award } from 'lucide-react';

const benefits = [
  {
    id: 1,
    title: 'Trusted Suppliers',
    description: 'All suppliers are verified and rated by our community',
    icon: Shield,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    title: 'Fast Delivery',
    description: 'Quick shipping and installation support nationwide',
    icon: Truck,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    title: 'Best Prices',
    description: 'Competitive pricing with price match guarantee',
    icon: DollarSign,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 4,
    title: 'Expert Support',
    description: '24/7 customer support and technical assistance',
    icon: Users,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 5,
    title: 'Quick Setup',
    description: 'Streamlined ordering process and fast approval',
    icon: Clock,
    color: 'from-red-500 to-red-600'
  },
  {
    id: 6,
    title: 'Quality Guarantee',
    description: 'All products come with manufacturer warranties',
    icon: Award,
    color: 'from-indigo-500 to-indigo-600'
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

export function Benefits() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
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
            Why Choose Our Marketplace?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We make solar energy accessible, affordable, and hassle-free for everyone
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              10,000+
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Products Available
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              500+
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Trusted Suppliers
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              50,000+
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Happy Customers
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              99.9%
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Uptime Guarantee
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 
 
 
 
 
 