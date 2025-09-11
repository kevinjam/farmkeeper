/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'farmkeeper.app'],
  },
  // Add headers for CORS and CSP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://accounts.google.com https://www.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://accounts.google.com https://www.googleapis.com http://localhost:5001",
              "frame-src 'self' https://accounts.google.com",
              "font-src 'self' https://fonts.gstatic.com",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);