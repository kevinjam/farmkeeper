'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const state = searchParams.get('state');

        if (error) {
          setStatus('error');
          const detail = errorDescription
            ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            : 'Google authentication was cancelled or failed.';
          setMessage(detail);
          setTimeout(() => {
            router.push('/en/auth/login');
          }, 4000);
          return;
        }

        if (!code) {
          setStatus('error');
          const baseUrl =
            typeof window !== 'undefined' ? window.location.origin : '';
          const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
          setMessage(
            `No authorization code in the URL. In Google Cloud Console → OAuth client → Authorized redirect URIs, add: ${baseUrl}/auth/google/callback (and for API-only dev: ${backendUrl}/api/auth/google/callback)`
          );
          setTimeout(() => {
            router.push('/en/auth/login');
          }, 5000);
          return;
        }

        // We have an authorization code - hand off to the backend
        setStatus('loading');
        setMessage('Completing authentication...');

        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

        // Let the browser follow redirects from the backend callback handler
        const redirectUrl = `${backendUrl}/api/auth/google/callback?code=${encodeURIComponent(
          code
        )}${state ? `&state=${encodeURIComponent(state)}` : ''}`;

        window.location.href = redirectUrl;

      } catch (err) {
        console.error('Error handling Google callback:', err);
        setStatus('error');
        setMessage('An error occurred during authentication.');
        setTimeout(() => {
          router.push('/en/auth/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4"
      >
        <div className="text-center space-y-6">
          {status === 'loading' && (
            <>
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Authenticating...
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Success!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Authentication Failed
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </>
          )}

          <div className="pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You will be redirected automatically...
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Loading...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Preparing authentication...
              </p>
            </div>
          </div>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
