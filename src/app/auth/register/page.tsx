'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleSignInNextScript from '../../../components/GoogleSignInNextScript';

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'basic';
  
  const [formData, setFormData] = useState({
    farmName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: selectedPlan,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmName: formData.farmName,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          plan: formData.plan
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // On successful registration, redirect to dashboard using farm slug
      const farmSlug = data.farm?.slug || data.farmId;
      router.push(`/${farmSlug}/dashboard`);
    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (user: any) => {
    console.log('Google Sign-In successful:', user);
    // For registration page, we want to redirect new users to setup
    // The GoogleSignIn component will handle this automatically
  };

  const handleGoogleError = (error: string) => {
    console.error('Google Sign-In error:', error);
    setError(error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Join <span className="text-primary-600">FarmKeeper</span>
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Create your farm management account and start optimizing your farm operations
          </p>
        </div>
        
        {/* Google Sign-In Section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">Quick start with</span>
            </div>
          </div>
          
          <GoogleSignInNextScript 
            key="register-google-signin"
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            enableFarmSetup
          />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">Or create account manually</span>
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="farmName" className="label">Farm Name</label>
              <input
                id="farmName"
                name="farmName"
                type="text"
                required
                className="input w-full"
                placeholder="Your farm name"
                value={formData.farmName}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="name" className="label">Your Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input w-full"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input w-full"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input w-full"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input w-full"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="plan" className="label">Subscription Plan</label>
              <select
                id="plan"
                name="plan"
                required
                className="input w-full"
                value={formData.plan}
                onChange={handleChange}
              >
                <option value="basic">Basic Plan - UGX 50,000/month</option>
                <option value="standard">Standard Plan - UGX 100,000/month</option>
                <option value="premium">Premium Plan - UGX 200,000/month</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
