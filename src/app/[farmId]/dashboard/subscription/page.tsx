'use client';

import { useEffect } from 'react';
import { useFarmPaths } from '@/hooks/useFarmPaths';

/** Legacy route — unified billing lives at /dashboard/billing */
export default function SubscriptionRedirectPage({ params }: { params: { farmId: string } }) {
  const { farmPath } = useFarmPaths(params.farmId);

  useEffect(() => {
    window.location.replace(`${farmPath('/dashboard/billing')}?tab=plans`);
  }, [farmPath]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
      Redirecting to Plan &amp; billing…
    </div>
  );
}
