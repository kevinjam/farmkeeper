'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Receipt, X } from 'lucide-react';
import { NoticeBanner } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { cropActivityTypeLabel, formatCropActivityDate, type CropActivityRecord } from '@/lib/cropActivities';
import {
  EXPENSE_CATEGORIES,
  expenseFormInputClass,
  toDateInput,
  validateExpenseForm,
  type ExpenseRecord,
} from '@/lib/expenses';
import { RECEIPT_ACCEPT, formatReceiptSize, validateReceiptFile } from '@/lib/receiptUpload';
import type { CropRecord } from '@/lib/crops';

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold';
const errorClass = 'mt-1 text-sm text-red-600 dark:text-red-400';

function fieldClass(hasError: boolean) {
  return `${expenseFormInputClass} mt-1.5 ${
    hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500' : ''
  }`;
}

export default function ExpenseForm({
  farmId,
  mode,
  expense,
  initialCropId = '',
  currency = 'UGX',
  onSuccess,
}: {
  farmId: string;
  mode: 'add' | 'edit';
  expense?: ExpenseRecord | null;
  initialCropId?: string;
  currency?: string;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [category, setCategory] = useState(expense?.category || 'fertilizer');
  const [cropId, setCropId] = useState(initialCropId);
  const [activityId, setActivityId] = useState('');
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [activities, setActivities] = useState<CropActivityRecord[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!farmId) return;
    const load = async () => {
      const response = await apiClient.getCrops(farmId);
      if (response.success) setCrops((response.data || []) as CropRecord[]);
    };
    void load();
  }, [farmId]);

  useEffect(() => {
    if (expense) {
      setCategory(expense.category || 'other');
      const linkedCrop =
        typeof expense.cropId === 'object' && expense.cropId ? expense.cropId._id : String(expense.cropId || '');
      const linkedActivity =
        typeof expense.activityId === 'object' && expense.activityId
          ? expense.activityId._id
          : String(expense.activityId || '');
      setCropId(linkedCrop);
      setActivityId(linkedActivity);
    } else if (initialCropId) {
      setCropId(initialCropId);
    }
  }, [expense, initialCropId]);

  useEffect(() => {
    if (!farmId || !cropId) {
      setActivities([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingActivities(true);
      const response = await apiClient.getCropActivities(farmId, cropId);
      if (!cancelled && response.success) {
        setActivities((response.data || []) as CropActivityRecord[]);
      } else if (!cancelled) {
        setActivities([]);
      }
      setLoadingActivities(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [farmId, cropId]);

  useEffect(() => {
    if (!receiptFile || !receiptFile.type.startsWith('image/')) {
      setReceiptPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(receiptFile);
    setReceiptPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [receiptFile]);

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleReceiptSelect = (file: File | null) => {
    if (!file) return;
    const validationError = validateReceiptFile(file);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError('');
    setReceiptFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError('');

    const formData = new FormData(e.currentTarget);
    const amount = String(formData.get('amount') || '');
    const description = String(formData.get('description') || '');
    const date = String(formData.get('date') || '');
    const notes = String(formData.get('notes') || '').trim();
    const vendor = String(formData.get('vendor') || '').trim();

    const errors = validateExpenseForm({
      amount,
      category,
      description,
      date,
      cropId,
      activityId,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      let attachmentUrls = expense?.attachments;
      if (receiptFile) {
        setSubmitPhase('uploading');
        const uploadResponse = await apiClient.uploadReceipt(farmId, receiptFile);
        if (!uploadResponse.success || !uploadResponse.data?.url) {
          throw new Error(uploadResponse.error || 'Failed to upload receipt');
        }
        attachmentUrls = [uploadResponse.data.url];
      }

      setSubmitPhase('saving');
      const payload = {
        type: 'expense' as const,
        category,
        amount: Number(amount.replace(/,/g, '')),
        currency,
        description: description.trim(),
        date,
        cropId: cropId || null,
        activityId: cropId && activityId ? activityId : null,
        notes: notes || undefined,
        ...(vendor && { reference: vendor }),
        ...(attachmentUrls && { attachments: attachmentUrls }),
      };

      const response =
        mode === 'edit' && expense
          ? await apiClient.updateFinancialTransaction(farmId, expense._id, payload)
          : await apiClient.createFinancialTransaction(farmId, payload);

      if (!response.success) {
        throw new Error(response.error || 'Failed to save expense');
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving expense:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmitPhase('idle');
    }
  };

  const submitLabel =
    submitPhase === 'uploading' ? 'Uploading receipt…' : submitPhase === 'saving' ? 'Saving…' : mode === 'edit' ? 'Save Expense' : 'Save Expense';

  return (
    <form onSubmit={handleSubmit}>
      {formError ? (
        <div className="px-4 pt-4 md:px-6">
          <NoticeBanner tone="error">{formError}</NoticeBanner>
        </div>
      ) : null}

      <div className="space-y-5 p-4 md:space-y-6 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="amount" className={labelClass}>
              Amount ({currency})
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              defaultValue={expense?.amount ?? ''}
              placeholder="150000"
              required
              className={fieldClass(Boolean(fieldErrors.amount))}
              onChange={() => clearFieldError('amount')}
            />
            {fieldErrors.amount ? <p className={errorClass}>{fieldErrors.amount}</p> : null}
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                clearFieldError('category');
              }}
              className={fieldClass(Boolean(fieldErrors.category))}
              required
            >
              {EXPENSE_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.emoji} {item.label}
                </option>
              ))}
            </select>
            {fieldErrors.category ? <p className={errorClass}>{fieldErrors.category}</p> : null}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <input
              id="description"
              name="description"
              type="text"
              defaultValue={expense?.description || ''}
              placeholder="NPK fertilizer"
              required
              className={fieldClass(Boolean(fieldErrors.description))}
              onChange={() => clearFieldError('description')}
            />
            {fieldErrors.description ? <p className={errorClass}>{fieldErrors.description}</p> : null}
          </div>
          <div>
            <label htmlFor="date" className={labelClass}>
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={toDateInput(expense?.date) || new Date().toISOString().slice(0, 10)}
              required
              className={fieldClass(Boolean(fieldErrors.date))}
              onChange={() => clearFieldError('date')}
            />
            {fieldErrors.date ? <p className={errorClass}>{fieldErrors.date}</p> : null}
          </div>
          <div>
            <label htmlFor="cropId" className={labelClass}>
              Crop <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <select
              id="cropId"
              value={cropId}
              onChange={(e) => {
                setCropId(e.target.value);
                setActivityId('');
              }}
              className={fieldClass(false)}
            >
              <option value="">General farm expense</option>
              {crops.map((crop) => (
                <option key={crop._id} value={crop._id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="activityId" className={labelClass}>
              Activity <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <select
              id="activityId"
              value={activityId}
              disabled={!cropId || loadingActivities}
              onChange={(e) => setActivityId(e.target.value)}
              className={`${fieldClass(Boolean(fieldErrors.activityId))} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <option value="">{cropId ? 'No activity linked' : 'Select a crop first'}</option>
              {activities.map((activity) => (
                <option key={activity._id} value={activity._id}>
                  {cropActivityTypeLabel(activity.activityType)} — {formatCropActivityDate(activity.activityDate || activity.date)}
                </option>
              ))}
            </select>
            {fieldErrors.activityId ? <p className={errorClass}>{fieldErrors.activityId}</p> : null}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="notes" className={labelClass}>
              Notes <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={expense?.metadata?.notes || ''}
              placeholder="Applied to the north section."
              className={`${expenseFormInputClass} mt-1.5 max-md:min-h-[5rem]`}
            />
          </div>
        </div>

        <details className="rounded-xl border border-gray-200 dark:border-gray-700">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
            Vendor and receipt (optional)
          </summary>
          <div className="space-y-4 border-t border-gray-100 px-4 py-4 dark:border-gray-700">
            <div>
              <label htmlFor="vendor" className={labelClass}>
                Vendor / supplier
              </label>
              <input
                id="vendor"
                name="vendor"
                type="text"
                defaultValue={expense?.reference || ''}
                placeholder="e.g. Kazi Farms"
                className={`${expenseFormInputClass} mt-1.5`}
              />
            </div>
            <div>
              <p className={labelClass}>Receipt</p>
              <div className="mt-1.5 rounded-xl border-2 border-dashed border-gray-300 px-4 py-5 dark:border-gray-600">
                {receiptFile ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {receiptPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={receiptPreview} alt="" className="h-14 w-14 rounded-lg object-cover" />
                      ) : (
                        <FileText className="h-8 w-8 text-rose-500" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{receiptFile.name}</p>
                        <p className="text-xs text-gray-500">{formatReceiptSize(receiptFile.size)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setReceiptFile(null)} className="text-sm font-semibold text-gray-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-semibold text-primary-600"
                  >
                    {expense?.attachments?.[0] ? 'Replace receipt' : 'Upload a receipt'}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={RECEIPT_ACCEPT}
                  className="sr-only"
                  onChange={(e) => handleReceiptSelect(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className="hidden justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50 md:flex">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary inline-flex min-h-10 items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
          {isSubmitting ? submitLabel : mode === 'edit' ? 'Save changes' : 'Save Expense'}
        </button>
      </div>

      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[25] flex gap-3 border-t border-gray-200/90 bg-white/95 px-3 py-3 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 md:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-12 min-w-[5.5rem] rounded-xl border border-gray-300 px-4 text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {isSubmitting ? submitLabel : 'Save Expense'}
        </button>
      </div>
    </form>
  );
}
