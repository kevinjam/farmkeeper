'use client';

import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'button' | 'link' | 'icon';
}

export default function LogoutButton({ 
  className = '', 
  children = 'Sign Out',
  variant = 'button' 
}: LogoutButtonProps) {
  const { logout, isAuthenticated } = useGoogleAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (variant === 'link') {
    return (
      <button
        onClick={handleLogout}
        className={`text-sm text-gray-600 hover:text-gray-800 underline ${className}`}
      >
        {children}
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        className={`p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors ${className}`}
        title="Sign Out"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
