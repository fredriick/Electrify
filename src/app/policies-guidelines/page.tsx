"use client";

import { ArrowLeft, BookOpen, Scale, Clock, DollarSign, Truck, Shield } from "lucide-react";
import Link from "next/link";

export default function PoliciesGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Policies & Guidelines</h1>
              <p className="text-gray-600 dark:text-gray-300">Platform policies and operational guidelines</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Platform Policies</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  These policies and guidelines govern the operation of the Electrify platform and ensure fair, 
                  transparent, and efficient business practices for all participants.
                </p>
              </div>

              {/* Listing Policies */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  Product Listing Policies
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Product Information</h4>
                    <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1 ml-6">
                      <li>• Accurate and complete product descriptions</li>
                      <li>• High-quality product images (minimum 3 per product)</li>
                      <li>• Clear pricing with all applicable fees</li>
                      <li>• Detailed specifications and technical data</li>
                      <li>• Warranty and return policy information</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Prohibited Items</h4>
                    <ul className="text-green-700 dark:text-green-300 text-sm space-y-1 ml-6">
                      <li>• Counterfeit or unauthorized products</li>
                      <li>• Products that don't meet safety standards</li>
                      <li>• Items with false certifications</li>
                      <li>• Products that violate intellectual property rights</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Pricing & Payment Policies */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  Pricing & Payment Policies
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pricing Guidelines</h4>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• Competitive and fair pricing</li>
                      <li>• Clear disclosure of all costs</li>
                      <li>• No hidden fees or charges</li>
                      <li>• Price updates with 30-day notice</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Terms</h4>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• Net 30 payment terms standard</li>
                      <li>• Secure payment processing</li>
                      <li>• Multiple payment methods accepted</li>
                      <li>• Clear invoicing requirements</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Shipping & Delivery */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-600" />
                  Shipping & Delivery Policies
                </h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Shipping Requirements</h4>
                  <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1 ml-6">
                    <li>• Accurate shipping time estimates</li>
                    <li>• Proper packaging for solar equipment</li>
                    <li>• Tracking information provided</li>
                    <li>• Insurance for high-value items</li>
                    <li>• Clear delivery instructions</li>
                  </ul>
                </div>
              </div>

              {/* Return & Refund Policies */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Return & Refund Policies</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Return Conditions</h4>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• 30-day return window for most items</li>
                      <li>• Products must be in original condition</li>
                      <li>• Original packaging required</li>
                      <li>• Return shipping costs may apply</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Refund Process</h4>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• Refunds processed within 5-7 business days</li>
                      <li>• Full refund for defective items</li>
                      <li>• Restocking fees may apply</li>
                      <li>• Clear refund policy communication</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Dispute Resolution */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary-600" />
                  Dispute Resolution
                </h3>
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Resolution Process</h4>
                  <ol className="text-purple-700 dark:text-purple-300 text-sm space-y-2 ml-6">
                    <li>1. Direct communication between parties (48 hours)</li>
                    <li>2. Platform mediation (5 business days)</li>
                    <li>3. Formal dispute resolution (10 business days)</li>
                    <li>4. Arbitration if necessary (30 days)</li>
                  </ol>
                </div>
              </div>

              {/* Performance Standards */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-600" />
                  Performance Standards
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Response Times</h4>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• Customer inquiries: 24 hours</li>
                      <li>• Order confirmations: 2 hours</li>
                      <li>• Shipping updates: 48 hours</li>
                      <li>• Issue resolution: 72 hours</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quality Metrics</h4>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• 95% on-time delivery rate</li>
                      <li>• 98% customer satisfaction</li>
                      <li>• &lt;2% defect rate</li>
                      <li>• 99% order accuracy</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Updates & Changes */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Policy Updates
                </h3>
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Update Process</h4>
                  <ul className="text-orange-700 dark:text-orange-300 text-sm space-y-1 ml-6">
                    <li>• 30-day notice for major policy changes</li>
                    <li>• Immediate notification for security updates</li>
                    <li>• Clear communication of changes</li>
                    <li>• Opportunity for feedback on proposed changes</li>
                  </ul>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                  Need Clarification?
                </h3>
                <p className="text-primary-700 dark:text-primary-300 mb-4">
                  If you need clarification on any policy or guideline, please contact our support team.
                </p>
                <div className="space-y-2 text-sm text-primary-700 dark:text-primary-300">
                  <p><strong>Email:</strong> policies@electrify.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Last updated: July 19, 2025
        </div>
      </div>
    </div>
  );
} 