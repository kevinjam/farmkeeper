'use client';

import { useGoogleAuth } from '../hooks/useGoogleAuth';
import GoogleSignIn from './GoogleSignIn';
import LogoutButton from './LogoutButton';

export default function GoogleAuthDemo() {
  const { isAuthenticated, user, isLoading } = useGoogleAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading authentication status...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome, {user?.name}! 👋
        </h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <img 
              src={user?.picture} 
              alt="Profile" 
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <p className="text-xs text-gray-500">ID: {user?.id}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <LogoutButton variant="button" className="w-full">
            Sign Out
          </LogoutButton>
          
          <div className="text-center">
            <LogoutButton variant="link">
              Or sign out here
            </LogoutButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
        Sign In to FarmKeeper
      </h2>
      
      <p className="text-gray-600 mb-6 text-center">
        Choose your preferred sign-in method below
      </p>

      <GoogleSignIn 
        onSuccess={(user) => {
          console.log('Authentication successful:', user);
        }}
        onError={(error) => {
          console.error('Authentication failed:', error);
        }}
      />

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
