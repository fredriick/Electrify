'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Home, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  const reference = searchParams.get('reference');

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 animate-spin rounded-full border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Processing your payment...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your transaction</p>
          </div>
            </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your purchase, {profile?.first_name}! Your order has been confirmed.
          </p>

          {/* Payment Reference */}
          {reference && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Payment Reference</p>
              <p className="font-mono text-lg font-semibold text-gray-900">{reference}</p>
                    </div>
                  )}
                  
          {/* Order Details */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              What happens next?
                    </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• You'll receive an order confirmation email shortly</li>
              <li>• Our team will review and process your order</li>
              <li>• You'll get updates on your order status</li>
              <li>• Delivery will be arranged based on your selection</li>
                  </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/my-orders')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              View My Orders
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
              </button>
        </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@theelectrifystore.com" className="text-blue-600 hover:underline">
                support@theelectrifystore.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 