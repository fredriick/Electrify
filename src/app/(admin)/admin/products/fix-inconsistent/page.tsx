'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import { productApprovalService } from '@/lib/productApprovalService';

export default function FixInconsistentProductsPage() {
  const [isFixing, setIsFixing] = useState(false);
  const [isFixingBoolean, setIsFixingBoolean] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);

  const handleFixInconsistentProducts = async () => {
    setIsFixing(true);
    setResult(null);
    
    try {
      const fixResult = await productApprovalService.fixInconsistentProducts();
      setResult(fixResult);
    } catch (error) {
      setResult({
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleFixApprovedBooleanFlag = async () => {
    setIsFixingBoolean(true);
    setResult(null);
    
    try {
      const fixResult = await productApprovalService.fixApprovedProductsBooleanFlag();
      setResult(fixResult);
    } catch (error) {
      setResult({
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsFixingBoolean(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fix Inconsistent Products</h1>
          <p className="text-gray-600">
            Fix products with inconsistent approval status and active state
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Product Approval State Fixer
            </h2>
            <p className="text-gray-600 mt-1">
              This tool will automatically fix products where the approval status and active state are inconsistent.
              For example, approved products that are marked as inactive.
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What these tools fix:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• <strong>General Fix:</strong> All inconsistent approval states (is_active vs approval_status)</li>
                <li>• <strong>Boolean Flag Fix:</strong> Products with approval_status = 'approved' but is_approved = false</li>
                <li>• Ensures consistency between all approval-related fields</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleFixInconsistentProducts}
                disabled={isFixing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isFixing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fixing All Inconsistent Products...
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4" />
                    Fix All Inconsistent Products
                  </>
                )}
              </button>

              <button
                onClick={handleFixApprovedBooleanFlag}
                disabled={isFixingBoolean}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isFixingBoolean ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fixing Approved Products Boolean Flag...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Fix Approved Products Boolean Flag (Targets product1 issue)
                  </>
                )}
              </button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'border-green-200 bg-green-50 text-green-800' 
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div className="font-semibold">
                    {result.success ? 'Success!' : 'Error'}
                  </div>
                </div>
                <div>{result.message}</div>
                {result.error && (
                  <div className="mt-2 text-sm opacity-80">
                    Error details: {result.error}
                  </div>
                )}
              </div>
            )}

            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How it works:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li><strong>General Fix:</strong> Scans all products for inconsistent states and fixes them</li>
                <li><strong>Boolean Flag Fix:</strong> Specifically targets products with approval_status = 'approved' but is_approved = false</li>
                <li>Automatically sets <code className="bg-gray-200 px-1 rounded">is_active = true</code> and <code className="bg-gray-200 px-1 rounded">is_approved = true</code> for approved products</li>
                <li>Ensures only approved AND active products appear on the home page</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">For your product1 issue:</h4>
              <p className="text-yellow-800 text-sm">
                Use the <strong>"Fix Approved Products Boolean Flag"</strong> button. This will specifically fix products like product1 that have:
                <br />• <code className="bg-yellow-100 px-1 rounded">approval_status = 'approved'</code> ✅
                <br />• <code className="bg-yellow-100 px-1 rounded">is_active = true</code> ✅  
                <br />• <code className="bg-yellow-100 px-1 rounded">is_approved = false</code> ❌
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
