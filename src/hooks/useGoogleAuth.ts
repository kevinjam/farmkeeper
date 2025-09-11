import { useState, useEffect } from 'react';

// Updated interfaces to match your backend response
interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'worker';
  picture?: string;
  authMethod: 'local' | 'google';
  isNewUser: boolean;
}

interface BackendFarm {
  id: string;
  name: string;
  slug: string;
  plan: 'basic' | 'standard' | 'premium';
}

interface BackendAuthResponse {
  success: boolean;
  token: string;
  user: BackendUser;
  farm?: BackendFarm;
  expiresIn: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: BackendUser | null;
  farm: BackendFarm | null;
  token: string | null;
  isLoading: boolean;
}

/**
 * Custom hook for managing Google authentication state
 * Handles login, logout, and authentication status checking
 */
export function useGoogleAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    farm: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing authentication on component mount
    checkAuthStatus();
  }, []);

  /**
   * Check if user is already authenticated by looking at localStorage
   */
  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const userInfo = localStorage.getItem('user_info');
      const farmInfo = localStorage.getItem('farm_info');

      if (token && userInfo) {
        const user = JSON.parse(userInfo);
        const farm = farmInfo ? JSON.parse(farmInfo) : null;
        
        setAuthState({
          isAuthenticated: true,
          user,
          farm,
          token,
          isLoading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          farm: null,
          token: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        farm: null,
        token: null,
        isLoading: false,
      });
    }
  };

  /**
   * Login function that stores user data and updates state
   * @param user - User object from backend
   * @param token - JWT token from backend
   * @param farm - Farm object from backend (optional)
   */
  const login = (user: BackendUser, token: string, farm?: BackendFarm) => {
    try {
      // Store authentication data in localStorage
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user_info', JSON.stringify(user));
      if (farm) {
        localStorage.setItem('farm_info', JSON.stringify(farm));
      }
      
      // Update React state
      setAuthState({
        isAuthenticated: true,
        user,
        farm: farm || null,
        token,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  /**
   * Logout function that clears all authentication data
   * and disables Google auto-select
   */
  const logout = async () => {
    try {
      // Clear server-side HTTP-only cookie via frontend API
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
        });
      } catch (e) {
        // Non-fatal: still clear client state even if cookie clearing fails
        console.warn('Logout cookie clear request failed:', e);
      }

      // Remove all authentication data from localStorage
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('farm_info');
      
      // Disable Google auto-select to prevent automatic sign-in
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      // Reset React state
      setAuthState({
        isAuthenticated: false,
        user: null,
        farm: null,
        token: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  /**
   * Get authorization headers for API requests
   * @returns Object with Authorization header if token exists
   */
  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /**
   * Check if the current user has a specific role
   * @param role - Role to check
   * @returns Boolean indicating if user has the role
   */
  const hasRole = (role: 'owner' | 'manager' | 'worker') => {
    return authState.user?.role === role;
  };

  /**
   * Check if the current user is an owner
   * @returns Boolean indicating if user is an owner
   */
  const isOwner = () => hasRole('owner');

  /**
   * Check if the current user is a new user (first time signing in)
   * @returns Boolean indicating if user is new
   */
  const isNewUser = () => authState.user?.isNewUser || false;

  return {
    ...authState,
    login,
    logout,
    getAuthHeaders,
    checkAuthStatus,
    hasRole,
    isOwner,
    isNewUser,
  };
}
