'use client';

import { Suspense } from 'react';
import HelpLanding from '@/components/help/HelpLanding';
import { HelpRouteFrame } from '@/components/help/HelpPageShell';
import { useFarmPaths } from '@/hooks/useFarmPaths';

function FarmHelpFallbackContent() {
  const { farmPath } = useFarmPaths();
  return <HelpLanding basePath={farmPath('/dashboard/help')} missing />;
}

export default function FarmHelpFallbackPage() {
  return (
    <HelpRouteFrame>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        }
      >
        <FarmHelpFallbackContent />
      </Suspense>
    </HelpRouteFrame>
  );
}
