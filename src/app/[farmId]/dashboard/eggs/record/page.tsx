'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Egg, Loader2 } from 'lucide-react';

export default function RecordEggsPage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId } = params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log('New Egg Collection Data:', data);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    router.push(`/${farmId}/dashboard/eggs`);
  };

  const inputClass =
    'mt-1.5 block w-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white max-md:min-h-12 max-md:rounded-xl max-md:px-3.5 max-md:text-base md:rounded-md md:py-2 md:pl-3 md:pr-3 md:text-sm [font-size:16px]';
  const labelClass =
    'block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold';
  const sectionTitleClass =
    'text-lg font-semibold text-gray-900 dark:text-white max-md:text-base max-md:font-bold';

  return (
    <div className="mx-auto max-w-4xl max-md:max-w-full max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 max-md:border-gray-200/80 max-md:bg-gradient-to-br max-md:from-amber-500/10 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-amber-500/10 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex max-md:items-start max-md:gap-3 md:block">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 md:hidden">
              <Egg className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white max-md:text-lg max-md:leading-tight">
                Record Egg Collection
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-md:mt-0.5 max-md:text-[13px] max-md:leading-snug">
                Log eggs collected for a specific day — quick and easy.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div className="space-y-6 p-6 max-md:space-y-5 max-md:p-4">
            {/* Collection Date — hero field on mobile */}
            <div className="max-md:rounded-2xl max-md:border max-md:border-amber-200/60 max-md:bg-amber-50/40 max-md:p-3.5 dark:max-md:border-amber-900/30 dark:max-md:bg-amber-950/20">
              <label htmlFor="collectionDate" className={labelClass}>
                Date of collection
              </label>
              <input
                type="date"
                name="collectionDate"
                id="collectionDate"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>

            {/* Flock Details */}
            <div className="border-t border-gray-200 pt-6 dark:border-gray-700 max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:bg-gray-50/80 max-md:p-4 max-md:pt-4 dark:max-md:border-gray-700/80 dark:max-md:bg-gray-900/40 max-md:border-t-0 max-md:pt-4">
              <h3 className={sectionTitleClass}>Flock details for today</h3>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
                <div>
                  <label htmlFor="house" className={labelClass}>
                    House / batch
                  </label>
                  <select id="house" name="house" required className={inputClass}>
                    <option>House A</option>
                    <option>House B</option>
                    <option>House C</option>
                    <option>Free Range Batch 1</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="chickenCount" className={labelClass}>
                    Number of birds
                  </label>
                  <input type="number" name="chickenCount" id="chickenCount" min="0" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="mortality" className={labelClass}>
                    Mortality count
                  </label>
                  <input
                    type="number"
                    name="mortality"
                    id="mortality"
                    defaultValue="0"
                    min="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="foodConsumed" className={labelClass}>
                    Food consumed (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="foodConsumed"
                    id="foodConsumed"
                    min="0"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 max-md:gap-4">
              <div>
                <label htmlFor="quantity" className={labelClass}>
                  Total eggs collected <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  required
                  min="0"
                  placeholder="e.g. 450"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="damaged" className={labelClass}>
                  Broken or damaged eggs
                </label>
                <input
                  type="number"
                  name="damaged"
                  id="damaged"
                  min="0"
                  defaultValue="0"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Size distribution */}
            <div className="max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:p-4 dark:max-md:border-gray-700/80">
              <h3 className={sectionTitleClass}>Size distribution (optional)</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                <div>
                  <label htmlFor="size_xl" className="block text-xs font-medium text-gray-500 dark:text-gray-400 max-md:text-[11px]">
                    Extra large
                  </label>
                  <input type="number" name="size_xl" id="size_xl" min="0" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="size_l" className="block text-xs font-medium text-gray-500 dark:text-gray-400 max-md:text-[11px]">
                    Large
                  </label>
                  <input type="number" name="size_l" id="size_l" min="0" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="size_m" className="block text-xs font-medium text-gray-500 dark:text-gray-400 max-md:text-[11px]">
                    Medium
                  </label>
                  <input type="number" name="size_m" id="size_m" min="0" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="size_s" className="block text-xs font-medium text-gray-500 dark:text-gray-400 max-md:text-[11px]">
                    Small
                  </label>
                  <input type="number" name="size_s" id="size_s" min="0" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className={labelClass}>
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className={`${inputClass} max-md:min-h-[6.5rem]`}
                placeholder="e.g. First collection from Batch B..."
              />
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex flex-row justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Record collection'}
            </button>
          </div>

          {/* Mobile sticky actions — above dashboard tab bar */}
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
                  Saving…
                </>
              ) : (
                <>
                  <Egg className="h-5 w-5" />
                  Record collection
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
