'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setLoginSuccess(false);

    try {
      console.log('Attempting login with email:', email);
      
      // Step 1: Direct login API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
        cache: 'no-store'
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.log('Login failed:', data.message);
        throw new Error(data.message || 'Login failed');
      }

      // Step 2: Log success details
      console.log('Login successful!');
      console.log('Farm ID:', data.farmId);
      console.log('Farm name:', data.farmName || 'Unknown Farm');
      
      // Step 3: Store farm info for potential backup use
      if (typeof window !== 'undefined') {
        localStorage.setItem('farmId', data.farmId);
        localStorage.setItem('farmName', data.farmName || '');
      }
      
      // Step 4: Setup redirect URL and update UI
      const targetUrl = `/${data.farmId}/dashboard`;
      setDashboardUrl(targetUrl);
      setLoginSuccess(true);
      setIsLoading(false);
      
      // Step 5: Try redirect after short delay
      setTimeout(() => {
        try {
          console.log('Now redirecting to dashboard:', targetUrl);
          window.location.href = targetUrl;
        } catch (err) {
          console.error('Redirect failed:', err);
        }
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
      setIsLoading(false);
    }
  };
  
  const navigateToDashboard = () => {
    if (dashboardUrl) {
      console.log('Manual navigation to:', dashboardUrl);
      window.location.href = dashboardUrl;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome back to <span className="text-primary-600">FarmKeeper</span>
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to access your farm management dashboard
          </p>
        </div>
        
        {loginSuccess ? (
          <div className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center justify-center">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="ml-3 text-green-700 font-medium">Login successful!</p>
              </div>
              <p className="mt-2 text-sm text-gray-600">You should be redirected to your dashboard shortly.</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-3">If you're not redirected automatically, click the button below:</p>
              <button
                type="button"
                onClick={navigateToDashboard}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}