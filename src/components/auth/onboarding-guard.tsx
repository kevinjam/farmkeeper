'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface OnboardingGuardProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export function OnboardingGuard({ children, requireOnboarding = false }: OnboardingGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // If user needs onboarding but we're not on onboarding page
      if (session.requiresOnboarding && !requireOnboarding) {
        router.push('/auth/onboarding');
        return;
      }
      
      // If user doesn't need onboarding but we're on onboarding page
      if (!session.requiresOnboarding && requireOnboarding) {
        router.push('/dashboard');
        return;
      }
    }
  }, [session, status, router, requireOnboarding]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  return <>{children}</>;
}
