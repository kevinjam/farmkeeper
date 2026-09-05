'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { formatExpenseAmount } from '@/lib/expenses';
import { formatUnitBreakdown } from '@/lib/harvest';
import { formatUnitRate, statusTone, type CropProfitRow, type ProfitabilityReport } from '@/lib/profitability';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { hasFeatureAccess } from '@/lib/features';

export default function CropProfitabilityPanel({ farmId, cropId }: { farmId: string; cropId: string }) {
  const { farmPath } = useFarmPaths(farmId);
  const { features, unlockAllFeatures } = useSubscriptionContext();
  const canUse = hasFeatureAccess(features, 'finances', unlockAllFeatures);
  const [crop, setCrop] = useState<CropProfitRow | null>(null);
  const [currency, setCurrency] = useState('UGX');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!canUse || !farmId || !cropId) {
      setLoading(false);
      return;
    }
    const response = await apiClient.getProfitability(farmId, { period: 'this_year', cropId });
    if (response.success) {
      const report = response.data as ProfitabilityReport;
      setCurrency(report.currency || 'UGX');
      setCrop(report.crops.find((row) => row.cropId === cropId) || report.crops[0] || null);
    }
    setLoading(false);
  }, [canUse, farmId, cropId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canUse) return null;
  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;

  if (!crop) {
    return (
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="px-4 py-5 md:px-5">
          <h2 className="text-base font-bold">📊 Profitability</h2>
          <p className="mt-2 text-sm text-gray-500">Record expenses and sales for this crop to see profit.</p>
        </div>
      </div>
    );
  }

  const tone = statusTone(crop.status);
  const unit = crop.unit || crop.byUnit[0]?.unit || 'kg';

  return (
    <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:px-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">📊 Profitability</h2>
          <p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${tone.className}`}>
            {tone.emoji} {crop.statusLabel}
          </p>
        </div>
        <Link href={farmPath(`/dashboard/profitability?cropId=${cropId}`)} className="text-sm font-semibold text-primary-600">
          Details
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">
        <Stat label="Revenue" value={formatExpenseAmount(crop.revenue, currency)} />
        <Stat label="Expenses" value={formatExpenseAmount(crop.expenses, currency)} />
        <Stat label="Profit" value={formatExpenseAmount(crop.profit, currency)} emphasize={crop.profit < 0 ? 'loss' : 'profit'} />
        <Stat label="Profit margin" value={crop.marginLabel} />
      </div>
      <div className="px-4 py-3 md:px-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Production</h3>
        <p className="mt-1 text-sm">Harvested: {formatUnitBreakdown(crop.byUnit, 'harvested')}</p>
        <p className="text-sm">Sold: {formatUnitBreakdown(crop.byUnit, 'sold')}</p>
        <p className="text-sm">Remaining: {formatUnitBreakdown(crop.remainingStock, 'remaining')}</p>
      </div>
      {crop.costPerUnit != null || crop.revenuePerUnit != null || crop.profitPerUnit != null ? (
        <div className="border-t border-gray-100 px-4 py-3 md:px-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Per {unit}</h3>
          <div className="mt-1 grid grid-cols-1 gap-1 text-sm sm:grid-cols-3">
            {crop.costPerUnit != null ? <p>Cost: {formatUnitRate(crop.costPerUnit, unit, currency)}</p> : null}
            {crop.revenuePerUnit != null ? <p>Revenue: {formatUnitRate(crop.revenuePerUnit, unit, currency)}</p> : null}
            {crop.profitPerUnit != null ? <p>Profit: {formatUnitRate(crop.profitPerUnit, unit, currency)}</p> : null}
          </div>
        </div>
      ) : null}
      {crop.breakEvenLabel ? (
        <p className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600 md:px-5">{crop.breakEvenLabel}</p>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: 'profit' | 'loss';
}) {
  return (
    <div className="bg-white px-4 py-3 dark:bg-gray-800">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-0.5 text-base font-bold tabular-nums ${
          emphasize === 'loss' ? 'text-rose-700' : emphasize === 'profit' ? 'text-emerald-700' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}
