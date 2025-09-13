// Client-side authentication utilities
// This file should only be used in Client Components

// Get token from cookies (client-side)
export const getTokenFromCookies = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  return tokenCookie ? tokenCookie.split('=')[1] : undefined;
};

// Set token in localStorage (client-side backup)
export const setTokenInStorage = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', token);
  }
};

// Get token from localStorage (client-side backup)
export const getTokenFromStorage = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('auth-token') || undefined;
};

// Clear token from localStorage
export const clearTokenFromStorage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
  }
};

// Check if user is authenticated (client-side)
export const isAuthenticated = (): boolean => {
  return !!(getTokenFromCookies() || getTokenFromStorage());
};
