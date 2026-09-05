'use client';

import Link from 'next/link';
import { formatExpenseAmount } from '@/lib/expenses';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { profitSortValue, statusTone, type CropProfitRow } from '@/lib/profitability';

export default function CropProfitTable({
  farmId,
  crops,
  currency,
  sort,
  onSort,
}: {
  farmId: string;
  crops: CropProfitRow[];
  currency: string;
  sort: 'profit' | 'revenue' | 'margin' | 'name';
  onSort: (value: 'profit' | 'revenue' | 'margin' | 'name') => void;
}) {
  const { farmPath } = useFarmPaths(farmId);
  const rows = [...crops].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    return Number(profitSortValue(b, sort)) - Number(profitSortValue(a, sort));
  });

  if (!rows.length) return null;

  return (
    <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 md:px-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">🌱 Profitability by crop</h2>
          <p className="text-xs text-gray-500">Crop sales minus expenses linked to that crop</p>
        </div>
        <label className="text-sm font-medium text-gray-600">
          Sort
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as typeof sort)}
            className="ml-2 rounded-xl border border-gray-300 px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="profit">Highest profit</option>
            <option value="revenue">Highest revenue</option>
            <option value="margin">Highest margin</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
      <ul className="divide-y divide-gray-100 lg:hidden dark:divide-gray-700/80">
        {rows.map((row) => {
          const tone = statusTone(row.status);
          return (
            <li key={row.cropId} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{row.name}</p>
                  <p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${tone.className}`}>
                    {tone.emoji} {row.status === 'profit' ? 'Profitable' : row.status === 'loss' ? 'Loss' : 'Break-even'}
                  </p>
                </div>
                <p className={`text-base font-bold tabular-nums ${row.profit < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {formatExpenseAmount(row.profit, currency)}
                </p>
              </div>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500">
                <div>
                  <dt>Revenue</dt>
                  <dd className="font-semibold text-gray-800 dark:text-gray-200">{formatExpenseAmount(row.revenue, currency)}</dd>
                </div>
                <div>
                  <dt>Expenses</dt>
                  <dd className="font-semibold text-gray-800 dark:text-gray-200">{formatExpenseAmount(row.expenses, currency)}</dd>
                </div>
                <div>
                  <dt>Margin</dt>
                  <dd className="font-semibold text-gray-800 dark:text-gray-200">{row.marginLabel}</dd>
                </div>
              </dl>
              <Link
                href={farmPath(`/dashboard/crops/${row.cropId}`)}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary-600"
              >
                View crop
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['Crop', 'Revenue', 'Expenses', 'Profit', 'Margin', ''].map((heading) => (
                <th key={heading} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {rows.map((row) => {
              const tone = statusTone(row.status);
              return (
                <tr key={row.cropId}>
                  <td className="px-4 py-2.5 text-sm font-semibold">
                    {row.name}
                    <span className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.className}`}>
                      {tone.emoji} {row.status === 'loss' ? 'Loss' : row.status === 'profit' ? 'Profitable' : 'Break-even'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-sm tabular-nums">{formatExpenseAmount(row.revenue, currency)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-sm tabular-nums">{formatExpenseAmount(row.expenses, currency)}</td>
                  <td className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold tabular-nums ${row.profit < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {formatExpenseAmount(row.profit, currency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-sm tabular-nums">{row.marginLabel}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={farmPath(`/dashboard/crops/${row.cropId}`)} className="text-sm font-semibold text-primary-600">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
