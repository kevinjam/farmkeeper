/** Profitability display helpers. Totals come from the farm-scoped API. */

export const PROFIT_PERIODS = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'this_year', label: 'This year' },
  { value: 'last_year', label: 'Last year' },
  { value: 'all_time', label: 'All time' },
  { value: 'custom', label: 'Custom' },
] as const;

export type ProfitPeriod = (typeof PROFIT_PERIODS)[number]['value'];
export type ProfitStatus = 'profit' | 'breakeven' | 'loss';

export type ProfitUnitRow = {
  unit: string;
  harvested: number;
  sold: number;
  remaining: number;
};

export type CropProfitRow = {
  cropId: string;
  name: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number | null;
  marginLabel: string;
  status: ProfitStatus;
  statusLabel: string;
  byUnit: ProfitUnitRow[];
  remainingStock: ProfitUnitRow[];
  costPerUnit: number | null;
  revenuePerUnit: number | null;
  profitPerUnit: number | null;
  unit?: string | null;
  breakEvenQuantity: number | null;
  breakEvenUnit: string | null;
  breakEvenLabel: string | null;
  estimatedRemainingValue: number | null;
};

export type ProfitabilityReport = {
  currency: string;
  period: { key: ProfitPeriod; start: string | null; end: string | null; label: string };
  farm: {
    revenue: number;
    cropRevenue: number;
    otherIncome: number;
    expenses: number;
    cropExpenses: number;
    unattributedExpenses: number;
    profit: number;
    margin: number | null;
    marginLabel: string;
    status: ProfitStatus;
    statusLabel: string;
  };
  crops: CropProfitRow[];
  expenseBreakdown: Array<{ category: string; label: string; amount: number; percent: number }>;
  biggestExpense: { category: string; label: string; amount: number; percent: number } | null;
  monthly: Array<{ key: string; label: string; year: number; month: number; revenue: number; expenses: number; profit: number }>;
  production: ProfitUnitRow[];
  insights: Array<{ id: string; text: string }>;
  bestCrop: { cropId: string; name: string; profit: number } | null;
  worstCrop: { cropId: string; name: string; profit: number } | null;
  counts: { crops: number; hasRevenue: boolean; hasExpenses: boolean };
};

export function formatMarginLabel(margin: number | null | undefined) {
  if (margin == null || !Number.isFinite(margin)) return 'N/A';
  return `${Math.round(margin)}%`;
}

export function formatUnitRate(amount: number, unit: string, currency = 'UGX') {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const formatted = Number.isInteger(Math.round(safe * 100) / 100) && Number.isInteger(safe)
    ? Math.round(safe).toLocaleString('en-US')
    : (Math.round(safe * 100) / 100).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${String(currency || 'UGX').toUpperCase()} ${formatted}/${unit || 'unit'}`;
}

export function statusTone(status: ProfitStatus) {
  if (status === 'profit') {
    return {
      emoji: '🟢',
      className: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
    };
  }
  if (status === 'loss') {
    return {
      emoji: '🔴',
      className: 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
    };
  }
  return {
    emoji: '🟡',
    className: 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  };
}

export function profitSortValue(row: CropProfitRow, sort: 'profit' | 'revenue' | 'margin' | 'name') {
  if (sort === 'revenue') return row.revenue;
  if (sort === 'margin') return row.margin ?? -Infinity;
  if (sort === 'name') return row.name.toLowerCase();
  return row.profit;
}
