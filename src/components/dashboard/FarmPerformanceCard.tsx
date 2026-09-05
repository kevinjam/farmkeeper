'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { hasFeatureAccess } from '@/lib/features';
import { formatExpenseAmount } from '@/lib/expenses';
import { statusTone, type ProfitabilityReport } from '@/lib/profitability';

export default function FarmPerformanceCard({ farmId }: { farmId: string }) {
  const { farmPath } = useFarmPaths(farmId);
  const { features, unlockAllFeatures } = useSubscriptionContext();
  const canUse = hasFeatureAccess(features, 'finances', unlockAllFeatures);
  const [report, setReport] = useState<ProfitabilityReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!canUse || !farmId) {
      setLoading(false);
      return;
    }
    const response = await apiClient.getProfitability(farmId, { period: 'this_year' });
    if (response.success) setReport(response.data as ProfitabilityReport);
    setLoading(false);
  }, [canUse, farmId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canUse || loading) return null;
  if (!report?.counts.hasRevenue && !report?.counts.hasExpenses) return null;

  const farm = report.farm;
  const tone = statusTone(farm.status);
  const currency = report.currency;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 max-md:rounded-2xl max-md:border max-md:border-gray-100/90 max-md:shadow-md dark:max-md:border-gray-700/80">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Performance</h3>
            <p className="truncate text-[11px] text-gray-500">
              {tone.emoji} {farm.statusLabel}
            </p>
          </div>
        </div>
        <Link href={farmPath('/dashboard/profitability')} className="text-xs font-semibold text-primary-600">
          View
        </Link>
      </div>
      <div className="grid flex-1 grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
        <div className="px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Revenue</p>
          <p className="mt-1 truncate text-sm font-bold tabular-nums">{formatExpenseAmount(farm.revenue, currency)}</p>
        </div>
        <div className="px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Expenses</p>
          <p className="mt-1 truncate text-sm font-bold tabular-nums">{formatExpenseAmount(farm.expenses, currency)}</p>
        </div>
        <div className="px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Profit</p>
          <p className={`mt-1 truncate text-sm font-bold tabular-nums ${farm.profit < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
            {formatExpenseAmount(farm.profit, currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
