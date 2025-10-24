'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Phone, 
  Mail, 
  BookOpen,
  HelpCircle,
  Lightbulb,
  Shield,
  CreditCard,
  Truck,
  Package,
  User,
  Settings,
  ShoppingCart,
  Store
} from 'lucide-react';
import Link from 'next/link';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';

const helpCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    articles: [
      {
        id: 'how-to-sign-up',
        title: 'How to create an account',
        content: 'Learn how to create your Electrify account and get started with buying or selling solar products.'
      },
      {
        id: 'verification-process',
        title: 'Account verification process',
        content: 'Understand how to verify your account and what documents you need to provide.'
      },
      {
        id: 'first-purchase',
        title: 'Making your first purchase',
        content: 'Step-by-step guide to finding and purchasing solar products on our marketplace.'
      }
    ]
  },
  {
    id: 'account-management',
    title: 'Account Management',
    icon: User,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    articles: [
      {
        id: 'profile-settings',
        title: 'Managing your profile',
        content: 'Learn how to update your profile information, change passwords, and manage account settings.'
      },
      {
        id: 'notification-preferences',
        title: 'Notification preferences',
        content: 'Customize how and when you receive notifications from Electrify.'
      },
      {
        id: 'privacy-settings',
        title: 'Privacy and security',
        content: 'Understand your privacy options and how to keep your account secure.'
      }
    ]
  },
  {
    id: 'buying-guide',
    title: 'Buying Guide',
    icon: ShoppingCart,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    articles: [
      {
        id: 'product-search',
        title: 'Finding the right products',
        content: 'Tips for searching and filtering solar products to find exactly what you need.'
      },
      {
        id: 'comparing-products',
        title: 'Comparing products',
        content: 'Learn how to compare different solar products and make informed decisions.'
      },
      {
        id: 'wishlist-management',
        title: 'Managing your wishlist',
        content: 'How to save products for later and organize your wishlist.'
      }
    ]
  },
  {
    id: 'orders-shipping',
    title: 'Orders & Shipping',
    icon: Truck,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    articles: [
      {
        id: 'order-tracking',
        title: 'Tracking your orders',
        content: 'Learn how to track your orders and get updates on shipping status.'
      },
      {
        id: 'shipping-options',
        title: 'Shipping options and costs',
        content: 'Understand available shipping methods and associated costs.'
      },
      {
        id: 'delivery-issues',
        title: 'Delivery issues',
        content: 'What to do if you experience problems with delivery or damaged packages.'
      }
    ]
  },
  {
    id: 'payments-refunds',
    title: 'Payments & Refunds',
    icon: CreditCard,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    articles: [
      {
        id: 'payment-methods',
        title: 'Accepted payment methods',
        content: 'Learn about the payment methods we accept and how to add them to your account.'
      },
      {
        id: 'refund-process',
        title: 'Refund process',
        content: 'Understand our refund policy and how to request a refund for your order.'
      },
      {
        id: 'billing-issues',
        title: 'Billing and payment issues',
        content: 'Troubleshoot common payment and billing problems.'
      }
    ]
  },
  {
    id: 'selling-guide',
    title: 'Selling Guide',
    icon: Store,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    articles: [
      {
        id: 'become-seller',
        title: 'How to become a seller',
        content: 'Step-by-step guide to setting up your seller account and getting approved.'
      },
      {
        id: 'listing-products',
        title: 'Listing your products',
        content: 'Learn how to create compelling product listings that attract buyers.'
      },
      {
        id: 'order-management',
        title: 'Managing orders',
        content: 'How to process orders, handle customer inquiries, and manage your sales.'
      }
    ]
  }
];

const popularQuestions = [
  {
    question: 'How do I create an account?',
    answer: 'Click the "Sign Up" button in the top right corner, choose between customer or seller account, fill in your details, and verify your email address.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit cards, debit cards, bank transfers, and digital wallets. All payments are processed securely.'
  },
  {
    question: 'How long does shipping take?',
    answer: 'Shipping times vary by location and product. Most orders are processed within 1-2 business days and delivered within 3-7 business days.'
  },
  {
    question: 'Can I return a product?',
    answer: 'Yes, we offer a 30-day return policy for most products. Items must be in original condition with packaging.'
  },
  {
    question: 'How do I become a seller?',
    answer: 'Click "Sell on Electrify" in the footer, complete the registration process, provide required documents, and wait for approval.'
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UnifiedHeader products={[]} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Find answers to your questions and get the support you need
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-12"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/contact"
              className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <MessageSquare className="w-6 h-6 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Contact Us</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Send us a message</p>
              </div>
            </Link>
            <a
              href="tel:+2348167956792"
              className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Phone className="w-6 h-6 text-green-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Call Us</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">+234 816 795 6792</p>
              </div>
            </a>
            <a
              href="mailto:support@theelectrifystore.com"
              className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Mail className="w-6 h-6 text-purple-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Email Us</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">support@theelectrifystore.com</p>
              </div>
            </a>
          </div>
        </motion.div>

        {/* Popular Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Popular Questions
          </h2>
          <div className="space-y-4">
            {popularQuestions.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.question}
                  </span>
                  {expandedQuestion === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedQuestion === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Help Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className={`p-6 ${category.bgColor}`}>
                  <div className="flex items-center mb-4">
                    <category.icon className={`w-8 h-8 ${category.color} mr-3`} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {expandedCategory === category.id ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Hide articles
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Show articles
                      </>
                    )}
                  </button>
                </div>
                
                {expandedCategory === category.id && (
                  <div className="p-6 pt-0">
                    <div className="space-y-3">
                      {category.articles.map((article) => (
                        <div key={article.id} className="border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {article.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
