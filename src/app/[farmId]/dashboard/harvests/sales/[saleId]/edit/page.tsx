'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SaleForm from '@/components/harvests/SaleForm';
import { HARVEST_NOTICE, NoticeBanner, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import type { CropSaleRecord } from '@/lib/harvest';

export default function EditSalePage({ params }: { params: { farmId: string; saleId: string } }) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [sale, setSale] = useState<CropSaleRecord | null>(null);
  const [currency, setCurrency] = useState('UGX');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [record, settings] = await Promise.all([
      apiClient.getCropSale(farmId, params.saleId),
      apiClient.getFarmSettings(farmId),
    ]);
    const nextCurrency = settings.data?.settings?.currency;
    if (typeof nextCurrency === 'string' && nextCurrency.trim()) {
      setCurrency(nextCurrency.trim().toUpperCase());
    }
    if (!record.success || !record.data) {
      setError(record.error || 'Sale not found');
    } else {
      setSale(record.data as CropSaleRecord);
    }
    setLoading(false);
  }, [farmId, params.saleId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <div className="h-48 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />;
  if (error || !sale) return <NoticeBanner tone="error">{error || 'Sale not found'}</NoticeBanner>;

  return (
    <div className="mx-auto max-w-3xl max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 px-4 py-4 md:px-6">
          <h1 className="text-lg font-bold md:text-2xl">Edit Sale</h1>
        </div>
        <SaleForm
          farmId={farmId}
          mode="edit"
          sale={sale}
          currency={sale.currency || currency}
          onSuccess={() => {
            setFlashNotice(HARVEST_NOTICE.saleUpdated);
            router.push(farmPath(`/dashboard/harvests/sales/${sale._id}`));
          }}
        />
      </div>
    </div>
  );
}
