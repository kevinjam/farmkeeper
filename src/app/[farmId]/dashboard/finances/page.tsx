'use client';

import Link from 'next/link';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import FinancialAnalyticsWidget from '@/components/FinancialAnalyticsWidget';
import FinancialRecordsManager from '@/components/FinancialRecordsManager';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function FinancesDashboard({ params }: { params: { farmId: string } }) {
  const { farmPath } = useFarmPaths(params.farmId);

  return (
    <div className="space-y-3 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:space-y-6 md:py-2">
      {/* Hero + quick actions */}
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="max-md:bg-gradient-to-br max-md:from-sky-500/14 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-sky-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex max-md:flex-col md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="flex max-md:items-start max-md:gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 md:hidden">
                <Wallet className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Finances</h1>
                <p className="mt-0.5 text-[13px] leading-snug text-gray-600 dark:text-gray-300 md:mt-1 md:text-sm">
                  Income, expenses &amp; profit at a glance
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 max-md:touch-manipulation md:mt-0 md:flex md:shrink-0 md:items-center md:gap-3">
              <Link
                href={farmPath('/dashboard/finances/expense')}
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 px-3 text-[13px] font-semibold text-white shadow-md shadow-rose-600/25 active:scale-[0.98] transition-all max-md:touch-manipulation md:min-h-10 md:whitespace-nowrap md:rounded-lg md:px-5 md:text-sm md:shadow-sm md:hover:from-rose-700 md:hover:to-rose-800 md:hover:shadow-md md:active:scale-[0.99]"
              >
                <TrendingDown className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                <span>Expense</span>
              </Link>
              <Link
                href={farmPath('/dashboard/finances/income')}
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-3 text-[13px] font-semibold text-white shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all max-md:touch-manipulation md:min-h-10 md:whitespace-nowrap md:rounded-lg md:px-5 md:text-sm md:shadow-sm md:hover:from-emerald-700 md:hover:to-emerald-800 md:hover:shadow-md md:active:scale-[0.99]"
              >
                <TrendingUp className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                <span>Record sale</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className=" max-md:overflow-hidden max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:bg-white max-md:shadow-md dark:max-md:border-gray-700/80 dark:max-md:bg-gray-800/95 md:rounded-xl md:border md:border-gray-200/80 md:bg-white md:shadow-lg dark:md:border-gray-700 dark:md:bg-gray-800">
        <FinancialAnalyticsWidget />
      </div>

      <div className=" max-md:overflow-hidden max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:bg-white max-md:shadow-md dark:max-md:border-gray-700/80 dark:max-md:bg-gray-800/95 md:rounded-xl md:border md:border-gray-200/80 md:bg-white md:shadow-lg dark:md:border-gray-700 dark:md:bg-gray-800">
        <FinancialRecordsManager />
      </div>
    </div>
  );
}
