'use client';

import { Suspense } from 'react';
import HelpLanding from '@/components/help/HelpLanding';
import { HelpRouteFrame } from '@/components/help/HelpPageShell';
import { useFarmPaths } from '@/hooks/useFarmPaths';

function FarmHelpContent() {
  const { farmPath } = useFarmPaths();
  return <HelpLanding basePath={farmPath('/dashboard/help')} />;
}

export default function HelpSupportPage() {
  return (
    <HelpRouteFrame>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        }
      >
        <FarmHelpContent />
      </Suspense>
    </HelpRouteFrame>
  );
}
