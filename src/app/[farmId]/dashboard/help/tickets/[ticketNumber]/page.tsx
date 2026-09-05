'use client';

import { Suspense } from 'react';
import HelpTicketDetail from '@/components/help/HelpTicketDetail';
import { HelpRouteFrame } from '@/components/help/HelpPageShell';
import { useFarmPaths } from '@/hooks/useFarmPaths';

function FarmHelpTicketContent({ ticketNumber }: { ticketNumber: string }) {
  const { farmPath } = useFarmPaths();
  return <HelpTicketDetail basePath={farmPath('/dashboard/help')} ticketNumber={ticketNumber} />;
}

export default function FarmHelpTicketPage({ params }: { params: { ticketNumber: string } }) {
  return (
    <HelpRouteFrame>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        }
      >
        <FarmHelpTicketContent ticketNumber={params.ticketNumber} />
      </Suspense>
    </HelpRouteFrame>
  );
}
