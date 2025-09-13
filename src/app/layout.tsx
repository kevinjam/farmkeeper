import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/providers/session-provider';
import '@/lib/suppress-warnings';

// Initialize fonts
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://farmkeeper.vercel.app'),
  title: 'FarmKeeper - Farm Management System for Uganda',
  description: 'Complete farm management solution for Ugandan farmers to manage their livestock, crops, finances, and resources. Track analytics, manage livestock, monitor crops, and handle finances all in one place.',
  manifest: '/manifest.json',
  applicationName: 'FarmKeeper',
  authors: [{ name: 'FarmKeeper Team' }],
  keywords: ['farm management', 'agriculture', 'Uganda', 'livestock', 'crops', 'farming', 'analytics', 'financial management', 'crop tracking', 'livestock tracking'],
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
  openGraph: {
    title: 'FarmKeeper - Farm Management System for Uganda',
    description: 'Complete farm management solution for Ugandan farmers to manage their livestock, crops, finances, and resources. Track analytics, manage livestock, monitor crops, and handle finances all in one place.',
    type: 'website',
    locale: 'en_US',
    siteName: 'FarmKeeper',
    url: 'https://farmkeeper.vercel.app',
    images: [
      {
        url: '/social-preview.png',
        width: 1200,
        height: 630,
        alt: 'FarmKeeper - Farm Management System for Uganda',
        type: 'image/png',
      },
      {
        url: '/icons/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'FarmKeeper Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FarmKeeper - Farm Management System for Uganda',
    description: 'Complete farm management solution for Ugandan farmers to manage their livestock, crops, finances, and resources. Track analytics, manage livestock, monitor crops, and handle finances all in one place.',
    images: ['/social-preview.png'],
    creator: '@farmkeeper',
    site: '@farmkeeper',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
        color: '#16a34a',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FarmKeeper',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        {/* Additional icon and PWA meta tags */}
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FarmKeeper" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        
        {/* Theme and color meta tags */}
        <meta name="theme-color" content="#16a34a" />
        <meta name="msapplication-navbutton-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Enhanced Social Media Meta Tags */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="FarmKeeper - Farm Management System for Uganda" />
        
        {/* Twitter Card additional meta tags */}
        <meta name="twitter:image:alt" content="FarmKeeper - Farm Management System for Uganda" />
        <meta name="twitter:domain" content="farmkeeper.vercel.app" />
        <meta name="twitter:url" content="https://farmkeeper.vercel.app" />
        
        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* App-specific meta tags */}
        <meta name="application-name" content="FarmKeeper" />
        <meta name="apple-mobile-web-app-title" content="FarmKeeper" />
        <meta name="msapplication-tooltip" content="FarmKeeper - Farm Management System" />
        <meta name="msapplication-starturl" content="/" />
        
        {/* Geographic and language meta tags */}
        <meta name="geo.region" content="UG" />
        <meta name="geo.country" content="Uganda" />
        <meta name="language" content="en" />
        <meta name="geo.placename" content="Uganda" />
        
        {/* Structured Data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "FarmKeeper",
              "description": "Complete farm management solution for Ugandan farmers to manage their livestock, crops, finances, and resources.",
              "url": "https://farmkeeper.vercel.app",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "FarmKeeper Team"
              },
              "inLanguage": "en-US",
              "isAccessibleForFree": true,
              "screenshot": "https://farmkeeper.vercel.app/social-preview.png",
              "featureList": [
                "Livestock Management",
                "Crop Tracking",
                "Financial Management",
                "Analytics & Reports",
                "Weather Monitoring",
                "Task Management"
              ]
            })
          }}
        />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('farmkeeper-ui-theme') === 'dark' || (!('farmkeeper-ui-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider
            defaultTheme="system"
            storageKey="farmkeeper-ui-theme"
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
