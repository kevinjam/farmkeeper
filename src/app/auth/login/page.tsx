'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sprout, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('');
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Pro fix: useEffect for redirect after login
  useEffect(() => {
    if (loginSuccess && dashboardUrl) {
      window.location.href = dashboardUrl;
    }
  }, [loginSuccess, dashboardUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setLoginSuccess(false);

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
      
      // Setup redirect URL and update UI
      const targetUrl = `/${data.farmSlug}/dashboard`;
      setDashboardUrl(targetUrl);
      setLoginSuccess(true);
      setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-2">
          <Sprout className="h-8 w-8 text-primary-600" />
          <span className="text-2xl font-heading font-bold text-primary-600">FarmKeeper</span>
        </Link>
      </div>

      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
                Welcome back
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                Sign in to access your farm management dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {loginSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                      Login Successful!
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      You should be redirected to your dashboard shortly.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      If you're not redirected automatically, click below:
                    </p>
                    <Button onClick={navigateToDashboard} className="w-full" size="lg">
                      Continue to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Email/Password Form */}
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign in'}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Sign-In */}
                  <GoogleSignInButton 
                    className="w-full" 
                    variant="outline" 
                    size="lg"
                    showUserMenu={false}
                  />
                </>
              )}

              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}