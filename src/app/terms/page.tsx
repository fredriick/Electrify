'use client';

import { motion } from 'framer-motion';
import { FileText, Scale, Shield, AlertTriangle, Mail, Phone, MapPin, Users, ShoppingCart, CreditCard } from 'lucide-react';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UnifiedHeader products={[]} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-4">
              <FileText className="w-12 h-12 text-blue-500 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Terms of Service
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Please read these terms carefully before using our service
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: January 15, 2025
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-8"
        >
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Scale className="w-6 h-6 text-blue-500 mr-2" />
              Agreement to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              These Terms of Service ("Terms") govern your use of the Electrify marketplace platform ("Service") operated by Electrify ("us," "we," or "our"). By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ShoppingCart className="w-6 h-6 text-green-500 mr-2" />
              Service Description
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Electrify is a solar energy marketplace that connects customers with suppliers to facilitate the purchase and sale of solar products and services. Our platform provides:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
              <li>Product listings and search functionality</li>
              <li>Order processing and payment handling</li>
              <li>Customer and seller account management</li>
              <li>Communication tools between buyers and sellers</li>
              <li>Customer support and dispute resolution</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-6 h-6 text-purple-500 mr-2" />
              User Accounts
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Account Registration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  To use our Service, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Account Types
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We offer different account types including customer accounts for purchasing products and seller accounts for listing and selling products. Each account type has specific requirements and responsibilities.
                </p>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Shield className="w-6 h-6 text-red-500 mr-2" />
              User Responsibilities
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Prohibited Activities
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the Service</li>
                  <li>Engage in fraudulent or deceptive practices</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Post false, misleading, or inappropriate content</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Content Standards
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All content posted on our platform must be accurate, lawful, and appropriate. Users are responsible for ensuring their content complies with our standards and applicable laws.
                </p>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCard className="w-6 h-6 text-indigo-500 mr-2" />
              Payment Terms
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Payment Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  All payments are processed securely through our payment partners. By making a purchase, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                  <li>Pay all applicable fees and taxes</li>
                  <li>Provide accurate payment information</li>
                  <li>Authorize charges to your payment method</li>
                  <li>Comply with our refund and return policies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Pricing and Fees
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All prices are displayed in Nigerian Naira (NGN) unless otherwise specified. We reserve the right to change prices and fees at any time. Additional fees may apply for certain services or features.
                </p>
              </div>
            </div>
          </section>

          {/* Seller Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Seller Terms and Conditions
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Seller Responsibilities
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Sellers agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                  <li>Provide accurate product descriptions and images</li>
                  <li>Maintain adequate inventory levels</li>
                  <li>Process orders promptly and professionally</li>
                  <li>Provide customer support for their products</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Pay applicable fees and commissions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Product Listings
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All product listings must be accurate, complete, and comply with our listing policies. We reserve the right to remove listings that violate our terms or applicable laws.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Intellectual Property Rights
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Our Content
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  The Service and its original content, features, and functionality are owned by Electrify and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  User Content
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You retain ownership of content you post on our platform, but grant us a license to use, display, and distribute such content in connection with our Service.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
              Disclaimers and Limitations
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Service Availability
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We strive to provide continuous service availability, but we do not guarantee uninterrupted access. The Service is provided "as is" without warranties of any kind.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Limitation of Liability
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  To the maximum extent permitted by law, Electrify shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Third-Party Content
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We are not responsible for the content, products, or services provided by third-party sellers or external websites linked from our platform.
                </p>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Termination
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Upon termination, your right to use the Service will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive termination.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Dispute Resolution
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Customer Disputes
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We provide dispute resolution services to help resolve issues between buyers and sellers. Users are encouraged to attempt resolution through our platform before pursuing external remedies.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Governing Law
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  These Terms shall be interpreted and governed by the laws of Nigeria. Any disputes arising from these Terms or your use of the Service shall be subject to the jurisdiction of Nigerian courts.
                </p>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Mail className="w-6 h-6 text-blue-500 mr-2" />
              Contact Information
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-500 mr-3" />
                <a 
                  href="mailto:support@theelectrifystore.com" 
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  support@theelectrifystore.com
                </a>
              </div>
              
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-500 mr-3" />
                <a 
                  href="tel:+2348167956792" 
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  +234 816 795 6792
                </a>
              </div>
              
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  Spring Dr road Oniru, Lagos, Nigeria
                </span>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

