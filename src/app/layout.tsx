import './globals.css';
import type { Metadata } from 'next';
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
  title: 'FarmKeeper - Farm Management System for Uganda',
  description: 'Complete farm management solution for Ugandan farmers to manage their livestock, crops, finances, and resources.',
  manifest: '/manifest.json',
  themeColor: '#16a34a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  applicationName: 'FarmKeeper',
  authors: [{ name: 'FarmKeeper Team' }],
  keywords: ['farm management', 'agriculture', 'Uganda', 'livestock', 'crops', 'farming'],
  openGraph: {
    title: 'FarmKeeper - Farm Management System for Uganda',
    description: 'Complete farm management solution for Ugandan farmers to manage their livestock, crops, finances, and resources.',
    type: 'website',
    locale: 'en_US',
    siteName: 'FarmKeeper',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FarmKeeper - Farm Management System for Uganda',
    description: 'Complete farm management solution for Ugandan farmers to manage their livestock, crops, finances, and resources.',
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
