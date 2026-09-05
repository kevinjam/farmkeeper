'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatExpenseAmount } from '@/lib/expenses';
import type { ProfitabilityReport } from '@/lib/profitability';

export default function ProfitTrendChart({
  monthly,
  currency,
}: {
  monthly: ProfitabilityReport['monthly'];
  currency: string;
}) {
  if (!monthly.length) return null;
  const hasValues = monthly.some((row) => row.revenue || row.expenses);
  if (!hasValues) return null;

  return (
    <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:px-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Profit trend</h2>
        <p className="text-xs text-gray-500">Revenue, expenses, and profit by month</p>
      </div>
      <div className="px-2 py-3 md:px-4">
        <div className="h-[220px] md:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} width={48} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatExpenseAmount(Number(value) || 0, currency),
                  name,
                ]}
              />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#059669" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#e11d48" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
