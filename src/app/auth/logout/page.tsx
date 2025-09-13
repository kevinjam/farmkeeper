'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Logout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function performLogout() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001'}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Logout failed');
        }

        console.log('Logout successful');
        
        // Clear any client-side storage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('farmRedirect');
          localStorage.removeItem('user');
        }
        
        // Redirect to login page after successful logout
        setTimeout(() => {
          router.push('/auth/login');
        }, 1000);
      } catch (error) {
        console.error('Logout error:', error);
        setError(error instanceof Error ? error.message : 'Something went wrong during logout');
      } finally {
        setIsLoading(false);
      }
    }

    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {isLoading ? (
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Signing Out</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Logout Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => router.push('/auth/login')}
              className="btn btn-primary w-full"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Signed Out Successfully</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">You have been logged out of your account.</p>
            <button 
              onClick={() => router.push('/auth/login')}
              className="btn btn-primary w-full"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
