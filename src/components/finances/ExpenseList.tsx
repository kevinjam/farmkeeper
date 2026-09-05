'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Search, Trash2 } from 'lucide-react';
import ExpenseDeleteDialog from '@/components/finances/ExpenseDeleteDialog';
import { FINANCE_NOTICE, NoticeBanner } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import {
  EXPENSE_CATEGORIES,
  expenseCategoryLabel,
  expenseCropName,
  formatExpenseAmount,
  formatExpenseDate,
  type ExpenseRecord,
} from '@/lib/expenses';
import type { CropRecord } from '@/lib/crops';

function monthBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  return { startDate: iso(start), endDate: iso(end) };
}

export default function ExpenseList({
  farmId,
  initialCropId = '',
}: {
  farmId: string;
  initialCropId?: string;
}) {
  const { farmPath } = useFarmPaths(farmId);
  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [category, setCategory] = useState('all');
  const [cropId, setCropId] = useState(initialCropId || 'all');
  const [period, setPeriod] = useState<'month' | 'all'>('all');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<ExpenseRecord | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (initialCropId) setCropId(initialCropId);
  }, [initialCropId]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const range = period === 'month' ? monthBounds() : {};
    const response = await apiClient.getFinancialTransactions(farmId, {
      type: 'expense',
      category: category === 'all' ? undefined : category,
      cropId: cropId === 'all' ? undefined : cropId,
      ...range,
      limit: 100,
    });
    if (!response.success) {
      setError(response.error || 'Failed to load expenses');
      setRecords([]);
    } else {
      setError('');
      setRecords((response.data || []) as ExpenseRecord[]);
    }
    setLoading(false);
  }, [farmId, category, cropId, period]);

  useEffect(() => {
    void fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    const loadCrops = async () => {
      const response = await apiClient.getCrops(farmId, { archived: 'all' });
      if (response.success) setCrops((response.data || []) as CropRecord[]);
    };
    void loadCrops();
  }, [farmId]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((item) => {
      const crop = expenseCropName(item).toLowerCase();
      return (
        item.description.toLowerCase().includes(q) ||
        expenseCategoryLabel(item.category).toLowerCase().includes(q) ||
        crop.includes(q)
      );
    });
  }, [records, search]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsWorking(true);
    const response = await apiClient.deleteFinancialTransaction(farmId, pendingDelete._id);
    if (!response.success) {
      setError(response.error || 'Failed to delete expense');
      setIsWorking(false);
      return;
    }
    setNotice(FINANCE_NOTICE.expenseDeleted);
    setPendingDelete(null);
    setIsWorking(false);
    void fetchRecords();
  };

  const filterClass =
    'input w-full max-md:min-h-12 max-md:rounded-xl [font-size:16px] md:min-h-9 md:text-sm';

  return (
    <div>
      {notice ? (
        <div className="mb-3">
          <NoticeBanner tone="success" onDismiss={() => setNotice('')}>
            {notice}
          </NoticeBanner>
        </div>
      ) : null}
      {error ? (
        <div className="mb-3">
          <NoticeBanner tone="error" onDismiss={() => setError('')}>
            {error}
          </NoticeBanner>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <select aria-label="Date" className={filterClass} value={period} onChange={(e) => setPeriod(e.target.value as 'month' | 'all')}>
          <option value="all">All dates</option>
          <option value="month">This month</option>
        </select>
        <select aria-label="Category" className={filterClass} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {EXPENSE_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.emoji} {item.label}
            </option>
          ))}
        </select>
        <select aria-label="Crop" className={filterClass} value={cropId} onChange={(e) => setCropId(e.target.value)}>
          <option value="all">All crops</option>
          <option value="none">General farm</option>
          {crops.map((crop) => (
            <option key={crop._id} value={crop._id}>
              {crop.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description…"
            className={`${filterClass} pl-9`}
          />
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center dark:border-gray-600">
            <p className="font-semibold text-gray-900 dark:text-white">No expenses recorded yet.</p>
            <p className="mt-1 text-sm text-gray-500">
              Add your farm expenses to understand profitability.
            </p>
            <Link
              href={farmPath('/dashboard/finances/expense')}
              className="btn btn-primary mt-4 inline-flex min-h-11 items-center justify-center"
            >
              Add Expense
            </Link>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100 lg:hidden dark:divide-gray-700/80">
              {visible.map((item) => (
                <li key={item._id} className="py-3">
                  <p className="text-xs font-medium text-gray-500">{formatExpenseDate(item.date)}</p>
                  <div className="mt-1 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {expenseCategoryLabel(item.category)}
                      </p>
                      <p className="truncate text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {expenseCropName(item) || 'General farm expense'}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">
                      {formatExpenseAmount(item.amount, item.currency)}
                    </p>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Link
                      href={farmPath(`/dashboard/finances/expense/${item._id}`)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border text-sm font-semibold"
                    >
                      View
                    </Link>
                    <Link
                      href={farmPath(`/dashboard/finances/expense/${item._id}/edit`)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border text-sm font-semibold"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(item)}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {['Date', 'Category', 'Description', 'Crop', 'Amount', 'Actions'].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {visible.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                      <td className="whitespace-nowrap px-4 py-2.5 text-sm">{formatExpenseDate(item.date)}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-sm">{expenseCategoryLabel(item.category)}</td>
                      <td className="max-w-[16rem] truncate px-4 py-2.5 text-sm">{item.description}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">
                        {expenseCropName(item) || 'General farm'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-sm font-semibold tabular-nums text-rose-600">
                        {formatExpenseAmount(item.amount, item.currency)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        <div className="inline-flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-600">
                          <Link
                            href={farmPath(`/dashboard/finances/expense/${item._id}`)}
                            className="inline-flex h-8 items-center gap-1 px-2 text-xs font-semibold"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>
                          <Link
                            href={farmPath(`/dashboard/finances/expense/${item._id}/edit`)}
                            className="inline-flex h-8 items-center gap-1 px-2 text-xs font-semibold"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(item)}
                            className="inline-flex h-8 items-center gap-1 px-2 text-xs font-semibold text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {pendingDelete ? (
        <ExpenseDeleteDialog
          isWorking={isWorking}
          onClose={() => setPendingDelete(null)}
          onDelete={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
}
