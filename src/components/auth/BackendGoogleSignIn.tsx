'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User, Loader2, ExternalLink } from 'lucide-react';
import {
  isStandaloneOrLikelyRestrictedOAuthContext,
  openUrlPreferringSystemBrowser,
} from '@/lib/googleOAuthDisplay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

interface BackendGoogleSignInProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showUserMenu?: boolean;
  /**
   * On auth pages (login/register), always show the Google CTA instead of "Hi, … / Sign out",
   * even if a stale token exists in localStorage. Session redirect is handled by the page.
   */
  alwaysShowSignInCTA?: boolean;
}

export function BackendGoogleSignIn({ 
  className = '', 
  variant = 'default', 
  size = 'default',
  showUserMenu = true,
  alwaysShowSignInCTA = false,
}: BackendGoogleSignInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userDisplay, setUserDisplay] = useState<{ name: string; email: string; image?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isRestrictedOAuthContext, setIsRestrictedOAuthContext] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setIsRestrictedOAuthContext(isStandaloneOrLikelyRestrictedOAuthContext());
  }, []);

  // When logged in (token in localStorage), fetch actual user so we don't show generic "User"
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('auth-token') || localStorage.getItem('token');
    if (!token) {
      setUserDisplay(null);
      return;
    }
    const headers: HeadersInit = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    fetch(`${BACKEND_URL}/api/auth/status`, { credentials: 'include', headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.isAuthenticated && data?.user) {
          const name = data.user.name || data.user.email || 'Account';
          setUserDisplay({ name, email: data.user.email || '', image: data.user.image });
          try {
            localStorage.setItem('userName', name);
            if (data.user.email) localStorage.setItem('userEmail', data.user.email);
            if (data.user.image) localStorage.setItem('userImage', data.user.image);
          } catch (_) {}
        } else {
          setUserDisplay(null);
        }
      })
      .catch(() => setUserDisplay(null));
  }, []);

  const handleGoogleSignIn = async () => {
    if (typeof window !== 'undefined' && isStandaloneOrLikelyRestrictedOAuthContext()) {
      const url = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      const { usedAndroidIntent, openedAuxiliary } = openUrlPreferringSystemBrowser(url);
      if (!usedAndroidIntent && !openedAuxiliary) {
        try {
          await navigator.clipboard?.writeText(url);
        } catch (_) {}
        alert(
          'Could not open Safari or Chrome from here. Copy this link, paste it into your browser, then use Sign in with Google again:\n\n' +
            url
        );
      }
      return;
    }

    setIsLoading(true);
    try {
      // Must hit the API from the browser with credentials so PKCE cookies
      // (g_oauth_cv, g_oauth_state) are set on the API origin. The Next.js proxy
      // calls the backend server-to-server; Set-Cookie would never reach the browser,
      // and Google redirect back to the API would miss the code_verifier cookie.
      const response = await fetch(`${BACKEND_URL}/api/auth/google/auth-url`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg =
          (typeof data?.message === 'string' && data.message) ||
          `Could not start Google sign-in (HTTP ${response.status}).`;
        throw new Error(msg);
      }

      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error(
          typeof data?.message === 'string' ? data.message : 'Invalid response from server'
        );
      }
    } catch (error) {
      console.error('Error initiating Google sign-in:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to initiate Google sign-in. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear any stored tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('token');
        localStorage.removeItem('farmSlug');
        localStorage.removeItem('farmName');
        
        // Clear all cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
      }

      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check if user is logged in by checking for auth token
  const hasToken =
    typeof window !== 'undefined' &&
    !!(localStorage.getItem('auth-token') || localStorage.getItem('token'));

  const isLoggedIn = hasToken && !alwaysShowSignInCTA;

  if (isLoggedIn && showUserMenu) {
    const name = userDisplay?.name || (typeof window !== 'undefined' ? localStorage.getItem('userName') : null) || 'Account';
    const email = userDisplay?.email ?? (typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null) ?? '';
    const image = userDisplay?.image ?? (typeof window !== 'undefined' ? localStorage.getItem('userImage') : null) ?? '';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isLoggedIn) {
    const name = userDisplay?.name || (typeof window !== 'undefined' ? localStorage.getItem('userName') : null) || 'Account';

    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Hi, {name}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </Button>
      </div>
    );
  }

  const isPwaOAuthMode = mounted && isRestrictedOAuthContext;

  return (
    <div className="w-full space-y-3">
      {isPwaOAuthMode && (
        <div
          className="rounded-xl border border-amber-200/90 bg-amber-50 px-3 py-2.5 text-left text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100 md:text-sm"
          role="note"
        >
          <p className="font-semibold">Sign-in with Google needs Safari or Chrome</p>
          <p className="mt-1 leading-snug text-amber-900/90 dark:text-amber-100/90">
            This view (installed shortcut, WebView, or an in-app browser) is blocked by Google. Tap below to
            open this page in your real browser, then tap <span className="font-medium">Sign in with Google</span>{' '}
            again.
          </p>
        </div>
      )}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className={`flex w-full items-center justify-center gap-2 ${className}`}
        variant={variant}
        size={size}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            <span>Continuing with Google...</span>
          </>
        ) : isPwaOAuthMode ? (
          <>
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span>Open in browser for Google sign-in</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <LogIn className="h-4 w-4 shrink-0" />
            <span>Sign in with Google</span>
          </>
        )}
      </Button>
    </div>
  );
}

// Simple version without user menu
export function SimpleBackendGoogleSignIn({ 
  className = '', 
  variant = 'default', 
  size = 'default',
  alwaysShowSignInCTA = false,
}: Omit<BackendGoogleSignInProps, 'showUserMenu'>) {
  return (
    <BackendGoogleSignIn 
      className={className} 
      variant={variant} 
      size={size} 
      showUserMenu={false}
      alwaysShowSignInCTA={alwaysShowSignInCTA}
    />
  );
}
