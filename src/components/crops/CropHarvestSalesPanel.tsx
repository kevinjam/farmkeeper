'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { formatExpenseAmount } from '@/lib/expenses';
import { formatUnitBreakdown, type HarvestSummary } from '@/lib/harvest';

export default function CropHarvestSalesPanel({ farmId, cropId }: { farmId: string; cropId: string }) {
  const { farmPath } = useFarmPaths(farmId);
  const [summary, setSummary] = useState<HarvestSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!farmId || !cropId) return;
    const response = await apiClient.getHarvestSummary(farmId, cropId);
    if (response.success) setSummary(response.data as HarvestSummary);
    setLoading(false);
  }, [farmId, cropId]);

  useEffect(() => {
    void load();
  }, [load]);

  const byUnit = summary?.byUnit || [];
  const currency = summary?.currency || 'UGX';
  const addHarvest = farmPath(`/dashboard/harvests/add?cropId=${cropId}`);
  const addSale = farmPath(`/dashboard/harvests/sales/add?cropId=${cropId}`);

  return (
    <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 dark:max-md:border-gray-700/80">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:px-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Harvest &amp; Sales</h2>
          <p className="text-xs text-gray-500">
            {loading ? 'Loading…' : summary?.harvestCount ? `${summary.harvestCount} harvests` : 'No harvests recorded yet.'}
          </p>
        </div>
        <Link href={addHarvest} className="btn btn-primary inline-flex shrink-0 items-center gap-1.5 max-md:min-h-11 md:min-h-9">
          <Plus className="h-4 w-4" />
          Harvest
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">
        <div className="bg-white px-4 py-3 dark:bg-gray-800">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Harvested</p>
          <p className="mt-0.5 text-base font-bold tabular-nums">{loading ? '—' : formatUnitBreakdown(byUnit, 'harvested')}</p>
        </div>
        <div className="bg-white px-4 py-3 dark:bg-gray-800">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Sold</p>
          <p className="mt-0.5 text-base font-bold tabular-nums">{loading ? '—' : formatUnitBreakdown(byUnit, 'sold')}</p>
        </div>
        <div className="bg-white px-4 py-3 dark:bg-gray-800">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Remaining</p>
          <p className="mt-0.5 text-base font-bold tabular-nums">{loading ? '—' : formatUnitBreakdown(byUnit, 'remaining')}</p>
        </div>
        <div className="bg-white px-4 py-3 dark:bg-gray-800">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Revenue</p>
          <p className="mt-0.5 text-base font-bold tabular-nums">{loading ? '—' : formatExpenseAmount(summary?.totalRevenue || 0, currency)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 px-4 py-3 md:px-5">
        <Link href={addSale} className="text-sm font-semibold text-primary-600">
          + Record Sale
        </Link>
        <Link href={farmPath('/dashboard/harvests')} className="text-sm font-semibold text-primary-600">
          View harvests
        </Link>
      </div>
    </div>
  );
}
