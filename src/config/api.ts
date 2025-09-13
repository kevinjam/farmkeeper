// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.BACKEND_BASE_URL || `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api`,
  FRONTEND_URL: process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Environment check
export const isDevelopment = true; // For now, assume development
export const isProduction = false;
