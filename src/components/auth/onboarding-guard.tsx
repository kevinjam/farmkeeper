'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

interface BackendAuthState {
  isAuthenticated: boolean;
  isSignedUp: boolean;
  user?: { id: string; name: string; email: string; role: string; image?: string };
  farm?: { id: string; name: string; slug: string };
}

interface OnboardingGuardProps {
  children: ReactNode | ((backendAuth: BackendAuthState | null) => ReactNode);
  requireOnboarding?: boolean;
}

export function OnboardingGuard({ children, requireOnboarding = false }: OnboardingGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [backendAuth, setBackendAuth] = useState<BackendAuthState | null>(null);
  const [backendCheckDone, setBackendCheckDone] = useState(false);

  // When NextAuth is unauthenticated, check backend auth (cookie or token in localStorage after Google OAuth)
  useEffect(() => {
    if (status !== 'unauthenticated') {
      setBackendCheckDone(true);
      return;
    }
    // Process token from URL hash first (backend redirects with #token=JWT); ensures we have it before fetch
    if (typeof window !== 'undefined' && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const tokenFromHash = params.get('token');
      if (tokenFromHash) {
        localStorage.setItem('auth-token', tokenFromHash);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    if (!token) {
      setBackendCheckDone(true);
      return;
    }
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    fetch(`${BACKEND_URL}/api/auth/status`, { credentials: 'include', headers })
      .then((res) => (res.ok ? res.json() : { isAuthenticated: false, isSignedUp: false }))
      .then((data) => {
        if (!cancelled) {
          setBackendAuth(data);
          setBackendCheckDone(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBackendAuth({ isAuthenticated: false, isSignedUp: false });
          setBackendCheckDone(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.requiresOnboarding && !requireOnboarding) {
        router.push('/en/auth/onboarding');
        return;
      }
      if (!session.requiresOnboarding && requireOnboarding) {
        const slug = backendAuth?.farm?.slug;
        router.push(slug ? `/en/${slug}/dashboard` : '/en/auth/login');
        return;
      }
    }
    if (backendCheckDone && backendAuth?.isAuthenticated && backendAuth?.isSignedUp && requireOnboarding) {
      const slug = backendAuth.farm?.slug;
      router.push(slug ? `/en/${slug}/dashboard` : '/en/auth/login');
    }
  }, [session, status, router, requireOnboarding, backendCheckDone, backendAuth]);

  const loading = status === 'loading' || (status === 'unauthenticated' && !backendCheckDone);
  const allowedByNextAuth = status === 'authenticated' && session?.user;
  const allowedByBackend = backendCheckDone && backendAuth?.isAuthenticated && !backendAuth?.isSignedUp;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!allowedByNextAuth && !allowedByBackend) {
    router.push('/en/auth/login');
    return null;
  }

  const content = typeof children === 'function' ? children(backendAuth) : children;
  return <>{content}</>;
}
