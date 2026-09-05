'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export const CROP_NOTICE = {
  added: 'Crop added successfully.',
  updated: 'Crop updated successfully.',
  deleted: 'Crop deleted successfully.',
  archived: 'Crop archived.',
  restored: 'Crop restored.',
  activityAdded: 'Activity recorded successfully.',
  activityUpdated: 'Activity updated successfully.',
  activityDeleted: 'Activity deleted successfully.',
} as const;

export const FINANCE_NOTICE = {
  expenseAdded: 'Expense recorded successfully.',
  expenseUpdated: 'Expense updated successfully.',
  expenseDeleted: 'Expense deleted successfully.',
} as const;

export const FEED_NOTICE = {
  added: 'Feed stock added.',
  updated: 'Feed stock updated.',
  deleted: 'Feed stock deleted.',
} as const;

export const HARVEST_NOTICE = {
  harvestAdded: 'Harvest recorded successfully.',
  harvestUpdated: 'Harvest updated successfully.',
  harvestDeleted: 'Harvest deleted successfully.',
  saleAdded: 'Sale recorded successfully.',
  saleUpdated: 'Sale updated successfully.',
  saleDeleted: 'Sale deleted successfully.',
} as const;

const FLASH_KEY = 'farmkeeper-flash-notice';

export function setFlashNotice(message: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(FLASH_KEY, message);
}

export function useFlashNotice() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem(FLASH_KEY);
    if (stored) {
      sessionStorage.removeItem(FLASH_KEY);
      setMessage(stored);
    }
  }, []);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  return { message, setMessage, clear: () => setMessage('') };
}

export function NoticeBanner({
  tone = 'success',
  children,
  onDismiss,
}: {
  tone?: 'success' | 'error';
  children: ReactNode;
  onDismiss?: () => void;
}) {
  const isSuccess = tone === 'success';
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
      }`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} />
      <p className="min-w-0 flex-1 font-medium">{children}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      ) : null}
    </div>
  );
}
