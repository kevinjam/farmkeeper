'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Wheat } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { formatExpenseAmount } from '@/lib/expenses';
import { formatUnitBreakdown, type HarvestSummary } from '@/lib/harvest';

export default function HarvestSalesCard({ farmId }: { farmId: string }) {
  const { farmPath } = useFarmPaths(farmId);
  const [summary, setSummary] = useState<HarvestSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!farmId) return;
    const response = await apiClient.getHarvestSummary(farmId);
    if (response.success) setSummary(response.data as HarvestSummary);
    setLoading(false);
  }, [farmId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !summary?.harvestCount) return null;

  const byUnit = summary.byUnit || [];
  const currency = summary.currency || 'UGX';

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 max-md:rounded-2xl max-md:border max-md:border-gray-100/90 max-md:shadow-md dark:max-md:border-gray-700/80">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Wheat className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Harvest &amp; Sales</h3>
        </div>
        <Link href={farmPath('/dashboard/harvests')} className="text-xs font-semibold text-primary-600">
          View
        </Link>
      </div>
      <div className="grid flex-1 grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
        <div className="px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Harvested</p>
          <p className="mt-1 truncate text-sm font-bold tabular-nums">{formatUnitBreakdown(byUnit, 'harvested')}</p>
        </div>
        <div className="px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Available</p>
          <p className="mt-1 truncate text-sm font-bold tabular-nums">{formatUnitBreakdown(byUnit, 'remaining')}</p>
        </div>
        <div className="px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Sales</p>
          <p className="mt-1 truncate text-sm font-bold tabular-nums">
            {formatExpenseAmount(summary.totalRevenue || 0, currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
