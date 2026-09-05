'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HarvestForm from '@/components/harvests/HarvestForm';
import { HARVEST_NOTICE, NoticeBanner, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import type { HarvestRecord } from '@/lib/harvest';

export default function EditHarvestPage({ params }: { params: { farmId: string; harvestId: string } }) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [harvest, setHarvest] = useState<HarvestRecord | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await apiClient.getHarvest(farmId, params.harvestId);
    if (!response.success || !response.data) {
      setError(response.error || 'Harvest not found');
    } else {
      setHarvest(response.data as HarvestRecord);
    }
    setLoading(false);
  }, [farmId, params.harvestId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <div className="h-48 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />;
  if (error || !harvest) return <NoticeBanner tone="error">{error || 'Harvest not found'}</NoticeBanner>;

  return (
    <div className="mx-auto max-w-3xl max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 px-4 py-4 md:px-6">
          <h1 className="text-lg font-bold md:text-2xl">Edit Harvest</h1>
        </div>
        <HarvestForm
          farmId={farmId}
          mode="edit"
          harvest={harvest}
          onSuccess={() => {
            setFlashNotice(HARVEST_NOTICE.harvestUpdated);
            router.push(farmPath(`/dashboard/harvests/${harvest._id}`));
          }}
        />
      </div>
    </div>
  );
}
