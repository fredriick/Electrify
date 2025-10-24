"use client";

import { ArrowLeft, Cookie, Settings, Eye, Shield, Clock, Database } from "lucide-react";
import Link from "next/link";

export default function CookieNoticePage() {
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
              <Cookie className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cookie Notice</h1>
              <p className="text-gray-600 dark:text-gray-300">How we use cookies and similar technologies</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="mb-8">
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                              <strong>Effective Date:</strong> July 19, 2025<br />
            <strong>Last Updated:</strong> July 19, 2025
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  This Cookie Notice explains how Electrify ("we," "our," or "us") uses cookies and similar 
                  technologies when you visit our website and use our platform. By using our services, you 
                  consent to the use of cookies as described in this notice.
                </p>
              </div>

              {/* What Are Cookies */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">What Are Cookies?</h2>
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Cookies are small text files that are stored on your device (computer, tablet, or mobile) 
                    when you visit a website. They help websites remember information about your visit, such as 
                    your preferred language and other settings, which can make your next visit easier and more 
                    useful to you.
                  </p>
                </div>
              </div>

              {/* Types of Cookies We Use */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary-600" />
                  Types of Cookies We Use
                </h2>
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Essential Cookies</h3>
                    <p className="text-green-700 dark:text-green-300 text-sm mb-2">
                      These cookies are necessary for the website to function properly and cannot be disabled.
                    </p>
                    <ul className="text-green-700 dark:text-green-300 text-sm space-y-1 ml-6">
                      <li>• Authentication and security cookies</li>
                      <li>• Session management cookies</li>
                      <li>• Shopping cart functionality</li>
                      <li>• Load balancing and performance</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Functional Cookies</h3>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-2">
                      These cookies enable enhanced functionality and personalization.
                    </p>
                    <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1 ml-6">
                      <li>• Language and region preferences</li>
                      <li>• User interface customization</li>
                      <li>• Form auto-fill functionality</li>
                      <li>• Social media integration</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Analytics Cookies</h3>
                    <p className="text-purple-700 dark:text-purple-300 text-sm mb-2">
                      These cookies help us understand how visitors interact with our website.
                    </p>
                    <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-1 ml-6">
                      <li>• Page visit statistics</li>
                      <li>• User behavior analysis</li>
                      <li>• Performance monitoring</li>
                      <li>• Error tracking and debugging</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Marketing Cookies</h3>
                    <p className="text-orange-700 dark:text-orange-300 text-sm mb-2">
                      These cookies are used to deliver relevant advertisements and track marketing campaigns.
                    </p>
                    <ul className="text-orange-700 dark:text-orange-300 text-sm space-y-1 ml-6">
                      <li>• Targeted advertising</li>
                      <li>• Campaign effectiveness tracking</li>
                      <li>• Social media advertising</li>
                      <li>• Remarketing campaigns</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Cookie Duration */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Cookie Duration
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Session Cookies</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      These cookies are temporary and are deleted when you close your browser. They are used 
                      to maintain your session and provide essential functionality.
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Persistent Cookies</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      These cookies remain on your device for a set period or until you delete them. They 
                      remember your preferences and settings for future visits.
                    </p>
                  </div>
                </div>
              </div>

              {/* Third-Party Cookies */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Third-Party Cookies</h2>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">External Services</h3>
                  <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                    We may use third-party services that place their own cookies on your device:
                  </p>
                  <ul className="text-red-700 dark:text-red-300 text-sm space-y-1 ml-6">
                    <li>• Google Analytics for website analytics</li>
                    <li>• Payment processors for secure transactions</li>
                    <li>• Social media platforms for sharing features</li>
                    <li>• Advertising networks for targeted ads</li>
                    <li>• Customer support tools for assistance</li>
                  </ul>
                </div>
              </div>

              {/* Managing Cookies */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-600" />
                  Managing Your Cookie Preferences
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Browser Settings</h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                      You can control cookies through your browser settings:
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1 ml-6">
                      <li>• Chrome: Settings → Privacy and security → Cookies and other site data</li>
                      <li>• Firefox: Options → Privacy & Security → Cookies and Site Data</li>
                      <li>• Safari: Preferences → Privacy → Manage Website Data</li>
                      <li>• Edge: Settings → Cookies and site permissions → Cookies and site data</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Cookie Consent</h3>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      When you first visit our website, you'll see a cookie consent banner that allows you 
                      to accept or decline non-essential cookies. You can change your preferences at any time 
                      through our cookie settings panel.
                    </p>
                  </div>
                </div>
              </div>

              {/* Impact of Disabling Cookies */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Impact of Disabling Cookies</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">What Happens If You Disable Cookies?</h3>
                  <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1 ml-6">
                    <li>• Some website features may not work properly</li>
                    <li>• You may need to re-enter information repeatedly</li>
                    <li>• Personalized content and recommendations may not be available</li>
                    <li>• Shopping cart functionality may be limited</li>
                    <li>• Security features may be affected</li>
                  </ul>
                </div>
              </div>

              {/* Data Protection */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-600" />
                  Data Protection & Security
                </h2>
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">How We Protect Cookie Data</h3>
                  <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-1 ml-6">
                    <li>• Secure transmission of cookie data</li>
                    <li>• Encryption of sensitive information</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Compliance with data protection regulations</li>
                    <li>• Limited data retention periods</li>
                  </ul>
                </div>
              </div>

              {/* Updates to Cookie Notice */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Updates to This Cookie Notice</h2>
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                  <p className="text-orange-700 dark:text-orange-300 text-sm">
                    We may update this Cookie Notice from time to time to reflect changes in our practices 
                    or for other operational, legal, or regulatory reasons. We will notify you of any 
                    material changes by posting the updated notice on our website.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                  Questions About Cookies?
                </h3>
                <p className="text-primary-700 dark:text-primary-300 mb-4">
                  If you have questions about our use of cookies or this Cookie Notice, please contact us.
                </p>
                <div className="space-y-2 text-sm text-primary-700 dark:text-primary-300">
                  <p><strong>Email:</strong> cookies@electrify.com</p>
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