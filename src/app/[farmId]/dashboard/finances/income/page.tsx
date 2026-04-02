'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Loader2 } from 'lucide-react';

const inputClass =
  'mt-1.5 block w-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white max-md:min-h-12 max-md:rounded-xl max-md:px-3.5 max-md:text-base md:rounded-lg md:py-2 md:pl-3 md:pr-3 md:text-sm [font-size:16px]';
const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold';
const sectionTitleClass =
  'text-lg font-semibold text-gray-900 dark:text-white max-md:text-base max-md:font-bold';

export default function RecordSalePage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId } = params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log('New Income Data:', data);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    router.push(`/${farmId}/dashboard/finances`);
  };

  return (
    <div className="mx-auto max-w-4xl max-md:max-w-full md:px-4 md:py-8 lg:px-8 max-md:px-0 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 dark:border-gray-700 max-md:border-gray-200/80 max-md:bg-gradient-to-br max-md:from-emerald-500/10 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-emerald-500/10 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex max-md:items-start max-md:gap-3 md:block">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 md:hidden">
              <TrendingUp className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white max-md:text-lg max-md:leading-tight">
                Record income / sale
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-md:mt-0.5 max-md:text-[13px] max-md:leading-snug">
                Log sales and other farm revenue.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6 max-md:space-y-5 max-md:p-4">
            <div className="max-md:rounded-2xl max-md:border max-md:border-emerald-200/50 max-md:bg-emerald-50/40 max-md:p-3.5 dark:max-md:border-emerald-900/25 dark:max-md:bg-emerald-950/15">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div>
                  <label htmlFor="saleDate" className={labelClass}>
                    Date of sale
                  </label>
                  <input
                    type="date"
                    name="saleDate"
                    id="saleDate"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="source" className={labelClass}>
                    Income source / product
                  </label>
                  <select id="source" name="source" required className={inputClass}>
                    <option>Eggs</option>
                    <option>Live Birds (Broilers)</option>
                    <option>Live Birds (Spent Layers)</option>
                    <option>Dressed/Processed Birds</option>
                    <option>Manure</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description of sale
              </label>
              <input
                type="text"
                name="description"
                id="description"
                required
                placeholder="e.g. 30 trays of Grade A eggs"
                className={inputClass}
              />
            </div>

            <div className="max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:p-4 dark:max-md:border-gray-700/60">
              <h3 className={sectionTitleClass}>Quantities &amp; pricing</h3>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
                <div>
                  <label htmlFor="quantity" className={labelClass}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min="0"
                    placeholder="e.g. 30"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="pricePerUnit" className={labelClass}>
                    Price per unit (UGX)
                  </label>
                  <input
                    type="number"
                    name="pricePerUnit"
                    id="pricePerUnit"
                    min="0"
                    placeholder="e.g. 10000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="totalAmount" className={labelClass}>
                    Total amount (UGX) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    id="totalAmount"
                    required
                    min="0"
                    placeholder="e.g. 300000"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <div>
                <label htmlFor="customer" className={labelClass}>
                  Customer / buyer (optional)
                </label>
                <input
                  type="text"
                  name="customer"
                  id="customer"
                  placeholder="e.g. Nakasero Market Vendor"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="paymentMethod" className={labelClass}>
                  Payment method
                </label>
                <select id="paymentMethod" name="paymentMethod" className={inputClass}>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Mobile Money</option>
                  <option>Credit</option>
                </select>
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
              {isSubmitting ? 'Saving...' : 'Record sale'}
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
                  Saving…
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5" />
                  Record sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
