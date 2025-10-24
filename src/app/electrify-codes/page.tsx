"use client";

import { ArrowLeft, Shield, Users, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";

export default function ElectrifyCodesPage() {
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
              <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Electrify Codes</h1>
              <p className="text-gray-600 dark:text-gray-300">Platform standards and codes of conduct</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Platform Code of Conduct</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Electrify is committed to maintaining a professional, ethical, and sustainable marketplace for solar products. 
                  All suppliers, customers, and platform users must adhere to these codes to ensure a positive experience for everyone.
                </p>
              </div>

              {/* Supplier Codes */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  Supplier Code of Conduct
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Quality Standards
                    </h4>
                    <ul className="text-green-700 dark:text-green-300 text-sm space-y-1 ml-6">
                      <li>• All products must meet or exceed industry safety standards</li>
                      <li>• Provide accurate product specifications and certifications</li>
                      <li>• Maintain proper product testing and quality control procedures</li>
                      <li>• Ensure all products are properly labeled and documented</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Business Ethics
                    </h4>
                    <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1 ml-6">
                      <li>• Conduct business with honesty, integrity, and transparency</li>
                      <li>• Provide accurate pricing and shipping information</li>
                      <li>• Honor all commitments and agreements</li>
                      <li>• Maintain proper business licenses and certifications</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Customer Service
                    </h4>
                    <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1 ml-6">
                      <li>• Respond to customer inquiries within 24 hours</li>
                      <li>• Provide clear and accurate product information</li>
                      <li>• Handle returns and disputes professionally</li>
                      <li>• Maintain clear communication throughout transactions</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Environmental Standards */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Environmental Standards</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sustainable Practices</h4>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• Minimize environmental impact in operations</li>
                      <li>• Use eco-friendly packaging materials</li>
                      <li>• Implement energy-efficient processes</li>
                      <li>• Support renewable energy initiatives</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Compliance Requirements</h4>
                    <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                      <li>• Meet all environmental regulations</li>
                      <li>• Proper disposal of electronic waste</li>
                      <li>• Carbon footprint reduction strategies</li>
                      <li>• Regular environmental impact assessments</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Protection */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Protection & Security</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                    <li>• Protect customer and business data with industry-standard security measures</li>
                    <li>• Comply with all applicable data protection laws and regulations</li>
                    <li>• Implement secure payment processing and data transmission</li>
                    <li>• Regular security audits and vulnerability assessments</li>
                    <li>• Prompt notification of any data breaches or security incidents</li>
                  </ul>
                </div>
              </div>

              {/* Compliance & Enforcement */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Compliance & Enforcement</h3>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Violation Consequences</h4>
                  <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                    <li>• First violation: Warning and required corrective action</li>
                    <li>• Second violation: Temporary suspension and mandatory training</li>
                    <li>• Third violation: Permanent removal from platform</li>
                    <li>• Serious violations may result in immediate suspension</li>
                  </ul>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                  Questions or Concerns?
                </h3>
                <p className="text-primary-700 dark:text-primary-300 mb-4">
                  If you have questions about these codes or need to report a violation, please contact our compliance team.
                </p>
                <div className="space-y-2 text-sm text-primary-700 dark:text-primary-300">
                  <p><strong>Email:</strong> compliance@electrify.com</p>
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