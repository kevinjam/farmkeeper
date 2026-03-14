'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * After Google OAuth the backend redirects with #token=JWT (different origin so cookie isn't sent).
 * This component reads the token from the URL hash, stores it in localStorage for the API client,
 * and removes the hash so the URL is clean.
 */
export function AuthTokenFromHash() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.slice(1)); // remove #
    const token = params.get('token');
    if (token) {
      localStorage.setItem('auth-token', token);
      // Clear hash after a short delay so OnboardingGuard (useEffect) can read it first
      const clearHash = () => {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
      };
      const t = setTimeout(clearHash, 150);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  return null;
}
