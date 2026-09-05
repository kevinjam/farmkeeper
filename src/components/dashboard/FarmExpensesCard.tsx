'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Wallet } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { hasFeatureAccess } from '@/lib/features';
import { formatExpenseAmount, type ExpenseSummary } from '@/lib/expenses';

export default function FarmExpensesCard({ farmId }: { farmId: string }) {
  const { farmPath } = useFarmPaths(farmId);
  const { features, unlockAllFeatures } = useSubscriptionContext();
  const canUseFinances = hasFeatureAccess(features, 'finances', unlockAllFeatures);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!canUseFinances || !farmId) {
      setLoading(false);
      return;
    }
    const response = await apiClient.getFinancialSummary(farmId);
    if (response.success) setSummary(response.data as ExpenseSummary);
    setLoading(false);
  }, [canUseFinances, farmId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canUseFinances) return null;

  const currency = summary?.currency || 'UGX';
  const empty = !loading && !summary?.totalCount;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 max-md:rounded-2xl max-md:border max-md:border-gray-100/90 max-md:shadow-md dark:max-md:border-gray-700/80">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300">
            <Wallet className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Farm Expenses</h3>
            <p className="text-[11px] text-gray-500">This month</p>
          </div>
        </div>
        <Link href={farmPath('/dashboard/finances')} className="text-xs font-semibold text-primary-600">
          View
        </Link>
      </div>
      <div className="flex flex-1 items-center px-4 py-3">
        {loading ? (
          <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        ) : empty ? (
          <Link
            href={farmPath('/dashboard/finances/expense')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600"
          >
            <Plus className="h-4 w-4" />
            Add expense
          </Link>
        ) : (
          <div>
            <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
              {formatExpenseAmount(summary?.thisMonthAmount || 0, currency)}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {summary?.thisMonthCount || 0} {(summary?.thisMonthCount || 0) === 1 ? 'expense' : 'expenses'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
