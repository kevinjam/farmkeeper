'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ShoppingBag, Wheat } from 'lucide-react';
import HarvestList from '@/components/harvests/HarvestList';
import SaleList from '@/components/harvests/SaleList';
import { NoticeBanner, useFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { formatExpenseAmount } from '@/lib/expenses';
import { formatUnitBreakdown, type HarvestSummary } from '@/lib/harvest';
import HelpHint from '@/components/help/HelpHint';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function HarvestsPage({ params }: { params: { farmId: string } }) {
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const { message: notice, clear: clearNotice } = useFlashNotice();
  const [tab, setTab] = useState<'harvests' | 'sales'>('harvests');
  const [summary, setSummary] = useState<HarvestSummary | null>(null);
  const [summaryTick, setSummaryTick] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'sales') {
      setTab('sales');
    }
  }, []);

  useEffect(() => {
    if (!farmId) return;
    const load = async () => {
      const response = await apiClient.getHarvestSummary(farmId);
      if (response.success) setSummary(response.data as HarvestSummary);
    };
    void load();
  }, [farmId, notice, summaryTick]);

  const currency = summary?.currency || 'UGX';
  const byUnit = summary?.byUnit || [];

  return (
    <div className="flex flex-col gap-3 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:gap-4 md:py-2">
      {notice ? (
        <NoticeBanner tone="success" onDismiss={clearNotice}>
          {notice}
        </NoticeBanner>
      ) : null}

      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">Harvest &amp; Sales</h1>
            <p className="text-[13px] text-gray-500">Track what you harvested, sold, and still have on hand.</p>
            <div className="mt-0.5 flex flex-col gap-0.5">
              <HelpHint href={farmPath('/dashboard/help/articles/how-to-record-a-harvest')}>
                How does harvest tracking work?
              </HelpHint>
              <HelpHint href={farmPath('/dashboard/help/articles/how-to-record-a-sale')}>
                How do I record a sale?
              </HelpHint>
            </div>
          </div>
          <div className="flex gap-2 max-sm:w-full">
            <Link
              href={farmPath('/dashboard/harvests/add')}
              className="btn btn-primary inline-flex flex-1 items-center justify-center gap-1.5 max-md:min-h-11 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              Record Harvest
            </Link>
            <Link
              href={farmPath('/dashboard/harvests/sales/add')}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-300 px-3 text-sm font-semibold max-md:min-h-11 sm:flex-none dark:border-gray-600"
            >
              Record Sale
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-700 lg:grid-cols-4">
          <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Total harvested</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums md:text-xl">{formatUnitBreakdown(byUnit, 'harvested')}</p>
          </div>
          <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Total sold</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums md:text-xl">{formatUnitBreakdown(byUnit, 'sold')}</p>
          </div>
          <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Remaining</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums md:text-xl">{formatUnitBreakdown(byUnit, 'remaining')}</p>
          </div>
          <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Sales revenue</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums md:text-xl">
              {formatExpenseAmount(summary?.totalRevenue || 0, currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="flex gap-1 border-b border-gray-200 p-2 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setTab('harvests')}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
              tab === 'harvests' ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100' : 'text-gray-600'
            }`}
          >
            <Wheat className="h-4 w-4" />
            Harvests
          </button>
          <button
            type="button"
            onClick={() => setTab('sales')}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
              tab === 'sales' ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100' : 'text-gray-600'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Sales
          </button>
        </div>
        <div className="p-4 md:p-5">
          {tab === 'harvests' ? (
            <HarvestList farmId={farmId} onChanged={() => setSummaryTick((n) => n + 1)} />
          ) : (
            <SaleList farmId={farmId} onChanged={() => setSummaryTick((n) => n + 1)} />
          )}
        </div>
      </div>
    </div>
  );
}
