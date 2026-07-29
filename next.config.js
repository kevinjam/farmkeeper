/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
});

const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'farmkeeper.app'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve('process/browser'),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util'),
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Paddle.js CDN + Google OAuth
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.paddle.com https://sandbox-cdn.paddle.com https://accounts.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://cdn.paddle.com https://sandbox-cdn.paddle.com https://fonts.googleapis.com https://accounts.google.com https://www.gstatic.com",
              "img-src 'self' data: https: blob:",
              // API + Paddle checkout APIs (sandbox + live)
              "connect-src 'self' http://localhost:5001 https://localhost:5001 https://api.farmkeeper.co https://accounts.google.com https://www.googleapis.com https://*.paddle.com wss://*.paddle.com",
              // Overlay checkout iframes
              "frame-src 'self' https://buy.paddle.com https://sandbox-buy.paddle.com https://*.paddle.com https://accounts.google.com",
              "font-src 'self' data: https://fonts.gstatic.com https://cdn.paddle.com https://sandbox-cdn.paddle.com",
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

module.exports = withNextIntl(withPWA(nextConfig));