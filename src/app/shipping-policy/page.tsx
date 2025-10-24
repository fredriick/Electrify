'use client';

import { ArrowLeft, Truck, Clock, MapPin, AlertCircle, CheckCircle, Package } from 'lucide-react';
import Link from 'next/link';

export default function ShippingPolicyPage() {
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
              Shipping & Delivery Policy
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Policy Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Truck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Fast & Reliable Delivery
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Professional delivery service for your solar products
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MapPin className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Local Delivery</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Within specified service areas</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Scheduled Delivery</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred time slot</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Package className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Professional Handling</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Careful handling of fragile items</p>
            </div>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Delivery Options
          </h2>
          
          <div className="space-y-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                Standard Delivery
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Professional delivery service with scheduled time slots and careful handling.
              </p>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Delivery within specified service areas</li>
                <li>• Scheduled delivery time slots</li>
                <li>• Professional handling and placement</li>
                <li>• Delivery confirmation and signature</li>
                <li>• Basic unpacking and inspection</li>
              </ul>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Premium Delivery
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Enhanced service including installation preparation and site inspection.
              </p>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• All standard delivery features</li>
                <li>• Site inspection and preparation</li>
                <li>• Installation area preparation</li>
                <li>• Detailed product inspection</li>
                <li>• Installation coordination support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Delivery Process */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Delivery Process
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Confirmation</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  After placing your order, you'll receive a confirmation email with delivery details and estimated timeframe.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Delivery Scheduling</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our delivery team will contact you within 24 hours to schedule your preferred delivery time slot.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Delivery Day</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  On delivery day, our team will arrive within the scheduled time window and handle your products with care.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Delivery Completion</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Products are carefully placed, inspected, and you'll receive delivery confirmation and next steps.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Requirements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Delivery Requirements
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Customer Responsibilities</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Ensure someone is available at the delivery address during the scheduled time</li>
                  <li>• Provide clear access to the delivery location</li>
                  <li>• Have a valid ID ready for delivery confirmation</li>
                  <li>• Ensure the delivery area is clear and accessible</li>
                  <li>• Be available to inspect the products upon delivery</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Our Service</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Professional handling and transportation</li>
                  <li>• Scheduled delivery time slots</li>
                  <li>• Product inspection upon delivery</li>
                  <li>• Basic unpacking and placement</li>
                  <li>• Delivery confirmation and documentation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Fees */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Delivery Fees & Areas
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Standard Delivery</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>• Within 30km: $0 - $15</p>
                <p>• 30-50km: $15 - $25</p>
                <p>• 50-80km: $25 - $40</p>
                <p>• 80km+: Contact for quote</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Premium Delivery</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>• Additional $20 - $50</p>
                <p>• Site inspection included</p>
                <p>• Installation preparation</p>
                <p>• Extended service hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Delivery Notes</h3>
              <ul className="text-yellow-700 dark:text-yellow-300 space-y-1 text-sm">
                <li>• Delivery fees vary by location and product size</li>
                <li>• Orders placed 6+ hours before delivery start time qualify for same-day delivery</li>
                <li>• Weekend and evening deliveries available for premium service</li>
                <li>• Delivery may be delayed due to weather conditions</li>
                <li>• Signature required for all deliveries</li>
                <li>• Contact us immediately if you notice any damage during delivery</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Delivery Support
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Delivery Team</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>📧 Email: delivery@electrify.com</p>
                <p>📞 Phone: 1-800-ELECTRIFY</p>
                <p>🕒 Hours: Monday - Saturday, 8 AM - 8 PM EST</p>
                <p>📱 Text: For delivery updates and scheduling</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Service Areas</h3>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <p>• Major metropolitan areas</p>
                <p>• Suburban communities</p>
                <p>• Rural areas (limited service)</p>
                <p>• Commercial and residential</p>
                <p>• Contact us for specific area coverage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 