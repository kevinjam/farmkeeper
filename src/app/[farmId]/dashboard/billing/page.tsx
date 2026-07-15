'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import BillingPageContent from '@/components/billing/BillingPageContent';

export default function BillingPage({ params }: { params: { farmId: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <BillingPageContent farmId={params.farmId} />
    </Suspense>
  );
}
