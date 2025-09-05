'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

export default function SetupProfile() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useGoogleAuth();
  const [formData, setFormData] = useState({
    farmName: '',
    plan: 'basic',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Here you would typically send the farm setup data to your backend
      // For now, we'll simulate a successful setup
      console.log('Setting up farm:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard after successful setup
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Welcome, {user?.name}! Let's set up your farm management account.
          </p>
        </div>

        {/* User Info Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center space-x-3">
            <img 
              src={user?.picture} 
              alt="Profile" 
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-medium text-blue-900">{user?.name}</p>
              <p className="text-sm text-blue-700">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Farm Name
              </label>
              <input
                id="farmName"
                name="farmName"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Your farm name"
                value={formData.farmName}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subscription Plan
              </label>
              <select
                id="plan"
                name="plan"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You can change these settings later in your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
