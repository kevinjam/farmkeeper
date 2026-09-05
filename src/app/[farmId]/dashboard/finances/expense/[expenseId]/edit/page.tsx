'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ExpenseForm from '@/components/finances/ExpenseForm';
import { FINANCE_NOTICE, NoticeBanner, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import type { ExpenseRecord } from '@/lib/expenses';

export default function EditExpensePage({
  params,
}: {
  params: { farmId: string; expenseId: string };
}) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [expense, setExpense] = useState<ExpenseRecord | null>(null);
  const [currency, setCurrency] = useState('UGX');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [record, settings] = await Promise.all([
      apiClient.getFinancialTransaction(farmId, params.expenseId),
      apiClient.getFarmSettings(farmId),
    ]);
    const nextCurrency = settings.data?.settings?.currency;
    if (typeof nextCurrency === 'string' && nextCurrency.trim()) {
      setCurrency(nextCurrency.trim().toUpperCase());
    }
    if (!record.success || !record.data) {
      setError(record.error || 'Expense not found');
      setExpense(null);
    } else {
      setExpense(record.data as ExpenseRecord);
    }
    setLoading(false);
  }, [farmId, params.expenseId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />;
  }

  if (error || !expense) {
    return <NoticeBanner tone="error">{error || 'Expense not found'}</NoticeBanner>;
  }

  return (
    <div className="mx-auto max-w-3xl max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:px-6">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white md:text-2xl">Edit Expense</h1>
        </div>
        <ExpenseForm
          farmId={farmId}
          mode="edit"
          expense={expense}
          currency={expense.currency || currency}
          onSuccess={() => {
            setFlashNotice(FINANCE_NOTICE.expenseUpdated);
            router.push(farmPath(`/dashboard/finances/expense/${expense._id}`));
          }}
        />
      </div>
    </div>
  );
}
