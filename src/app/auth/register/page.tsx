'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sprout, Eye, EyeOff, ArrowRight, CheckCircle, ChevronLeft, Mail, Lock, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationSelector } from '@/components/LocationSelector';
import { SimpleBackendGoogleSignIn } from '@/components/auth/BackendGoogleSignIn';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'trial';
  
  const [formData, setFormData] = useState({
    farmName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: selectedPlan,
  });
  const [location, setLocation] = useState({
    address: '',
    district: '',
    country: 'Uganda',
    coordinates: undefined as { latitude: number; longitude: number } | undefined
  });

  const handleLocationChange = (newLocation: any) => {
    setLocation({
      address: newLocation.address || '',
      district: newLocation.district || '',
      country: newLocation.country || 'Uganda',
      coordinates: newLocation.coordinates
    });
  };
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmName: formData.farmName,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          plan: formData.plan,
          location: location
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Show success message with email confirmation
      setSuccess(true);
      setUserEmail(formData.email);
      
      // Redirect to dashboard after showing success message
      setTimeout(() => {
        const farmSlug = data.farm?.slug || data.farmId;
        router.push(`/${farmSlug}/dashboard`);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20 flex flex-col">
      {/* Mobile hero */}
      <header className="px-4 pt-4 pb-6 sm:p-6">
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

          <Link href="/" className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-heading font-bold text-primary-600">FarmKeeper</span>
          </Link>

          <div className="w-[70px] sm:hidden" />
        </div>

        <div className="mt-6 sm:hidden">
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Create your account</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your farm smarter
            <span aria-hidden="true"> 🌱</span>
          </p>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center sm:px-4 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full sm:max-w-lg"
        >
          {/* Mobile bottom sheet */}
          <div className="sm:hidden mt-auto rounded-t-3xl bg-white/85 dark:bg-gray-900/70 backdrop-blur border-t border-white/60 dark:border-white/10 shadow-[0_-18px_50px_-30px_rgba(0,0,0,0.35)] px-4 pt-6 pb-8">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="text-center space-y-5"
              >
                <div className="flex justify-center">
                  <CheckCircle className="h-14 w-14 text-green-500" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome to FarmKeeper</h2>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 text-left">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      <strong>Registration successful.</strong> A welcome email was sent to:
                    </p>
                    <p className="mt-3 font-mono text-sm bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border">
                      {userEmail}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                    <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                      Redirecting to your dashboard in 3 seconds…
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">Create account</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Get started with your farm profile
                  </p>
                </div>

                <SimpleBackendGoogleSignIn
                  alwaysShowSignInCTA
                  className="w-full h-12 text-base bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl font-medium shadow-sm active:scale-[0.99] transition"
                  size="lg"
                  variant="outline"
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200/80 dark:border-gray-700/80" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white/85 dark:bg-gray-900/70 px-3 text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      OR
                    </span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="farmName" className="text-sm">Farm Name</Label>
                    <div className="relative group">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <Input
                        id="farmName"
                        name="farmName"
                        type="text"
                        required
                        placeholder="Your farm name"
                        value={formData.farmName}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="h-12 rounded-xl pl-11 [font-size:16px] transition focus-visible:ring-primary-500/60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">Your Name</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="h-12 rounded-xl pl-11 [font-size:16px] transition focus-visible:ring-primary-500/60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="h-12 rounded-xl pl-11 [font-size:16px] transition focus-visible:ring-primary-500/60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="h-12 rounded-xl pl-11 pr-12 [font-size:16px] transition focus-visible:ring-primary-500/60"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-transparent active:scale-[0.98] transition"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="h-12 rounded-xl pl-11 pr-12 [font-size:16px] transition focus-visible:ring-primary-500/60"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-transparent active:scale-[0.98] transition"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plan" className="text-sm">Subscription Plan</Label>
                    <select
                      id="plan"
                      name="plan"
                      required
                      className="flex h-12 w-full rounded-xl border border-gray-300/90 bg-white px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 transition [font-size:16px]"
                      value={formData.plan}
                      onChange={handleChange}
                      disabled={isLoading}
                    >
                      <option value="trial">Free Trial - 30 days with Pro features</option>
                      <option value="basic">Basic Plan - UGX 1,500/month</option>
                      <option value="pro">Pro Plan - UGX 4,000/month</option>
                    </select>
                  </div>

                  <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/60 dark:bg-gray-900/40 p-3">
                    <LocationSelector
                      initialLocation={location}
                      onLocationChange={handleLocationChange}
                      required={true}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base font-semibold bg-primary-600 hover:bg-primary-700 text-white active:scale-[0.99] transition disabled:opacity-60"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>

                <p className="pt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link href="/en/auth/login" className="font-semibold text-primary-700 hover:underline dark:text-primary-300">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Desktop layout unchanged */}
          <div className="hidden sm:block">
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
                  Join FarmKeeper
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                  Create your account and start optimizing your farm operations
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-6"
                  >
                    <div className="flex justify-center">
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome to FarmKeeper! 🌱
                      </h2>

                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                        <p className="text-green-800 dark:text-green-200 mb-4">
                          <strong>Registration successful!</strong> A welcome email has been sent to:
                        </p>
                        <p className="font-mono text-sm bg-white dark:bg-gray-800 px-3 py-2 rounded border">
                          {userEmail}
                        </p>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <p>📧 Check your inbox for:</p>
                        <ul className="text-left space-y-1 ml-4">
                          <li>• Welcome message and getting started guide</li>
                          <li>• Direct link to your farm dashboard</li>
                          <li>• Tips for using FarmKeeper effectively</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                          <strong>Redirecting to your dashboard in 3 seconds...</strong>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm Name</Label>
                        <Input
                          id="farmName"
                          name="farmName"
                          type="text"
                          required
                          placeholder="Your farm name"
                          value={formData.farmName}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
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

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plan">Subscription Plan</Label>
                      <select
                        id="plan"
                        name="plan"
                        required
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        value={formData.plan}
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        <option value="trial">Free Trial - 30 days with Pro features</option>
                        <option value="basic">Basic Plan - UGX 1,500/month</option>
                        <option value="pro">Pro Plan - UGX 4,000/month</option>
                      </select>
                    </div>

                    <LocationSelector
                      initialLocation={location}
                      onLocationChange={handleLocationChange}
                      required={true}
                    />

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create account'}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>

                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign In */}
                <SimpleBackendGoogleSignIn 
                  alwaysShowSignInCTA
                  className="w-full" 
                  size="lg" 
                  variant="outline"
                />

                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link href="/en/auth/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}