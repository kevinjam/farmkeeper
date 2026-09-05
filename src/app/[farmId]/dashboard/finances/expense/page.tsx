'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt } from 'lucide-react';
import ExpenseForm from '@/components/finances/ExpenseForm';
import { FINANCE_NOTICE, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function AddExpensePage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [initialCropId, setInitialCropId] = useState('');
  const [currency, setCurrency] = useState('UGX');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInitialCropId(new URLSearchParams(window.location.search).get('cropId') || '');
    }
    if (!farmId) return;
    const load = async () => {
      const response = await apiClient.getFarmSettings(farmId);
      const next = response.data?.settings?.currency || response.data?.currency;
      if (typeof next === 'string' && next.trim()) setCurrency(next.trim().toUpperCase());
    };
    void load();
  }, [farmId]);

  return (
    <div className="mx-auto max-w-3xl max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
              <Receipt className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white md:text-2xl">Add Expense</h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Record money you have already spent.
              </p>
            </div>
          </div>
        </div>
        <ExpenseForm
          farmId={farmId}
          mode="add"
          initialCropId={initialCropId}
          currency={currency}
          onSuccess={() => {
            setFlashNotice(FINANCE_NOTICE.expenseAdded);
            router.push(farmPath('/dashboard/finances'));
          }}
        />
      </div>
    </div>
  );
}
