'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import SaleForm from '@/components/harvests/SaleForm';
import { HARVEST_NOTICE, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import HelpHint from '@/components/help/HelpHint';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function AddSalePage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [initialCropId, setInitialCropId] = useState('');
  const [initialHarvestId, setInitialHarvestId] = useState('');
  const [currency, setCurrency] = useState('UGX');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      setInitialCropId(search.get('cropId') || '');
      setInitialHarvestId(search.get('harvestId') || '');
    }
    if (!farmId) return;
    const load = async () => {
      const response = await apiClient.getFarmSettings(farmId);
      const next = response.data?.settings?.currency || response.data?.currency;
      if (typeof next === 'string' && next.trim()) setCurrency(next.trim().toUpperCase());
    };
    void load();
  }, [farmId]);

  return (
    <div className="mx-auto max-w-3xl max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold md:text-2xl">Record Sale</h1>
              <p className="text-sm text-gray-500">Log produce you have already sold.</p>
              <HelpHint href={farmPath('/dashboard/help/articles/how-to-record-a-sale')}>
                How do I record a sale?
              </HelpHint>
            </div>
          </div>
        </div>
        <SaleForm
          farmId={farmId}
          mode="add"
          initialCropId={initialCropId}
          initialHarvestId={initialHarvestId}
          currency={currency}
          onSuccess={() => {
            setFlashNotice(HARVEST_NOTICE.saleAdded);
            router.push(farmPath('/dashboard/harvests?tab=sales'));
          }}
        />
      </div>
    </div>
  );
}
