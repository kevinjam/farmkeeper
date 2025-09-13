// Cookie utility functions for authentication

export const setAuthCookie = (token: string, maxAge: number = 7 * 24 * 60 * 60) => {
  if (typeof document === 'undefined') return;
  
  // Determine if we're in production (HTTPS) or development (HTTP)
  const isProduction = window.location.protocol === 'https:';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Set secure flag only in production
  const secure = isProduction && !isLocalhost;
  
  // Build cookie string
  let cookieString = `token=${token}; path=/; max-age=${maxAge}; samesite=strict`;
  
  if (secure) {
    cookieString += '; secure';
  }
  
  console.log('Setting auth cookie:', { secure, isProduction, isLocalhost });
  document.cookie = cookieString;
};

export const getAuthCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  
  return null;
};

export const removeAuthCookie = () => {
  if (typeof document === 'undefined') return;
  
  const isProduction = window.location.protocol === 'https:';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const secure = isProduction && !isLocalhost;
  
  let cookieString = 'token=; path=/; max-age=0; samesite=strict';
  
  if (secure) {
    cookieString += '; secure';
  }
  
  document.cookie = cookieString;
};
