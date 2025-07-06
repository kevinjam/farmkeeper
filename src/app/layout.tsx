import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
