'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, Loader2, X, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { EXPENSE_CATEGORY_MAP } from '@/lib/financeMappings';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import {
  RECEIPT_ACCEPT,
  formatReceiptSize,
  validateReceiptFile,
} from '@/lib/receiptUpload';

const inputClass =
  'mt-1.5 block w-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white max-md:min-h-12 max-md:rounded-xl max-md:px-3.5 max-md:text-base md:rounded-lg md:py-2 md:pl-3 md:pr-3 md:text-sm [font-size:16px]';
const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold';
const sectionTitleClass =
  'text-lg font-semibold text-gray-900 dark:text-white max-md:text-base max-md:font-bold';

export default function AddExpensePage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Feed');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!receiptFile || !receiptFile.type.startsWith('image/')) {
      setReceiptPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(receiptFile);
    setReceiptPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [receiptFile]);

  const handleReceiptSelect = (file: File | null) => {
    if (!file) return;
    const validationError = validateReceiptFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setReceiptFile(file);
  };

  const clearReceipt = () => {
    setReceiptFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const categoryLabel = formData.get('category') as string;
      const category = EXPENSE_CATEGORY_MAP[categoryLabel] || 'other';
      const amount = parseFloat(formData.get('amount') as string);
      const vendor = (formData.get('vendor') as string)?.trim();
      const feedQuantity = formData.get('feedQuantity') as string;

      let attachmentUrls: string[] | undefined;
      if (receiptFile) {
        setSubmitPhase('uploading');
        const uploadResponse = await apiClient.uploadReceipt(farmId, receiptFile);
        if (!uploadResponse.success || !uploadResponse.data?.url) {
          throw new Error(uploadResponse.error || 'Failed to upload receipt');
        }
        attachmentUrls = [uploadResponse.data.url];
      }

      setSubmitPhase('saving');
      const response = await apiClient.createFinancialTransaction(farmId, {
        type: 'expense',
        category,
        amount,
        currency: 'UGX',
        description: formData.get('description') as string,
        date: formData.get('expenseDate') as string,
        ...(vendor && { reference: vendor }),
        ...(attachmentUrls && { attachments: attachmentUrls }),
        metadata: {
          ...(feedQuantity && { quantity: parseFloat(feedQuantity) }),
          ...(vendor && { notes: `Vendor: ${vendor}` }),
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to add expense');
      }

      router.push(farmPath('/dashboard/finances'));
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmitPhase('idle');
    }
  };

  const submitLabel =
    submitPhase === 'uploading'
      ? 'Uploading receipt…'
      : submitPhase === 'saving'
        ? 'Saving…'
        : 'Add expense';

  return (
    <div className="mx-auto max-w-4xl max-md:max-w-full md:px-4 md:py-8 lg:px-8 max-md:px-0 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 dark:border-gray-700 max-md:border-gray-200/80 max-md:bg-gradient-to-br max-md:from-rose-500/10 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-rose-500/10 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex max-md:items-start max-md:gap-3 md:block">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 md:hidden">
              <Receipt className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white max-md:text-lg max-md:leading-tight">
                Add expense
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-md:mt-0.5 max-md:text-[13px] max-md:leading-snug">
                Track farm spending in one place.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 max-md:mx-4">
              {error}
            </div>
          )}
          <div className="space-y-6 p-6 max-md:space-y-5 max-md:p-4">
            <div className="max-md:rounded-2xl max-md:border max-md:border-rose-200/50 max-md:bg-rose-50/40 max-md:p-3.5 dark:max-md:border-rose-900/25 dark:max-md:bg-rose-950/15">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div>
                  <label htmlFor="expenseDate" className={labelClass}>
                    Date of expense
                  </label>
                  <input
                    type="date"
                    name="expenseDate"
                    id="expenseDate"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="category" className={labelClass}>
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className={inputClass}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    value={selectedCategory}
                  >
                    <option>Feed</option>
                    <option>Medication & Vaccines</option>
                    <option>Bedding</option>
                    <option>Utilities (Water/Electricity)</option>
                    <option>Labor & Salaries</option>
                    <option>Equipment Purchase</option>
                    <option>Equipment Maintenance</option>
                    <option>Marketing & Packaging</option>
                    <option>Transportation</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <input
                type="text"
                name="description"
                id="description"
                required
                placeholder="e.g. 10 bags of Broiler Finisher feed"
                className={inputClass}
              />
            </div>

            {selectedCategory === 'Feed' && (
              <div className="rounded-xl border border-primary-200/60 bg-primary-50/40 p-4 dark:border-primary-900/30 dark:bg-primary-950/20 md:p-5">
                <p className={`${sectionTitleClass} text-base`}>Feed details</p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 md:gap-6">
                  <div>
                    <label htmlFor="feedQuantity" className={labelClass}>
                      Quantity of feed (kg)
                    </label>
                    <input
                      type="number"
                      name="feedQuantity"
                      id="feedQuantity"
                      step="0.1"
                      min="0"
                      placeholder="e.g. 50"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:p-4 dark:max-md:border-gray-700/60">
              <h3 className={sectionTitleClass}>Amount &amp; vendor</h3>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div>
                  <label htmlFor="amount" className={labelClass}>
                    Amount (UGX) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    required
                    min="0"
                    placeholder="e.g. 150000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="vendor" className={labelClass}>
                    Vendor / supplier (optional)
                  </label>
                  <input
                    type="text"
                    name="vendor"
                    id="vendor"
                    placeholder="e.g. Kazi Farms"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Attach receipt (optional)</label>
              <div
                className="mt-1.5 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 px-4 py-6 dark:border-gray-600 dark:bg-gray-900/30 md:rounded-lg md:px-6 md:py-8"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleReceiptSelect(file);
                }}
              >
                {receiptFile ? (
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      {receiptPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="h-20 w-20 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                          <FileText className="h-10 w-10 text-rose-500" />
                        </div>
                      )}
                      <div className="min-w-0 text-left">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {receiptFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatReceiptSize(receiptFile.size)}
                        </p>
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                          Ready to upload when you save
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearReceipt}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Receipt className="mx-auto h-10 w-10 text-gray-400 md:h-12 md:w-12" strokeWidth={1.25} />
                    <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-md font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
                      >
                        Upload a file
                      </button>
                      <span className="hidden sm:inline">or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, WebP, or PDF up to 10MB — stored securely on Cloudinary
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept={RECEIPT_ACCEPT}
                  className="sr-only"
                  onChange={(e) => handleReceiptSelect(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-row justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-lg border border-transparent bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? submitLabel : 'Add expense'}
            </button>
          </div>

          <div className="md:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[25] flex gap-3 border-t border-gray-200/90 bg-white/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
            <button
              type="button"
              onClick={() => router.back()}
              className="min-h-12 min-w-[5.5rem] shrink-0 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white shadow-md shadow-primary-600/25 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {submitLabel}
                </>
              ) : (
                <>
                  <Receipt className="h-5 w-5" />
                  Add expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
