'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CloudSun, Lock, ShoppingBag, Sprout, Wallet } from 'lucide-react';
import { OpenMeteoWeatherIcon } from '@/components/OpenMeteoWeatherIcon';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { hasFeatureAccess } from '@/lib/features';
import { formatCropTypeLabel, type CropRecord } from '@/lib/crops';
import { formatExpenseAmount, type ExpenseSummary } from '@/lib/expenses';
import { formatUnitBreakdown, type HarvestSummary } from '@/lib/harvest';

type WeatherNow = {
  temp_c: number;
  condition: { text: string };
  humidity?: number;
  weather_code?: number;
  location?: string;
  rainChance?: number;
};

function harvestLabel(days: number | null) {
  if (days === null) return 'Add a harvest date';
  if (days < 0) return 'Date has passed';
  if (days === 0) return 'Ready today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function nextHarvestCrop(crops: CropRecord[]) {
  const open = crops.filter(
    (crop) =>
      !crop.archived &&
      ['growing', 'planted', 'harvesting'].includes(String(crop.status || '').toLowerCase())
  );
  const dated = open
    .filter((crop) => crop.expectedHarvestDate)
    .sort(
      (a, b) =>
        new Date(a.expectedHarvestDate as string).getTime() -
        new Date(b.expectedHarvestDate as string).getTime()
    );
  return dated[0] || open[0] || null;
}

export default function DashboardTodayStrip({ farmId }: { farmId: string }) {
  const { farmPath } = useFarmPaths(farmId);
  const { features, unlockAllFeatures } = useSubscriptionContext();
  const canFinances = hasFeatureAccess(features, 'finances', unlockAllFeatures);

  const [weather, setWeather] = useState<WeatherNow | null>(null);
  const [crop, setCrop] = useState<CropRecord | null>(null);
  const [harvest, setHarvest] = useState<HarvestSummary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const [weatherRes, cropsRes, harvestRes, financeRes] = await Promise.all([
        apiClient.getWeather(farmId).catch(() => ({ success: false, data: null })),
        apiClient.getCrops(farmId).catch(() => ({ success: false, data: [] })),
        apiClient.getHarvestSummary(farmId).catch(() => ({ success: false, data: null })),
        canFinances
          ? apiClient.getFinancialSummary(farmId).catch(() => ({ success: false, data: null }))
          : Promise.resolve({ success: false, data: null }),
      ]);

      if (cancelled) return;

      if (weatherRes.success && weatherRes.data) {
        const data = weatherRes.data as {
          current?: { temp_c?: number; condition?: { text?: string }; humidity?: number };
          hourly?: { weather_code?: number }[];
          location?: { name?: string };
          forecast?: { forecastday?: { day?: { daily_chance_of_rain?: number } }[] };
        };
        setWeather({
          temp_c: Number(data.current?.temp_c ?? 0),
          condition: { text: data.current?.condition?.text || 'Weather' },
          humidity: data.current?.humidity,
          weather_code: data.hourly?.[0]?.weather_code,
          location: data.location?.name,
          rainChance: data.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain,
        });
      } else {
        setWeather(null);
      }

      const crops = (cropsRes.success ? cropsRes.data : []) as CropRecord[];
      setCrop(nextHarvestCrop(crops));
      setHarvest(harvestRes.success ? (harvestRes.data as HarvestSummary) : null);
      setExpenses(financeRes.success ? (financeRes.data as ExpenseSummary) : null);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [farmId, canFinances]);

  const days =
    crop?.daysUntilHarvest ??
    (crop?.expectedHarvestDate
      ? Math.round(
          (new Date(crop.expectedHarvestDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
            86400000
        )
      : null);

  const remaining = harvest?.harvestCount
    ? formatUnitBreakdown(harvest.byUnit || [], 'remaining')
    : null;

  return (
    <section className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 max-md:rounded-2xl max-md:border max-md:border-gray-100/90 max-md:shadow-md dark:max-md:border-gray-700/80">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Today on the farm</h3>
          <p className="text-[11px] text-gray-500">Weather, harvest, produce, and spend</p>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 lg:grid-cols-4 lg:divide-y-0 dark:divide-gray-800">
        <Link
          href={farmPath('/dashboard/weather')}
          className="flex min-h-[6.5rem] flex-col justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/80"
        >
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            <CloudSun className="h-3.5 w-3.5" />
            Weather
          </p>
          {loading ? (
            <div className="mt-3 h-8 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
          ) : weather ? (
            <div className="mt-2 flex items-end gap-2">
              {typeof weather.weather_code === 'number' ? (
                <OpenMeteoWeatherIcon weatherCode={weather.weather_code} size={28} />
              ) : null}
              <div>
                <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                  {Math.round(weather.temp_c)}°
                </p>
                <p className="truncate text-xs text-gray-500">
                  {weather.condition.text}
                  {typeof weather.rainChance === 'number' ? ` · ${weather.rainChance}% rain` : ''}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm font-medium text-primary-600">Set farm location</p>
          )}
        </Link>

        <Link
          href={crop ? farmPath(`/dashboard/crops/${crop._id}`) : farmPath('/dashboard/crops')}
          className="flex min-h-[6.5rem] flex-col justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/80"
        >
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            <Sprout className="h-3.5 w-3.5" />
            Next harvest
          </p>
          {loading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
          ) : crop ? (
            <div className="mt-2">
              <p className="truncate text-lg font-bold text-gray-900 dark:text-white">
                {formatCropTypeLabel(crop.cropType)}
              </p>
              <p className="text-xs text-gray-500">{harvestLabel(days)}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm font-medium text-primary-600">Add a crop</p>
          )}
        </Link>

        <Link
          href={farmPath('/dashboard/harvests')}
          className="flex min-h-[6.5rem] flex-col justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/80"
        >
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            <ShoppingBag className="h-3.5 w-3.5" />
            Produce on hand
          </p>
          {loading ? (
            <div className="mt-3 h-8 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
          ) : remaining && remaining !== '0' ? (
            <div className="mt-2">
              <p className="truncate text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                {remaining}
              </p>
              <p className="text-xs text-gray-500">Still available to sell</p>
            </div>
          ) : (
            <p className="mt-3 text-sm font-medium text-primary-600">Record a harvest</p>
          )}
        </Link>

        <Link
          href={canFinances ? farmPath('/dashboard/finances') : farmPath('/dashboard/billing')}
          className="flex min-h-[6.5rem] flex-col justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/80"
        >
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            <Wallet className="h-3.5 w-3.5" />
            Spend this month
          </p>
          {loading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
          ) : !canFinances ? (
            <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-300">
              <Lock className="h-3.5 w-3.5" />
              Unlock finances
            </p>
          ) : (
            <div className="mt-2">
              <p className="truncate text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                {formatExpenseAmount(expenses?.thisMonthAmount || 0, expenses?.currency || 'UGX')}
              </p>
              <p className="text-xs text-gray-500">
                {expenses?.thisMonthCount || 0} {(expenses?.thisMonthCount || 0) === 1 ? 'expense' : 'expenses'}
              </p>
            </div>
          )}
        </Link>
      </div>
    </section>
  );
}
