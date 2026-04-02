'use client';

import Link from 'next/link';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import FinancialAnalyticsWidget from '@/components/FinancialAnalyticsWidget';
import FinancialRecordsManager from '@/components/FinancialRecordsManager';

export default function FinancesDashboard({ params }: { params: { farmId: string } }) {
  const { farmId } = params;

  return (
    <div className="max-md:px-0 md:max-w-7xl md:mx-auto md:py-8 md:px-6 lg:px-8 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
      <div className="order-1 overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="max-md:bg-gradient-to-br max-md:from-sky-500/12 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-sky-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex max-md:flex-col md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="flex max-md:items-start max-md:gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 md:hidden">
                <Wallet className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Finances</h1>
                <p className="mt-0.5 text-[13px] leading-snug text-gray-600 dark:text-gray-300 md:mt-1 md:text-sm">
                  Track income, expenses, and profitability in one place
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:mt-0 md:flex md:shrink-0 md:gap-2">
              <Link
                href={`/${farmId}/dashboard/finances/expense`}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 md:min-h-0 md:rounded-lg md:px-4 md:py-2"
              >
                <TrendingDown className="h-5 w-5 md:h-4 md:w-4" strokeWidth={2} />
                Add expense
              </Link>
              <Link
                href={`/${farmId}/dashboard/finances/income`}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 md:min-h-0 md:rounded-lg md:px-4 md:py-2"
              >
                <TrendingUp className="h-5 w-5 md:h-4 md:w-4" strokeWidth={2} />
                Record sale
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 max-md:mx-3 max-md:overflow-hidden max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:bg-white max-md:shadow-md dark:max-md:border-gray-700/80 dark:max-md:bg-gray-800/95 md:mt-8 md:rounded-xl md:border md:border-gray-200/80 md:bg-white md:shadow-lg dark:md:border-gray-700 dark:md:bg-gray-800">
        <FinancialAnalyticsWidget />
      </div>

      <div className="mt-4 max-md:mx-3 max-md:overflow-hidden max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:bg-white max-md:shadow-md dark:max-md:border-gray-700/80 dark:max-md:bg-gray-800/95 md:mt-8 md:rounded-xl md:border md:border-gray-200/80 md:bg-white md:shadow-lg dark:md:border-gray-700 dark:md:bg-gray-800">
        <FinancialRecordsManager />
      </div>
    </div>
  );
}
