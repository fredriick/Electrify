import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Providers, CartWishlistProvider } from '@/components/providers/Providers';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navigation from '@/components/ui/Navigation';
import { ConditionalFooter } from '@/components/ui/ConditionalFooter';
import { VisitorTracker } from '@/components/analytics/VisitorTracker';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Electrify | Solar Energy Marketplace',
    template: '%s | Electrify',
  },
  description: 'Connect with trusted suppliers and find the perfect solar panels for your home or business. Browse thousands of products, compare prices, and make informed decisions.',
  keywords: [
    'solar panels',
    'solar energy',
    'renewable energy',
    'solar marketplace',
    'solar suppliers',
    'solar installation',
    'green energy',
    'sustainable energy',
    'electrify',
  ],
  authors: [{ name: 'Electrify Team' }],
  creator: 'Electrify',
  publisher: 'Electrify',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Electrify | Solar Energy Marketplace',
    description: 'Connect with trusted suppliers and find the perfect solar panels for your home or business.',
    siteName: 'Electrify',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Electrify',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Electrify | Solar Energy Marketplace',
    description: 'Connect with trusted suppliers and find the perfect solar panels for your home or business.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'z58EkRLze3cS6wGndLfH9DnN3EKbscufla6yaNCtppo',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Favicon - Multiple formats for better browser support */}
        <link rel="icon" href="/favicon.ico?v=1" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png?v=1" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png?v=1" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=1" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest?v=1" />

        {/* Theme colors */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://s3.amazonaws.com" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Electrify',
              description: 'Connect with trusted suppliers and find the perfect solar panels for your home or business.',
              url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <CartWishlistProvider>
          <Providers>
            <AuthProvider>
              <VisitorTracker />
              <Navigation />
              {children}
              <ConditionalFooter />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </AuthProvider>
          </Providers>
        </CartWishlistProvider>
      </body>
    </html>
  );
} 