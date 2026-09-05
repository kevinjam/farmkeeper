'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Receipt, Trash2 } from 'lucide-react';
import ExpenseDeleteDialog from '@/components/finances/ExpenseDeleteDialog';
import { FINANCE_NOTICE, NoticeBanner, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { cropActivityTypeLabel, formatCropActivityDate } from '@/lib/cropActivities';
import {
  expenseCategoryLabel,
  expenseCropName,
  expenseNotes,
  formatExpenseAmount,
  formatExpenseDate,
  type ExpenseRecord,
} from '@/lib/expenses';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function ExpenseDetailPage({
  params,
}: {
  params: { farmId: string; expenseId: string };
}) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [expense, setExpense] = useState<ExpenseRecord | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await apiClient.getFinancialTransaction(farmId, params.expenseId);
    if (!response.success || !response.data) {
      setError(response.error || 'Expense not found');
      setExpense(null);
    } else {
      setExpense(response.data as ExpenseRecord);
      setError('');
    }
    setLoading(false);
  }, [farmId, params.expenseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    setIsWorking(true);
    const response = await apiClient.deleteFinancialTransaction(farmId, params.expenseId);
    if (!response.success) {
      setError(response.error || 'Failed to delete expense');
      setIsWorking(false);
      return;
    }
    setFlashNotice(FINANCE_NOTICE.expenseDeleted);
    router.push(farmPath('/dashboard/finances'));
  };

  if (loading) {
    return (
      <div className="max-w-xl animate-pulse space-y-3 md:py-2">
        <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="max-w-xl md:py-2">
        <NoticeBanner tone="error">{error || 'Expense not found'}</NoticeBanner>
        <Link href={farmPath('/dashboard/finances')} className="mt-4 inline-block text-sm font-semibold text-primary-600">
          Back to finances
        </Link>
      </div>
    );
  }

  const activity =
    expense.activityId && typeof expense.activityId === 'object' ? expense.activityId : null;
  const cropName = expenseCropName(expense);

  return (
    <div className="mx-auto max-w-xl max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <Link href={farmPath('/dashboard/finances')} className="text-sm font-medium text-primary-600">
        ← Back to finances
      </Link>
      <div className="mt-3 overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border max-md:border-gray-200/90 dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {expenseCategoryLabel(expense.category)}
              </p>
              <h1 className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                {formatExpenseAmount(expense.amount, expense.currency)}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{formatExpenseDate(expense.date)}</p>
            </div>
          </div>
        </div>
        <dl className="divide-y divide-gray-100 px-4 py-2 dark:divide-gray-700/80 md:px-5">
          <div className="py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{expense.description}</dd>
          </div>
          <div className="py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Crop</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{cropName || 'General farm expense'}</dd>
          </div>
          {activity ? (
            <div className="py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Activity</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {cropActivityTypeLabel(activity.activityType)} — {formatCropActivityDate(activity.activityDate)}
              </dd>
            </div>
          ) : null}
          {expenseNotes(expense) ? (
            <div className="py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {expenseNotes(expense)}
              </dd>
            </div>
          ) : null}
        </dl>
        <div className="flex gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
          <Link
            href={farmPath(`/dashboard/finances/expense/${expense._id}/edit`)}
            className="btn btn-primary inline-flex min-h-11 flex-1 items-center justify-center gap-1.5"
          >
            <Pencil className="h-4 w-4" />
            Edit Expense
          </Link>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
      {deleteOpen ? (
        <ExpenseDeleteDialog
          isWorking={isWorking}
          onClose={() => setDeleteOpen(false)}
          onDelete={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
}
