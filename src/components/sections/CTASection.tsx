'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sun, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-solar-pattern opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-white rounded-full opacity-10"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full opacity-10"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-12 h-12 bg-white rounded-full opacity-10"
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-6 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Go Solar?
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands of customers who have already made the switch to clean, renewable energy. 
            Start saving money and the planet today.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              href="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/products"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Browse Products
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Sun className="w-8 h-8 text-primary-200" />
              </div>
              <div className="text-white font-semibold mb-1">Free Setup</div>
              <div className="text-primary-200 text-sm">No hidden fees</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Zap className="w-8 h-8 text-primary-200" />
              </div>
              <div className="text-white font-semibold mb-1">Instant Quotes</div>
              <div className="text-primary-200 text-sm">Get pricing in seconds</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Shield className="w-8 h-8 text-primary-200" />
              </div>
              <div className="text-white font-semibold mb-1">Secure Platform</div>
              <div className="text-primary-200 text-sm">Bank-level security</div>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-12 pt-8 border-t border-primary-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p className="text-primary-200 text-sm mb-4">
              Trusted by leading solar companies and thousands of customers nationwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-primary-200 text-sm font-medium">SunPower</div>
              <div className="text-primary-200 text-sm font-medium">Tesla</div>
              <div className="text-primary-200 text-sm font-medium">LG Solar</div>
              <div className="text-primary-200 text-sm font-medium">Enphase</div>
              <div className="text-primary-200 text-sm font-medium">SolarEdge</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 
 
 
 
 
 