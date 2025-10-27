'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SellerLoginModal } from '@/components/auth/SellerLoginModal';
import { SellerRegisterModal } from '@/components/auth/SellerRegisterModal';

export default function SellPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showEmailVerificationPopup, setShowEmailVerificationPopup] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Check if user is already logged in as a seller and redirect to dashboard
  useEffect(() => {
    if (!loading && user && profile) {
      // Check if user is a supplier
      if (profile.role === 'SUPPLIER') {
        router.push('/dashboard');
      } else if (profile.role === 'CUSTOMER') {
        // If user is a customer, they need to register as a seller
      } else {
        // For admins or other roles, show the normal sell page
      }
    }
  }, [user, profile, loading, router]);

  // Close modals if user becomes authenticated
  useEffect(() => {
    if (user && profile && profile.role === 'SUPPLIER') {
      setShowLogin(false);
      setShowRegister(false);
    }
  }, [user, profile]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative">
      {/* Back Button - Outside card, always visible */}
      <Link 
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">Sell on ElectrifyShop</h1>
        {!loading && user && profile ? (
          // User is logged in but not a supplier
          <>
            <p className="mb-8 text-gray-600 dark:text-gray-300 text-center">
              {profile.role === 'CUSTOMER' 
                ? 'You are currently registered as a customer. To start selling, please log in with your seller account or register as a seller.'
                : 'To start selling, please log in with your seller account or register as a seller.'
              }
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowLogin(true)}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Seller Login
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Become a Seller
              </button>
            </div>
          </>
        ) : !loading ? (
          // User is not logged in (only show when not loading)
          <>
            <p className="mb-8 text-gray-600 dark:text-gray-300 text-center">
              To start selling, please log in or register as a seller.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowLogin(true)}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Seller Login
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Become a Seller
              </button>
            </div>
          </>
        ) : null}
      </div>
      <SellerLoginModal
        isOpen={showLogin && (!user || !profile || profile.role !== 'SUPPLIER')}
        onClose={() => setShowLogin(false)}
        onSellerLogin={(email, password) => {
          // Don't redirect here - let the modal handle the authentication and redirect
          // The modal will redirect to dashboard after successful authentication
        }}
      />
      <SellerRegisterModal
        isOpen={showRegister && (!user || !profile || profile.role !== 'SUPPLIER')}
        onClose={() => setShowRegister(false)}
        onSellerRegister={(sellerData) => {
          // Don't close the modal immediately - let the modal handle its own closing
          // The modal will close itself after showing success popup or email verification popup
        }}
        onEmailVerificationRequired={(email) => {
          setVerificationEmail(email);
          setShowEmailVerificationPopup(true);
          setShowRegister(false); // Close the registration modal
        }}
      />

      {/* Email Verification Popup - Outside of modal for proper z-index */}
      {showEmailVerificationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center max-w-md">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Check Your Email</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                We've sent a verification link to <strong>{verificationEmail}</strong>. Please check your inbox and click the link to activate your seller account.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Don't see the email? Check your spam folder or wait a few minutes for it to arrive.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowEmailVerificationPopup(false);
                  setVerificationEmail('');
                }}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Open email client or provide instructions
                  window.open(`mailto:${verificationEmail}`, '_blank');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Open Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 