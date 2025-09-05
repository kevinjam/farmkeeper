'use client';

import { useState } from 'react';
import GoogleSignInSimple from '../../components/GoogleSignInSimple';
import UserInfoCard from '../../components/UserInfoCard';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

/**
 * Google Auth Demo Page
 * Demonstrates the complete Google Sign-In functionality
 * Shows different configurations and user states
 */
export default function GoogleAuthDemoPage() {
  const { isAuthenticated, user, farm } = useGoogleAuth();
  const [showFarmSetup, setShowFarmSetup] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [plan, setPlan] = useState<'basic' | 'standard' | 'premium'>('basic');

  const handleSuccess = (user: any, farm?: any) => {
    console.log('Google Sign-In successful:', { user, farm });
  };

  const handleError = (error: string) => {
    console.error('Google Sign-In error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Google Authentication Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This page demonstrates the complete Google Sign-In integration with your backend.
            Test different configurations and see how users are created and managed.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Google Sign-In */}
          <div className="space-y-6">
            {/* Basic Google Sign-In */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Basic Google Sign-In
              </h2>
              <p className="text-gray-600 mb-4">
                Standard sign-in without farm setup. Users will be redirected to complete setup later.
              </p>
              <GoogleSignInSimple
                onSuccess={handleSuccess}
                onError={handleError}
                enableFarmSetup={false}
              />
            </div>

            {/* Google Sign-In with Farm Setup */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Google Sign-In with Farm Setup
              </h2>
              <p className="text-gray-600 mb-4">
                Sign-in with immediate farm setup. Perfect for new users who want to get started quickly.
              </p>
              
              {/* Farm Setup Form */}
              <div className="mb-4 space-y-3">
                <div>
                  <label htmlFor="demo-farm-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Name
                  </label>
                  <input
                    type="text"
                    id="demo-farm-name"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter farm name"
                  />
                </div>
                <div>
                  <label htmlFor="demo-plan" className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    id="demo-plan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as 'basic' | 'standard' | 'premium')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>

              <GoogleSignInSimple
                onSuccess={handleSuccess}
                onError={handleError}
                enableFarmSetup={true}
                defaultFarmName={farmName}
                defaultPlan={plan}
              />
            </div>

            {/* Configuration Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Configuration</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Backend URL: http://localhost:5001/api/auth/google</p>
                <p>• Client ID: {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID ? '✅ Configured' : '❌ Missing'}</p>
                <p>• Environment: {process.env.NODE_ENV}</p>
              </div>
            </div>
          </div>

          {/* Right Column - User Info & Status */}
          <div className="space-y-6">
            {/* Authentication Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Authentication Status
              </h2>
              
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-800 font-medium">Authenticated</span>
                    </div>
                  </div>
                  
                  {/* User Info Card */}
                  <UserInfoCard />
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">Not authenticated</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Sign in with Google to see your user information and farm details.
                  </p>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                How It Works
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">1</span>
                  <p>User clicks Google Sign-In button</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">2</span>
                  <p>Google returns ID token after successful authentication</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">3</span>
                  <p>Frontend sends token to your backend at /api/auth/google</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">4</span>
                  <p>Backend verifies token and creates/updates user in database</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">5</span>
                  <p>Backend returns JWT token and user profile</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">6</span>
                  <p>Frontend stores JWT and redirects user appropriately</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Features
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Secure Google ID token verification
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Automatic user creation in database
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  JWT session management
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Optional farm setup during sign-in
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Account linking for existing users
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Comprehensive error handling
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
