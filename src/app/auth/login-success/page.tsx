'use client';

import { useEffect, useState } from 'react';

export default function LoginSuccess() {
  const [redirectCount, setRedirectCount] = useState(0);

  useEffect(() => {
    // Direct auth status check without relying on URL parameters
    const checkAuthAndRedirect = async () => {
      try {
        console.log(`[LoginSuccess] Checking auth status to find correct farm dashboard`);
        
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001'}/api/auth/status?t=${timestamp}`, {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        const data = await response.json();
        console.log('[LoginSuccess] Auth status response:', data);
        
        if (data.isAuthenticated && data.farm && data.farm.slug) {
          // We have a valid farm slug, redirect to dashboard
          const dashboardUrl = `/${data.farm.slug}/dashboard`;
          console.log(`[LoginSuccess] Redirecting to dashboard: ${dashboardUrl}`);
          
          // Use replace for cleaner navigation history
          window.location.replace(dashboardUrl);
        } else if (data.isAuthenticated && !data.isSignedUp) {
          // User is authenticated but hasn't completed registration
          console.log('[LoginSuccess] User needs to complete registration');
          window.location.replace('/auth/register');
        } else {
          // Something's wrong with authentication
          console.log('[LoginSuccess] Authentication issue, redirecting to login');
          setRedirectCount(prev => prev + 1);
          
          if (redirectCount > 2) {
            // Prevent redirect loop
            console.error('[LoginSuccess] Too many redirects, staying on this page');
          } else {
            window.location.replace('/auth/login');
          }
        }
      } catch (err) {
        console.error('[LoginSuccess] Error during auth check:', err);
      }
    };
    
    // Give cookies time to be processed
    const timer = setTimeout(() => {
      checkAuthAndRedirect();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [redirectCount]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Login Successful</h1>
        <div className="w-16 h-16 border-t-4 border-b-4 border-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
