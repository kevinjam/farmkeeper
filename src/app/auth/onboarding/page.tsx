'use client';

import { useSession } from 'next-auth/react';
import { GoogleOnboarding } from '@/components/auth/google-onboarding';
import { OnboardingGuard } from '@/components/auth/onboarding-guard';

export default function OnboardingPage() {
  const { data: session } = useSession();

  return (
    <OnboardingGuard requireOnboarding={true}>
      {session?.user && (
        <GoogleOnboarding
          userEmail={session.user.email || ''}
          userName={session.user.name || ''}
          userImage={session.user.image || undefined}
        />
      )}
    </OnboardingGuard>
  );
}
