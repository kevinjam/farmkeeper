'use client';

import { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, PiggyBank, Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface FinancialData {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  growth: {
    revenueGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
  };
  monthlyBreakdown: Array<{
    month: number;
    income: number;
    expenses: number;
    netProfit: number;
    incomeCount: number;
    expenseCount: number;
  }>;
  transactions: {
    totalTransactions: number;
    incomeTransactions: number;
    expenseTransactions: number;
  };
}

const formatCurrency = (amount: number, currency: string = 'UGX') => {
  if (amount === 0) return `${currency} 0`;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1000000) return `${sign}${currency} ${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}${currency} ${(abs / 1000).toFixed(1)}K`;
  return `${sign}${currency} ${abs.toLocaleString()}`;
};

const getMonthName = (monthNum: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNum - 1] || '—';
};

const FinancialAnalyticsWidget = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getFinancialAnalytics();
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.error || 'Failed to fetch financial analytics');
        }
      } catch (err) {
        console.error('Error fetching financial analytics:', err);
        setError('Error loading financial data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-2xl bg-gray-200/80 dark:bg-gray-700/80 md:hidden" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-[7.25rem] rounded-xl bg-gray-200/80 dark:bg-gray-700/80 ${i > 2 ? 'md:block hidden' : ''} ${i <= 2 ? 'md:hidden' : ''}`} />
            ))}
            {[1, 2, 3].map((i) => (
              <div key={`d-${i}`} className="hidden h-24 rounded-lg bg-gray-200/80 dark:bg-gray-700/80 md:block" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center max-md:px-4">
        <PiggyBank className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
        <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">No analytics yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add your first income or expense to see insights here.
        </p>
      </div>
    );
  }

  const profitPositive = data.summary.netProfit >= 0;

  return (
    <div className="md:rounded-lg md:bg-white md:dark:bg-gray-800 md:shadow">
      {/* Section header — desktop only (mobile uses page hero) */}
      <div className="hidden border-b border-gray-200 p-6 dark:border-gray-700 md:block">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Financial Analytics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your farm&apos;s financial performance</p>
      </div>

      <div className="p-4 md:p-6">
        {/* Mobile: net profit hero */}
        <div
          className={`relative mb-3 overflow-hidden rounded-2xl border p-4 shadow-md md:hidden ${
            profitPositive
              ? 'border-sky-500/30 bg-gradient-to-br from-sky-500/15 via-white to-white dark:from-sky-500/20 dark:via-gray-900 dark:to-gray-900/95'
              : 'border-orange-500/30 bg-gradient-to-br from-orange-500/12 via-white to-white dark:from-orange-500/15 dark:via-gray-900 dark:to-gray-900/95'
          }`}
        >
          <div
            className={`pointer-events-none absolute left-0 top-0 h-1 w-full ${profitPositive ? 'bg-sky-500/60' : 'bg-orange-500/60'}`}
          />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Net {profitPositive ? 'profit' : 'loss'} · this period
          </p>
          <p
            className={`mt-1 text-2xl font-extrabold tabular-nums tracking-tight ${
              profitPositive ? 'text-sky-950 dark:text-sky-100' : 'text-orange-950 dark:text-orange-100'
            }`}
          >
            {formatCurrency(data.summary.netProfit)}
          </p>
          <p
            className={`mt-1 flex items-center gap-1 text-xs font-medium ${
              data.growth.profitGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {data.growth.profitGrowth >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {data.growth.profitGrowth >= 0 ? '+' : ''}
            {data.growth.profitGrowth.toFixed(1)}% vs last period
          </p>
          {data.summary.totalRevenue > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-medium text-gray-500 dark:text-gray-400">
                <span>Margin</span>
                <span className={data.summary.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {data.summary.profitMargin.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-200/80 dark:bg-gray-700/80">
                <div
                  className={`h-full rounded-full ${data.summary.profitMargin >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(data.summary.profitMargin), 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile: 2×2 stat tiles */}
        <div className="mb-4 grid grid-cols-2 gap-2 md:hidden">
          <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/12 via-white to-white p-3 shadow-md dark:from-emerald-500/16 dark:via-gray-900 dark:to-gray-900/95">
            <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-emerald-500/50" />
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="mt-2 text-[1.2rem] font-extrabold tabular-nums leading-none text-emerald-950 dark:text-emerald-100">
              {formatCurrency(data.summary.totalRevenue)}
            </p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Revenue</p>
            <p className="mt-auto text-[10px] font-medium text-emerald-600">
              {data.growth.revenueGrowth >= 0 ? '+' : ''}
              {data.growth.revenueGrowth.toFixed(1)}%
            </p>
          </div>
          <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-white to-white p-3 shadow-md dark:from-rose-500/14 dark:via-gray-900 dark:to-gray-900/95">
            <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-rose-500/50" />
            <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <p className="mt-2 text-[1.2rem] font-extrabold tabular-nums leading-none text-rose-950 dark:text-rose-100">
              {formatCurrency(data.summary.totalExpenses)}
            </p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Expenses</p>
            <p
              className={`mt-auto text-[10px] font-medium ${
                data.growth.expenseGrowth <= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {data.growth.expenseGrowth >= 0 ? '+' : ''}
              {data.growth.expenseGrowth.toFixed(1)}%
            </p>
          </div>
          <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-gray-200/80 bg-gray-50/80 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
            <Receipt className="h-4 w-4 text-gray-500" />
            <p className="mt-2 text-[1.35rem] font-extrabold tabular-nums text-gray-900 dark:text-white">
              {data.transactions.totalTransactions}
            </p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Transactions</p>
            <p className="mt-auto text-[10px] text-gray-500">
              {data.transactions.incomeTransactions} in · {data.transactions.expenseTransactions} out
            </p>
          </div>
          <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-500/8 via-white to-white p-3 shadow-sm dark:from-violet-500/12 dark:via-gray-900 dark:to-gray-900/95">
            <PiggyBank className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <p className="mt-2 text-[1.35rem] font-extrabold tabular-nums text-violet-950 dark:text-violet-100">
              {data.transactions.incomeTransactions}
            </p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Sales logged</p>
            <p className="mt-auto text-[10px] text-gray-500">Income records</p>
          </div>
        </div>

        {/* Desktop: summary cards */}
        <div className="mb-6 hidden grid-cols-3 gap-4 md:grid">
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">Total Revenue</p>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              {formatCurrency(data.summary.totalRevenue)}
            </p>
            <p className={`text-xs ${data.growth.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.growth.revenueGrowth >= 0 ? '+' : ''}
              {data.growth.revenueGrowth.toFixed(1)}% from last period
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Total Expenses</p>
            <p className="text-lg font-bold text-red-900 dark:text-red-100">
              {formatCurrency(data.summary.totalExpenses)}
            </p>
            <p className={`text-xs ${data.growth.expenseGrowth <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.growth.expenseGrowth >= 0 ? '+' : ''}
              {data.growth.expenseGrowth.toFixed(1)}% from last period
            </p>
          </div>
          <div
            className={`rounded-lg p-4 ${
              profitPositive ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                profitPositive ? 'text-blue-800 dark:text-blue-200' : 'text-orange-800 dark:text-orange-200'
              }`}
            >
              Net {profitPositive ? 'Profit' : 'Loss'}
            </p>
            <p
              className={`text-lg font-bold ${
                profitPositive ? 'text-blue-900 dark:text-blue-100' : 'text-orange-900 dark:text-orange-100'
              }`}
            >
              {formatCurrency(data.summary.netProfit)}
            </p>
            <p className={`text-xs ${data.growth.profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.growth.profitGrowth >= 0 ? '+' : ''}
              {data.growth.profitGrowth.toFixed(1)}% from last period
            </p>
          </div>
        </div>

        {/* Monthly breakdown — horizontal snap scroll */}
        {data.monthlyBreakdown && data.monthlyBreakdown.length > 0 && (
          <div className="mb-4 md:mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white md:text-base">
              Monthly breakdown
            </h4>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 snap-x snap-mandatory scrollbar-hide md:mx-0 md:px-0">
              {data.monthlyBreakdown.map((month) => (
                <div
                  key={month.month}
                  className="min-w-[8.5rem] shrink-0 snap-start rounded-xl border border-gray-200/90 bg-gray-50/90 p-3 dark:border-gray-700/80 dark:bg-gray-900/40 md:min-w-[120px]"
                >
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {getMonthName(month.month)}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(month.income)}
                  </p>
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    −{formatCurrency(month.expenses)}
                  </p>
                  <p
                    className={`mt-1 border-t border-gray-200/80 pt-1.5 text-sm font-bold tabular-nums dark:border-gray-700/80 ${
                      month.netProfit >= 0 ? 'text-sky-700 dark:text-sky-300' : 'text-orange-600'
                    }`}
                  >
                    {formatCurrency(month.netProfit)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop: transaction summary + margin */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-4">
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.transactions.totalTransactions}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Transactions</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <p className="text-2xl font-bold text-green-600">{data.transactions.incomeTransactions}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Income Records</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <p className="text-2xl font-bold text-red-600">{data.transactions.expenseTransactions}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Expense Records</p>
          </div>
        </div>

        {data.summary.totalRevenue > 0 && (
          <div className="mt-4 hidden rounded-lg bg-gray-50 p-3 dark:bg-gray-700 md:block">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Profit Margin</span>
              <span
                className={`text-sm font-bold ${
                  data.summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {data.summary.profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-600">
              <div
                className={`h-2 rounded-full ${
                  data.summary.profitMargin >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(Math.abs(data.summary.profitMargin), 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialAnalyticsWidget;
