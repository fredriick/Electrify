'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Homeowner',
    location: 'California',
    rating: 5,
    comment: 'The solar panels I purchased through this marketplace have exceeded my expectations. The installation was smooth and my energy bills have dropped by 80%. Highly recommended!',
    avatar: '/images/testimonials/sarah.jpg'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Business Owner',
    location: 'Texas',
    rating: 5,
    comment: 'As a business owner, I was looking for reliable solar solutions. This marketplace connected me with excellent suppliers and the quality of products is outstanding.',
    avatar: '/images/testimonials/michael.jpg'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Property Manager',
    location: 'Florida',
    rating: 5,
    comment: 'Managing multiple properties, I needed a trusted source for solar equipment. The marketplace offers competitive prices and excellent customer support.',
    avatar: '/images/testimonials/emily.jpg'
  },
  {
    id: 4,
    name: 'David Thompson',
    role: 'Solar Installer',
    location: 'Arizona',
    rating: 5,
    comment: 'I source all my materials from this marketplace. The quality is consistent, prices are competitive, and delivery is always on time.',
    avatar: '/images/testimonials/david.jpg'
  },
  {
    id: 5,
    name: 'Lisa Wang',
    role: 'Environmental Consultant',
    location: 'Oregon',
    rating: 5,
    comment: 'The marketplace makes it easy to find sustainable energy solutions. The product selection is comprehensive and the suppliers are knowledgeable.',
    avatar: '/images/testimonials/lisa.jpg'
  },
  {
    id: 6,
    name: 'Robert Martinez',
    role: 'Renewable Energy Specialist',
    location: 'Colorado',
    rating: 5,
    comment: 'I\'ve been in the solar industry for 10 years and this is by far the best marketplace I\'ve used. The platform is intuitive and the support team is excellent.',
    avatar: '/images/testimonials/robert.jpg'
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

export function Testimonials() {
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
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have transformed their energy consumption
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 relative">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 text-primary-200 dark:text-primary-800">
                  <Quote className="w-8 h-8" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.comment}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role} • {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Overall Rating */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 text-yellow-400 fill-current"
                />
              ))}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              4.9 out of 5
            </div>
            <div className="text-gray-600 dark:text-gray-300 mb-4">
              Based on 2,847 customer reviews
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              98% of customers recommend our marketplace
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 
 
 
 
 
 