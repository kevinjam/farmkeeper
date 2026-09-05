'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { hasFeatureAccess } from '@/lib/features';
import {
  expenseCategoryShortLabel,
  formatExpenseAmount,
  type ExpenseSummary,
} from '@/lib/expenses';

export default function CropExpensesPanel({
  farmId,
  cropId,
}: {
  farmId: string;
  cropId: string;
}) {
  const { farmPath } = useFarmPaths(farmId);
  const { features, unlockAllFeatures } = useSubscriptionContext();
  const canUseFinances = hasFeatureAccess(features, 'finances', unlockAllFeatures);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!canUseFinances || !farmId || !cropId) {
      setLoading(false);
      return;
    }
    const response = await apiClient.getFinancialSummary(farmId, cropId);
    if (response.success) setSummary(response.data as ExpenseSummary);
    setLoading(false);
  }, [canUseFinances, farmId, cropId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canUseFinances) return null;

  const addHref = farmPath(`/dashboard/finances/expense?cropId=${cropId}`);
  const listHref = farmPath(`/dashboard/finances?cropId=${cropId}`);
  const currency = summary?.currency || 'UGX';
  const recent = summary?.recent || [];

  return (
    <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 dark:max-md:border-gray-700/80">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:px-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Expenses</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {loading
              ? 'Loading…'
              : summary?.totalCount
                ? `Total expenses: ${formatExpenseAmount(summary.totalAmount, currency)}`
                : 'No expenses recorded yet.'}
          </p>
        </div>
        <Link
          href={addHref}
          className="btn btn-primary inline-flex shrink-0 items-center gap-1.5 max-md:min-h-11 md:min-h-9"
        >
          <Plus className="h-4 w-4" />
          Add
        </Link>
      </div>
      <div className="px-4 py-3 md:px-5">
        {loading ? (
          <div className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        ) : recent.length === 0 ? (
          <div className="text-sm text-gray-500">
            <p>No expenses recorded yet.</p>
            <Link href={addHref} className="mt-2 inline-flex font-semibold text-primary-700 dark:text-primary-300">
              Add an expense →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700/80">
            {recent.map((item) => (
              <li key={item._id} className="flex items-center justify-between gap-3 py-2">
                <span className="truncate text-sm text-gray-800 dark:text-gray-200">
                  {expenseCategoryShortLabel(item.category)}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatExpenseAmount(item.amount, item.currency || currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link href={listHref} className="mt-3 inline-flex text-sm font-semibold text-primary-600">
          View Expenses
        </Link>
      </div>
    </div>
  );
}
