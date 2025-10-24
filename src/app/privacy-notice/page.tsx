"use client";

import { ArrowLeft, Lock, Eye, Shield, Database, Users, Globe } from "lucide-react";
import Link from "next/link";

export default function PrivacyNoticePage() {
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
              <Lock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Notice</h1>
              <p className="text-gray-600 dark:text-gray-300">How we collect, use, and protect your information</p>
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
                  Electrify ("we," "our," or "us") is committed to protecting your privacy. This Privacy Notice explains 
                  how we collect, use, disclose, and safeguard your information when you use our solar marketplace platform.
                </p>
              </div>

              {/* Information We Collect */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary-600" />
                  Information We Collect
                </h2>
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Personal Information</h3>
                    <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1 ml-6">
                      <li>• Name, email address, and phone number</li>
                      <li>• Business information and credentials</li>
                      <li>• Billing and shipping addresses</li>
                      <li>• Payment information (processed securely)</li>
                      <li>• Government-issued identification documents</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Usage Information</h3>
                    <ul className="text-green-700 dark:text-green-300 text-sm space-y-1 ml-6">
                      <li>• Platform usage patterns and preferences</li>
                      <li>• Search queries and product interactions</li>
                      <li>• Communication history with other users</li>
                      <li>• Device information and IP addresses</li>
                      <li>• Cookies and similar tracking technologies</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Business Information</h3>
                    <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1 ml-6">
                      <li>• Company registration and tax information</li>
                      <li>• Business licenses and certifications</li>
                      <li>• Product catalogs and inventory data</li>
                      <li>• Transaction history and performance metrics</li>
                      <li>• Customer feedback and reviews</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary-600" />
                  How We Use Your Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Platform Operations</h3>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• Provide and maintain our services</li>
                      <li>• Process transactions and payments</li>
                      <li>• Facilitate communication between users</li>
                      <li>• Verify identities and credentials</li>
                      <li>• Ensure platform security and compliance</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Improvement & Analytics</h3>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• Analyze usage patterns and trends</li>
                      <li>• Improve platform functionality</li>
                      <li>• Develop new features and services</li>
                      <li>• Provide personalized recommendations</li>
                      <li>• Conduct research and analytics</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Information Sharing */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Information Sharing</h2>
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">When We Share Information</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">With Other Users</h4>
                      <p className="text-purple-700 dark:text-purple-300 text-sm">
                        Basic business information may be shared with other platform users to facilitate transactions.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">With Service Providers</h4>
                      <p className="text-purple-700 dark:text-purple-300 text-sm">
                        We may share information with trusted third-party service providers who assist in platform operations.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Legal Requirements</h4>
                      <p className="text-purple-700 dark:text-purple-300 text-sm">
                        We may disclose information when required by law or to protect our rights and safety.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-600" />
                  Data Security
                </h2>
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Security Measures</h3>
                  <ul className="text-green-700 dark:text-green-300 text-sm space-y-1 ml-6">
                    <li>• Industry-standard encryption for data transmission</li>
                    <li>• Secure data storage with access controls</li>
                    <li>• Regular security audits and assessments</li>
                    <li>• Employee training on data protection</li>
                    <li>• Incident response and breach notification procedures</li>
                  </ul>
                </div>
              </div>

              {/* Your Rights */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your Privacy Rights</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Access & Control</h3>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• Access your personal information</li>
                      <li>• Update or correct your data</li>
                      <li>• Request deletion of your data</li>
                      <li>• Opt-out of marketing communications</li>
                      <li>• Download your data (portability)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Communication Preferences</h3>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• Manage email preferences</li>
                      <li>• Control notification settings</li>
                      <li>• Set privacy preferences</li>
                      <li>• Manage cookie settings</li>
                      <li>• Request data processing restrictions</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* International Transfers */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary-600" />
                  International Data Transfers
                </h2>
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                  <p className="text-orange-700 dark:text-orange-300 text-sm">
                    Your information may be transferred to and processed in countries other than your own. 
                    We ensure appropriate safeguards are in place to protect your data in accordance with 
                    applicable data protection laws.
                  </p>
                </div>
              </div>

              {/* Children's Privacy */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Children's Privacy</h2>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    Our platform is not intended for children under 18 years of age. We do not knowingly 
                    collect personal information from children under 18. If you believe we have collected 
                    information from a child under 18, please contact us immediately.
                  </p>
                </div>
              </div>

              {/* Changes to Privacy Notice */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Changes to This Privacy Notice</h2>
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    We may update this Privacy Notice from time to time. We will notify you of any material 
                    changes by posting the new Privacy Notice on this page and updating the "Last Updated" date. 
                    We encourage you to review this Privacy Notice periodically.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                  Contact Us
                </h3>
                <p className="text-primary-700 dark:text-primary-300 mb-4">
                  If you have questions about this Privacy Notice or our privacy practices, please contact us.
                </p>
                <div className="space-y-2 text-sm text-primary-700 dark:text-primary-300">
                  <p><strong>Email:</strong> privacy@electrify.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Address:</strong> 123 Solar Street, Green City, ST 12345</p>
                  <p><strong>Data Protection Officer:</strong> dpo@electrify.com</p>
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
} ``