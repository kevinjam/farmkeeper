'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const destination = searchParams.get('to');
    
    if (!destination) {
      setError('No redirect destination specified');
      return;
    }
    
    console.log('Redirecting to:', destination);
    
    // Use both methods for maximum compatibility
    window.location.href = destination;
    
    // Fallback
    setTimeout(() => {
      router.push(destination);
    }, 100);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-6">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <div className="w-16 h-16 border-t-4 border-b-4 border-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Redirecting...</h2>
            <p className="text-gray-600 dark:text-gray-400">You'll be redirected to your dashboard momentarily.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function Redirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6">
          <div className="w-16 h-16 border-t-4 border-b-4 border-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}
