'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface DashboardGuardProps {
  children: ReactNode;
}

export function DashboardGuard({ children }: DashboardGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // If user needs onboarding, redirect to onboarding
      if (session.requiresOnboarding) {
        router.push('/auth/onboarding');
        return;
      }
    }
  }, [session, status, router]);

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

  // If user needs onboarding, don't render children (will redirect)
  if (session?.requiresOnboarding) {
    return null;
  }

  return <>{children}</>;
}
