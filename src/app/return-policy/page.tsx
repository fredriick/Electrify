'use client';

import { ArrowLeft, Package, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Return Policy
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Policy Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                30-Day Return Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We want you to be completely satisfied with your purchase
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">30 Days</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Return window from delivery date</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Package className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Original Condition</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Product must be unused and in original packaging</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <CheckCircle className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Full Refund</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Including original shipping costs</p>
            </div>
          </div>
        </div>

        {/* Return Conditions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Return Conditions
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Eligible for Return</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Product is in original, unused condition</li>
                  <li>• All original packaging and accessories included</li>
                  <li>• Return request submitted within 30 days of delivery</li>
                  <li>• Product was not damaged during customer use</li>
                  <li>• All original tags and labels still attached</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Not Eligible for Return</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Products that have been installed or used</li>
                  <li>• Items with missing packaging or accessories</li>
                  <li>• Products damaged due to improper handling or installation</li>
                  <li>• Custom or special order items</li>
                  <li>• Software or digital products</li>
                  <li>• Products purchased from third-party sellers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            How to Return
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Customer Service</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Email us at returns@electrify.com or call 1-800-ELECTRIFY within 30 days of delivery. 
                  Include your order number and reason for return.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Receive Return Authorization</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We'll review your request and provide a Return Authorization Number (RAN) if approved. 
                  This number must be included with your return.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Package and Ship</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Securely package the item in its original packaging. Include the RAN and return form. 
                  Ship to the address provided in your return authorization email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Refund Processing</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Once we receive and inspect your return, we'll process your refund within 5-7 business days. 
                  You'll receive an email confirmation when the refund is issued.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Notes</h3>
              <ul className="text-yellow-700 dark:text-yellow-300 space-y-1 text-sm">
                <li>• Return shipping costs are the responsibility of the customer unless the item is defective</li>
                <li>• We recommend using a trackable shipping method for returns</li>
                <li>• Returns without a valid RAN may be refused</li>
                <li>• Refunds will be issued to the original payment method</li>
                <li>• Processing times may be longer during peak seasons</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Need Help?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Customer Service</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>📧 Email: returns@electrify.com</p>
                <p>📞 Phone: 1-800-ELECTRIFY</p>
                <p>🕒 Hours: Monday - Friday, 9 AM - 6 PM EST</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Return Address</h3>
              <div className="text-gray-600 dark:text-gray-400">
                <p>Electrify Returns</p>
                <p>123 Solar Street</p>
                <p>Green City, GC 12345</p>
                <p>United States</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 