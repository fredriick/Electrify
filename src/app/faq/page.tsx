'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Search,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { UnifiedHeader } from '@/components/ui/UnifiedHeader';

const faqCategories = [
  {
    id: 'general',
    title: 'General Questions',
    icon: '❓',
    questions: [
      {
        question: 'What is Electrify?',
        answer: 'Electrify is a comprehensive solar energy marketplace that connects customers with trusted suppliers to find the perfect solar solutions for homes and businesses. We offer a wide range of solar panels, installation services, and expert guidance.'
      },
      {
        question: 'How do I get started on Electrify?',
        answer: 'Getting started is easy! Simply create an account by clicking "Sign Up" in the top right corner. Choose between a customer account to buy products or a seller account to start selling. Complete your profile and you\'re ready to go!'
      },
      {
        question: 'Is Electrify free to use?',
        answer: 'Yes, creating an account and browsing products on Electrify is completely free. We only charge fees when you make a purchase or when sellers complete a sale. There are no hidden costs or subscription fees.'
      },
      {
        question: 'How do I contact customer support?',
        answer: 'You can reach our customer support team through multiple channels: email us at support@theelectrifystore.com, call us at +234 816 795 6792, or use our contact form. We typically respond within 24 hours.'
      }
    ]
  },
  {
    id: 'account',
    title: 'Account & Registration',
    icon: '👤',
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button in the top right corner of any page. Choose between "Customer" or "Seller" account type, fill in your details, verify your email address, and complete your profile setup.'
      },
      {
        question: 'What\'s the difference between customer and seller accounts?',
        answer: 'Customer accounts are for people who want to buy solar products and services. Seller accounts are for businesses and individuals who want to sell solar products on our marketplace. Each has different features and requirements.'
      },
      {
        question: 'How do I verify my account?',
        answer: 'After registration, check your email for a verification link. Click the link to verify your email address. For seller accounts, you may need to provide additional documentation for business verification.'
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
      },
      {
        question: 'Can I change my account type?',
        answer: 'Yes, you can upgrade from a customer account to a seller account at any time. However, you cannot downgrade from seller to customer once you\'ve started selling. Contact support if you need assistance with account changes.'
      }
    ]
  },
  {
    id: 'buying',
    title: 'Buying Products',
    icon: '🛒',
    questions: [
      {
        question: 'How do I find products on Electrify?',
        answer: 'Use our search bar to find specific products, or browse by categories. You can filter results by price, brand, specifications, and seller location. Our advanced filters help you find exactly what you need.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit cards (Visa, MasterCard, American Express), debit cards, bank transfers, and digital wallets. All payments are processed securely through our payment partners.'
      },
      {
        question: 'How do I add items to my wishlist?',
        answer: 'Click the heart icon on any product to add it to your wishlist. You can view and manage your wishlist by clicking the heart icon in the header or visiting the wishlist page.'
      },
      {
        question: 'Can I compare different products?',
        answer: 'Yes! Add products to your wishlist and use our comparison tool to see side-by-side specifications, prices, and features. This helps you make informed purchasing decisions.'
      },
      {
        question: 'What if a product is out of stock?',
        answer: 'If a product is out of stock, you can add it to your wishlist to be notified when it\'s back in stock. You can also contact the seller directly to inquire about availability.'
      }
    ]
  },
  {
    id: 'orders',
    title: 'Orders & Shipping',
    icon: '📦',
    questions: [
      {
        question: 'How do I place an order?',
        answer: 'Add products to your cart, review your order, enter your shipping information, choose a payment method, and complete the checkout process. You\'ll receive an order confirmation email with tracking information.'
      },
      {
        question: 'How long does shipping take?',
        answer: 'Shipping times vary by location and product type. Most orders are processed within 1-2 business days and delivered within 3-7 business days. Express shipping options are available for faster delivery.'
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order by logging into your account and visiting the "My Orders" page.'
      },
      {
        question: 'What if my order is damaged or incorrect?',
        answer: 'Contact us immediately if you receive a damaged or incorrect item. We\'ll work with the seller to resolve the issue quickly, including arranging returns, exchanges, or refunds as appropriate.'
      },
      {
        question: 'Can I cancel my order?',
        answer: 'You can cancel your order if it hasn\'t been shipped yet. Once shipped, you\'ll need to follow our return process. Contact customer support for assistance with cancellations.'
      }
    ]
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    icon: '↩️',
    questions: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for most products. Items must be in original condition with packaging and proof of purchase. Some items may have different return policies - check the product page for details.'
      },
      {
        question: 'How do I return a product?',
        answer: 'Log into your account, go to "My Orders", find the order you want to return, and click "Return Item". Follow the instructions to print a return label and send the item back to the seller.'
      },
      {
        question: 'How long do refunds take?',
        answer: 'Once we receive your returned item, refunds are typically processed within 3-5 business days. The refund will appear on your original payment method within 5-10 business days, depending on your bank.'
      },
      {
        question: 'Who pays for return shipping?',
        answer: 'Return shipping costs depend on the reason for return. If the item is defective or incorrect, we cover the return shipping. If you\'re returning for other reasons, you may be responsible for return shipping costs.'
      },
      {
        question: 'Can I exchange a product instead of returning it?',
        answer: 'Yes, many sellers offer exchanges. Contact the seller directly or use our return process and specify that you want an exchange. Availability depends on the seller\'s stock.'
      }
    ]
  },
  {
    id: 'selling',
    title: 'Selling on Electrify',
    icon: '🏪',
    questions: [
      {
        question: 'How do I become a seller?',
        answer: 'Click "Sell on Electrify" in the footer or header, complete the seller registration form, provide required business documents, and wait for approval. The approval process typically takes 2-3 business days.'
      },
      {
        question: 'What documents do I need to become a seller?',
        answer: 'Required documents include business license, tax identification number, bank account information, and product certifications. Individual sellers may need different documentation than business sellers.'
      },
      {
        question: 'What fees do sellers pay?',
        answer: 'Sellers pay a commission fee on each sale, typically 5-10% depending on the product category. There are also optional fees for premium listings and advertising features.'
      },
      {
        question: 'How do I list my products?',
        answer: 'Log into your seller dashboard, click "Add Product", fill in product details including photos, specifications, and pricing. Our system will review your listing before it goes live.'
      },
      {
        question: 'How do I manage orders as a seller?',
        answer: 'Use your seller dashboard to view incoming orders, update order status, communicate with customers, and manage your inventory. You\'ll receive notifications for new orders and customer messages.'
      }
    ]
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<{ category: string; question: number } | null>(null);

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleQuestion = (categoryId: string, questionIndex: number) => {
    const currentKey = `${categoryId}-${questionIndex}`;
    const expandedKey = expandedQuestion ? `${expandedQuestion.category}-${expandedQuestion.question}` : null;
    
    if (currentKey === expandedKey) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion({ category: categoryId, question: questionIndex });
    }
  };

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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Find quick answers to the most common questions about Electrify
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-12"
        >
          <div className="flex items-center mb-4">
            <HelpCircle className="w-6 h-6 text-blue-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Still have questions?
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
            <a
              href="tel:+2348167956792"
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Us
            </a>
            <a
              href="mailto:support@theelectrifystore.com"
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Us
            </a>
          </div>
        </motion.div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + categoryIndex * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <span className="text-3xl mr-3">{category.icon}</span>
                  {category.title}
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {category.questions.map((faq, questionIndex) => {
                  const isExpanded = expandedQuestion?.category === category.id && expandedQuestion?.question === questionIndex;
                  
                  return (
                    <div key={questionIndex} className="p-6">
                      <button
                        onClick={() => toggleQuestion(category.id, questionIndex)}
                        className="w-full text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 -m-6 p-6 rounded-lg transition-colors"
                      >
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white pr-4">
                          {faq.question}
                        </h3>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4"
                        >
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {searchQuery && filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We couldn't find any FAQ items matching "{searchQuery}". Try different keywords or contact our support team.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
