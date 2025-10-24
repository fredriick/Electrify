import Link from 'next/link';
import Image from 'next/image';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
  Heart,
  ShoppingCart,
  Store,
  User,
  Settings,
  BarChart3,
  CreditCard,
  Package,
  MessageCircle
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/white logo upscaled.png"
                alt="Electrify Logo"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </Link>
            <p className="text-gray-300 text-sm">
              Your trusted solar energy marketplace.
            </p>
            <div className="flex space-x-4">
               <a 
                 href="mailto:support@theelectrifystore.com" 
                 className="text-gray-400 hover:text-white transition-colors"
                 aria-label="Email Support"
               >
                <Mail className="w-5 h-5" />
              </a>
                 <a 
                   href="tel:+2348167956792" 
                   className="text-gray-400 hover:text-white transition-colors"
                   aria-label="Phone Support"
                 >
                   <Phone className="w-5 h-5" />
                 </a>
              <Link 
                href="/contact" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Contact Us"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-gray-300 hover:text-white transition-colors">
                  Sell on Electrify
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                 <a 
                   href="mailto:support@theelectrifystore.com" 
                   className="text-gray-300 hover:text-white transition-colors"
                 >
                   Email Support
                 </a>
              </li>
              <li>
                 <a 
                   href="tel:+2348167956792" 
                   className="text-gray-300 hover:text-white transition-colors"
                 >
                   Phone Support
                 </a>
              </li>
            </ul>
          </div>

           {/* Customer Support */}
           <div className="space-y-4">
             <h3 className="text-lg font-semibold">Customer Support</h3>
             <ul className="space-y-2 text-sm">
               <li>
                 <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                   Contact Us
                 </Link>
               </li>
               <li>
                 <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                   Help Center
                 </Link>
               </li>
               <li>
                 <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                   FAQ
                 </Link>
               </li>
             </ul>
           </div>

          {/* Account & Business */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-300 hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-gray-300 hover:text-white transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="text-gray-300 hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-gray-300 hover:text-white transition-colors">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-300">Phone Support</p>
                 <a 
                   href="tel:+2348167956792" 
                   className="text-white font-medium hover:text-blue-400 transition-colors"
                 >
                   +234 816 795 6792
                 </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-300">Email Support</p>
                 <a 
                   href="mailto:support@theelectrifystore.com" 
                   className="text-white font-medium hover:text-blue-400 transition-colors"
                 >
                   support@theelectrifystore.com
                 </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-300">Office Address</p>
                 <p className="text-white font-medium">
                   Spring Dr road Oniru, Lagos
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
           <p className="text-sm text-gray-400">
             © 2025 Electrify. All rights reserved.
           </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
