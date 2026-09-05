'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wheat } from 'lucide-react';
import HarvestForm from '@/components/harvests/HarvestForm';
import { HARVEST_NOTICE, setFlashNotice } from '@/components/NoticeBanner';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function AddHarvestPage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [initialCropId, setInitialCropId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInitialCropId(new URLSearchParams(window.location.search).get('cropId') || '');
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700">
              <Wheat className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold md:text-2xl">Record Harvest</h1>
              <p className="text-sm text-gray-500">Log produce you have already harvested.</p>
            </div>
          </div>
        </div>
        <HarvestForm
          farmId={farmId}
          mode="add"
          initialCropId={initialCropId}
          onSuccess={() => {
            setFlashNotice(HARVEST_NOTICE.harvestAdded);
            router.push(farmPath('/dashboard/harvests'));
          }}
        />
      </div>
    </div>
  );
}
