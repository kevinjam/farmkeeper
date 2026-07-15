'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import SettingsPageContent from '@/components/settings/SettingsPageContent';

export default function FarmSettingsPage() {
  const params = useParams();
  const farmSlug = params.farmId as string;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <SettingsPageContent farmSlug={farmSlug} />
    </Suspense>
  );
}
