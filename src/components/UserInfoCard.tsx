'use client';

import { useGoogleAuth } from '../hooks/useGoogleAuth';

/**
 * UserInfoCard Component
 * Displays user information after successful authentication
 * Shows user profile picture, name, email, role, and farm details
 */
export default function UserInfoCard() {
  const { user, farm, isAuthenticated, logout } = useGoogleAuth();

  // Don't render if user is not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Welcome!</h3>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Sign Out
        </button>
      </div>

      {/* User Profile Section */}
      <div className="flex items-center space-x-4 mb-6">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {user.picture ? (
            <img
              src={user.picture}
              alt={`${user.name}'s profile`}
              className="w-16 h-16 rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-500">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-medium text-gray-900 truncate">
            {user.name}
          </h4>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
          <div className="flex items-center mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {user.role}
            </span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {user.authMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Farm Information */}
      {farm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Farm Details</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Farm Name:</span>
              <span className="text-sm font-medium text-gray-900">{farm.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Plan:</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{farm.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Farm ID:</span>
              <span className="text-sm text-gray-500 font-mono">{farm.id.slice(-8)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Successfully authenticated
            </p>
            <p className="text-sm text-green-700">
              You are now signed in to your account
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 space-y-2">
        {farm ? (
          <button
            onClick={() => window.location.href = `/${farm.slug}/dashboard`}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        ) : (
          <button
            onClick={() => window.location.href = '/setup-profile'}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Complete Farm Setup
          </button>
        )}
      </div>
    </div>
  );
}
