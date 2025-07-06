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
  // Middleware needs Node.js runtime
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
};

module.exports = withPWA(nextConfig);