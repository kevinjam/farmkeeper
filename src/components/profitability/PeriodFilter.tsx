'use client';

import { PROFIT_PERIODS, type ProfitPeriod } from '@/lib/profitability';

export default function PeriodFilter({
  period,
  startDate,
  endDate,
  onPeriod,
  onStartDate,
  onEndDate,
}: {
  period: ProfitPeriod;
  startDate: string;
  endDate: string;
  onPeriod: (value: ProfitPeriod) => void;
  onStartDate: (value: string) => void;
  onEndDate: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PROFIT_PERIODS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onPeriod(item.value)}
            className={`min-h-11 rounded-xl px-3 text-sm font-semibold ${
              period === item.value
                ? 'bg-emerald-600 text-white'
                : 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {period === 'custom' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            From
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm max-md:min-h-12 dark:border-gray-600 dark:bg-gray-700"
            />
          </label>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            To
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm max-md:min-h-12 dark:border-gray-600 dark:bg-gray-700"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
