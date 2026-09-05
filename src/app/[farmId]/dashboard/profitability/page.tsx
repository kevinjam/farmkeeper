'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PeriodFilter from '@/components/profitability/PeriodFilter';
import ProfitTrendChart from '@/components/profitability/ProfitTrendChart';
import CropProfitTable from '@/components/profitability/CropProfitTable';
import { apiClient } from '@/lib/api';
import { formatExpenseAmount } from '@/lib/expenses';
import { formatUnitBreakdown } from '@/lib/harvest';
import {
  statusTone,
  type ProfitPeriod,
  type ProfitabilityReport,
} from '@/lib/profitability';
import HelpHint from '@/components/help/HelpHint';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function ProfitabilityPage({ params }: { params: { farmId: string } }) {
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [cropFromUrl, setCropFromUrl] = useState('');
  const [period, setPeriod] = useState<ProfitPeriod>('this_year');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState<'profit' | 'revenue' | 'margin' | 'name'>('profit');
  const [report, setReport] = useState<ProfitabilityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCropFromUrl(new URLSearchParams(window.location.search).get('cropId') || '');
    }
  }, []);

  const load = useCallback(async () => {
    if (!farmId) return;
    if (period === 'custom' && (!startDate || !endDate)) return;
    setLoading(true);
    const response = await apiClient.getProfitability(farmId, {
      period,
      startDate: period === 'custom' ? startDate : undefined,
      endDate: period === 'custom' ? endDate : undefined,
      cropId: cropFromUrl || undefined,
    });
    if (!response.success) {
      setError(response.error || 'Failed to load profitability');
      setReport(null);
    } else {
      setError('');
      setReport(response.data as ProfitabilityReport);
    }
    setLoading(false);
  }, [farmId, period, startDate, endDate, cropFromUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  const currency = report?.currency || 'UGX';
  const farm = report?.farm;
  const empty = !loading && report && !report.counts.hasRevenue && !report.counts.hasExpenses;
  const noRevenue = !loading && report && !report.counts.hasRevenue && report.counts.hasExpenses;
  const noExpenses = !loading && report && report.counts.hasRevenue && !report.counts.hasExpenses;

  const highlightCrops = useMemo(() => {
    if (!report) return [];
    const items = [];
    if (report.bestCrop) items.push({ title: '🏆 Most profitable crop', crop: report.bestCrop });
    if (report.worstCrop) items.push({ title: '⚠️ Lowest performing crop', crop: report.worstCrop });
    return items;
  }, [report]);

  return (
    <div className="flex flex-col gap-3 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:gap-4 md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="px-4 py-3 md:px-5">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">📊 Profitability</h1>
          <p className="text-[13px] text-gray-500">See how much you earned, spent, and kept — by farm and by crop.</p>
          <HelpHint href={farmPath('/dashboard/help/articles/how-farmkeeper-calculates-profit')}>
            How is profit calculated?
          </HelpHint>
          {cropFromUrl && report?.crops[0] ? (
            <p className="mt-2 text-sm">
              Showing {report.crops[0].name}.{' '}
              <button type="button" className="font-semibold text-primary-600" onClick={() => setCropFromUrl('')}>
                View whole farm
              </button>
            </p>
          ) : null}
        </div>
        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700 md:px-5">
          <PeriodFilter
            period={period}
            startDate={startDate}
            endDate={endDate}
            onPeriod={setPeriod}
            onStartDate={setStartDate}
            onEndDate={setEndDate}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? <div className="h-36 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" /> : null}

      {empty ? (
        <EmptyCard
          title="📊 Your profitability report will appear here once you record expenses and sales."
          actionHref={farmPath('/dashboard/harvests/sales/add')}
          actionLabel="Record a sale"
        />
      ) : null}
      {noRevenue ? (
        <EmptyCard
          title="💰 No revenue recorded yet"
          body="Record your first sale to start tracking profitability."
          actionHref={farmPath('/dashboard/harvests/sales/add')}
          actionLabel="Record Sale"
        />
      ) : null}
      {noExpenses ? (
        <EmptyCard
          title="💸 No expenses recorded yet"
          body="Add farm expenses to calculate your profit."
          actionHref={farmPath('/dashboard/finances/expense')}
          actionLabel="Add Expense"
        />
      ) : null}

      {farm && !empty ? (
        <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:px-5">
            <div>
              <h2 className="text-base font-bold">{cropFromUrl ? 'Crop overview' : 'Farm overview'}</h2>
              <p className="text-xs text-gray-500">
                {cropFromUrl
                  ? 'Crop sales minus expenses linked to this crop'
                  : `All farm revenue minus all farm expenses${
                      farm.unattributedExpenses > 0
                        ? ` · ${formatExpenseAmount(farm.unattributedExpenses, currency)} not assigned to a crop`
                        : ''
                    }`}
              </p>
            </div>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone(farm.status).className}`}>
              {statusTone(farm.status).emoji} {farm.statusLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 lg:grid-cols-4">
            <Kpi label="Total revenue" value={formatExpenseAmount(farm.revenue, currency)} />
            <Kpi label="Total expenses" value={formatExpenseAmount(farm.expenses, currency)} />
            <Kpi
              label="Net profit"
              value={formatExpenseAmount(farm.profit, currency)}
              tone={farm.profit < 0 ? 'loss' : 'profit'}
            />
            <Kpi label="Profit margin" value={farm.marginLabel} />
          </div>
        </div>
      ) : null}

      {report && !empty ? <ProfitTrendChart monthly={report.monthly} currency={currency} /> : null}

      {highlightCrops.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {highlightCrops.map((item) => (
            <div
              key={item.title}
              className="overflow-hidden bg-white px-4 py-3 shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.title}</p>
              <p className="mt-1 font-bold">
                {item.crop.name} — {formatExpenseAmount(item.crop.profit, currency)}
                {item.crop.profit < 0 ? ' loss' : ' profit'}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {report ? (
        <CropProfitTable farmId={farmId} crops={report.crops} currency={currency} sort={sort} onSort={setSort} />
      ) : null}

      {report?.expenseBreakdown.length ? (
        <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:px-5">
            <h2 className="text-base font-bold">💸 Where is the money going?</h2>
            {report.biggestExpense ? (
              <p className="mt-1 text-sm text-gray-600">
                Biggest expense: {report.biggestExpense.label} — {formatExpenseAmount(report.biggestExpense.amount, currency)}
                {report.biggestExpense.percent ? ` · ${report.biggestExpense.percent}% of expenses` : ''}
              </p>
            ) : null}
          </div>
          <ul className="divide-y divide-gray-100 px-4 dark:divide-gray-700/80 md:px-5">
            {report.expenseBreakdown.map((row) => (
              <li key={row.category} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span>{row.label}</span>
                <span className="font-semibold tabular-nums">
                  {formatExpenseAmount(row.amount, currency)}
                  <span className="ml-2 text-xs font-medium text-gray-400">{row.percent}%</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {report?.production.some((row) => row.harvested || row.sold) ? (
        <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:px-5">
            <h2 className="text-base font-bold">📦 Production</h2>
          </div>
          <div className="grid grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700">
            <Kpi label="Harvested" value={formatUnitBreakdown(report.production, 'harvested')} />
            <Kpi label="Sold" value={formatUnitBreakdown(report.production, 'sold')} />
            <Kpi label="Remaining" value={formatUnitBreakdown(report.production, 'remaining')} />
          </div>
        </div>
      ) : null}

      {report?.insights.length ? (
        <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:px-5">
            <h2 className="text-base font-bold">💡 Farm insights</h2>
          </div>
          <ul className="space-y-2 px-4 py-3 md:px-5">
            {report.insights.map((item) => (
              <li key={item.id} className="rounded-xl bg-emerald-50/70 px-3 py-2 text-sm text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100">
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 px-1 text-sm">
        <Link href={farmPath('/dashboard/harvests/sales/add')} className="font-semibold text-primary-600">
          + Record sale
        </Link>
        <Link href={farmPath('/dashboard/finances/expense')} className="font-semibold text-primary-600">
          + Add expense
        </Link>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'profit' | 'loss' }) {
  return (
    <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-0.5 text-lg font-bold tabular-nums md:text-xl ${
          tone === 'loss' ? 'text-rose-700' : tone === 'profit' ? 'text-emerald-700' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyCard({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body?: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center dark:border-gray-600">
      <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
      {body ? <p className="mt-1 text-sm text-gray-500">{body}</p> : null}
      <Link href={actionHref} className="btn btn-primary mt-4 inline-flex min-h-11 items-center justify-center">
        {actionLabel}
      </Link>
    </div>
  );
}
