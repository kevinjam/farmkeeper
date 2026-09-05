'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, Wallet } from 'lucide-react';
import ExpenseList from '@/components/finances/ExpenseList';
import FinancialAnalyticsWidget from '@/components/FinancialAnalyticsWidget';
import { NoticeBanner, useFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { formatExpenseAmount, type ExpenseSummary } from '@/lib/expenses';
import HelpHint from '@/components/help/HelpHint';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function FinancesDashboard({ params }: { params: { farmId: string } }) {
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const { message: notice, clear: clearNotice } = useFlashNotice();
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [cropFilter, setCropFilter] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCropFilter(new URLSearchParams(window.location.search).get('cropId') || '');
    }
  }, []);

  useEffect(() => {
    if (!farmId) return;
    const load = async () => {
      const response = await apiClient.getFinancialSummary(farmId);
      if (response.success) setSummary(response.data as ExpenseSummary);
    };
    void load();
  }, [farmId, notice]);

  const currency = summary?.currency || 'UGX';

  return (
    <div className="flex flex-col gap-3 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:gap-4 md:py-2">
      {notice ? (
        <NoticeBanner tone="success" onDismiss={clearNotice}>
          {notice}
        </NoticeBanner>
      ) : null}

      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">Finances</h1>
              <p className="text-[13px] text-gray-500 dark:text-gray-400">
                Track the money going into and out of your farm.
              </p>
              <HelpHint href={farmPath('/dashboard/help/articles/how-expenses-affect-profitability')}>
                How are expenses used?
              </HelpHint>
            </div>
          </div>
          <div className="flex gap-2 max-sm:w-full">
            <Link
              href={farmPath('/dashboard/finances/expense')}
              className="btn btn-primary inline-flex flex-1 items-center justify-center gap-1.5 max-md:min-h-11 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </Link>
            <Link
              href={farmPath('/dashboard/finances/income')}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-300 px-3 text-sm font-semibold max-md:min-h-11 sm:flex-none dark:border-gray-600"
            >
              <TrendingUp className="h-4 w-4" />
              Record sale
            </Link>
            <Link
              href={farmPath('/dashboard/profitability')}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-300 px-3 text-sm font-semibold max-md:min-h-11 sm:flex-none dark:border-gray-600"
            >
              Profitability
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-px border-t border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-700">
          <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Total expenses</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-gray-900 dark:text-white md:text-xl">
              {formatExpenseAmount(summary?.totalAmount || 0, currency)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">This month</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-gray-900 dark:text-white md:text-xl">
              {formatExpenseAmount(summary?.thisMonthAmount || 0, currency)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Expenses</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-gray-900 dark:text-white md:text-xl">
              {summary?.totalCount ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:px-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Expenses</h2>
        </div>
        <div className="p-4 md:p-5">
          <ExpenseList farmId={farmId} initialCropId={cropFilter} />
        </div>
      </div>

      <div className="overflow-hidden md:rounded-xl md:border md:border-gray-200/80 md:bg-white md:shadow-lg dark:md:border-gray-700 dark:md:bg-gray-800 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:bg-white dark:max-md:border-gray-700/80 dark:max-md:bg-gray-800">
        <FinancialAnalyticsWidget />
      </div>
    </div>
  );
}
