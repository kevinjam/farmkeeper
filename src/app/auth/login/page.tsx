'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sprout, Mail, Lock, ArrowRight, CheckCircle, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { setAuthCookie } from '@/lib/cookies';
import { SimpleBackendGoogleSignIn } from '@/components/auth/BackendGoogleSignIn';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // If user already has a token (e.g. just came from Google OAuth), redirect to onboarding or dashboard
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') || localStorage.getItem('token') : null;
    if (!token) {
      setCheckingAuth(false);
      return;
    }
    const headers: HeadersInit = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    fetch(`${BACKEND_URL}/api/auth/status`, { credentials: 'include', headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.isAuthenticated) {
          setCheckingAuth(false);
          return;
        }
        if (!data.isSignedUp) {
          router.replace('/en/auth/onboarding');
          return;
        }
        if (data.farm?.slug) {
          router.replace(`/en/${data.farm.slug}/dashboard`);
          return;
        }
        setCheckingAuth(false);
      })
      .catch(() => setCheckingAuth(false));
  }, [router]);

  // Pro fix: useEffect for redirect after login
  useEffect(() => {
    if (loginSuccess && dashboardUrl) {
      router.push(dashboardUrl);
    }
  }, [loginSuccess, dashboardUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setLoginSuccess(false);

    // Clear any existing tokens before login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('farmSlug');
      localStorage.removeItem('farmName');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('token');
      
      // Clear all cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    }

    try {
      console.log('Attempting login with email:', email);
      
      // Use the centralized API client
      const response = await apiClient.login({ email, password });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const data = response.data;

      // Log success details
      console.log('Login successful!');
      console.log('Farm Slug:', data.farmSlug);
      console.log('Farm name:', data.farmName || 'Unknown Farm');
      
      // Store farm info and token for client-side use
      if (typeof window !== 'undefined') {
        localStorage.setItem('farmSlug', data.farmSlug);
        localStorage.setItem('farmName', data.farmName || '');
        
        // Store token if provided
        if (data.token) {
          localStorage.setItem('auth-token', data.token);
        }
      }
      
      // Set authentication cookie for server-side middleware
      if (data.token) {
        setAuthCookie(data.token);
      }
      
      const successUrl = `/auth/login-success?farmSlug=${encodeURIComponent(data.farmSlug)}&farmName=${encodeURIComponent(data.farmName || '')}`;
      setDashboardUrl(successUrl);
      setLoginSuccess(true);
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
      router.push(dashboardUrl);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20 flex flex-col">
      {/* Mobile hero */}
      <header className="px-4 pt-4 pb-6 sm:px-6 sm:pb-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="sm:hidden inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-white/10 active:scale-[0.98] transition"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary-600" />
            <span className="text-lg font-bold text-primary-600 dark:text-white">FarmKeeper</span>
          </Link>

          <div className="w-[70px] sm:hidden" />

          <Link
            href="/en/auth/login"
            className="hidden sm:inline text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Contact Support
          </Link>
        </div>

        <div className="mt-6 sm:hidden">
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your farm smarter
            <span aria-hidden="true"> 🌱</span>
          </p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center sm:px-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full sm:max-w-[320px]"
        >
          {/* Mobile bottom sheet container */}
          <div className="sm:hidden mt-auto rounded-t-3xl bg-white/85 dark:bg-gray-900/70 backdrop-blur border-t border-white/60 dark:border-white/10 shadow-[0_-18px_50px_-30px_rgba(0,0,0,0.35)] px-4 pt-6 pb-8">
            <p className="text-xl font-bold text-gray-900 dark:text-white">Sign in</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Enter your details to continue
            </p>

            {loginSuccess ? (
              <div className="mt-6 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                <CheckCircle className="h-10 w-10 text-primary-600 mx-auto mb-2" />
                <p className="text-gray-900 dark:text-white font-medium text-sm">Login successful</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Redirecting...</p>
                <Button
                  onClick={navigateToDashboard}
                  className="mt-4 w-full h-12 rounded-xl text-base bg-primary-600 hover:bg-primary-700 text-white active:scale-[0.99] transition"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <SimpleBackendGoogleSignIn
                    alwaysShowSignInCTA
                    className="w-full h-12 text-base bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl font-medium shadow-sm active:scale-[0.99] transition"
                    size="default"
                    variant="outline"
                  />
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200/80 dark:border-gray-700/80" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white/85 dark:bg-gray-900/70 px-3 text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      OR
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-3.5 py-3">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="w-full h-12 pl-11 pr-3 rounded-xl border border-gray-300/90 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500 disabled:opacity-50 transition [font-size:16px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <Link
                        href="/en/auth/forgot-password"
                        className="text-sm text-primary-700 dark:text-primary-300 hover:underline"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full h-12 pl-11 pr-3 rounded-xl border border-gray-300/90 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500 disabled:opacity-50 transition [font-size:16px]"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl text-base bg-primary-600 hover:bg-primary-700 text-white font-semibold active:scale-[0.99] transition disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/en/auth/register"
                    className="text-primary-700 dark:text-primary-300 font-semibold hover:underline"
                  >
                    Create account
                  </Link>
                </p>
              </>
            )}
          </div>

          {/* Desktop layout stays as-is */}
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400 text-xs">
              Enter your credentials to access your farm intelligence
            </p>

            {loginSuccess ? (
              <div className="mt-5 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                <CheckCircle className="h-10 w-10 text-primary-600 mx-auto mb-2" />
                <p className="text-gray-900 dark:text-white font-medium text-sm">Login successful</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Redirecting...</p>
                <Button
                  onClick={navigateToDashboard}
                  className="mt-3 w-full h-9 text-sm bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Continue to Dashboard
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-5">
                  <SimpleBackendGoogleSignIn
                    alwaysShowSignInCTA
                    className="w-full h-10 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md font-medium shadow-sm"
                    size="default"
                    variant="outline"
                  />
                </div>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-gray-900 px-2 text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Or email login
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="w-full h-9 pl-8 pr-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <Link
                        href="/en/auth/forgot-password"
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full h-9 pl-8 pr-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-9 rounded-md text-sm bg-primary-600 hover:bg-primary-700 text-white font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In to Dashboard
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{' '}
                  <Link href="/en/auth/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                    Create an account
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </main>

      <footer className="hidden sm:flex px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-800 flex-col sm:flex-row items-center justify-between gap-3">
        <nav className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <Link href="/en/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy</Link>
          <Link href="/en/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms</Link>
          <Link href="/en/security" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Security</Link>
        </nav>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} FarmKeeper
        </p>
      </footer>
    </div>
  );
}