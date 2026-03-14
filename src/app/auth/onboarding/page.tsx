'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { GoogleOnboarding } from '@/components/auth/google-onboarding';
import { OnboardingGuard } from '@/components/auth/onboarding-guard';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function OnboardingPage() {
  const { data: session } = useSession();
  const [backendUser, setBackendUser] = useState<{
    name: string;
    email: string;
    image?: string;
  } | null>(null);

  // When no NextAuth session, fetch user from backend (e.g. after Google OAuth redirect with token in hash)
  useEffect(() => {
    if (session?.user) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    if (!token) return;
    const headers: HeadersInit = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    fetch(`${BACKEND_URL}/api/auth/status`, { credentials: 'include', headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.isAuthenticated && data?.user && !data?.isSignedUp) {
          setBackendUser({
            name: data.user.name || '',
            email: data.user.email || '',
            image: data.user.image
          });
        }
      })
      .catch(() => {});
  }, [session?.user]);

  return (
    <OnboardingGuard requireOnboarding={true}>
      {(backendAuth) => {
        // Prefer backend auth user (from guard) so form shows immediately after Google redirect
        const fromBackend = backendAuth?.user && !backendAuth?.isSignedUp
          ? {
              userEmail: backendAuth.user.email,
              userName: backendAuth.user.name,
              userImage: backendAuth.user.image
            }
          : null;
        const user = session?.user
          ? {
              userEmail: session.user.email || '',
              userName: session.user.name || '',
              userImage: session.user.image || undefined
            }
          : fromBackend ?? (backendUser
            ? {
                userEmail: backendUser.email,
                userName: backendUser.name,
                userImage: backendUser.image
              }
            : null);

        if (!user) {
          const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth-token');
          if (hasToken) {
            return (
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
                  <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
                </div>
              </div>
            );
          }
          return null;
        }

        return (
          <GoogleOnboarding
            userEmail={user.userEmail}
            userName={user.userName}
            userImage={user.userImage}
          />
        );
      }}
    </OnboardingGuard>
  );
}
