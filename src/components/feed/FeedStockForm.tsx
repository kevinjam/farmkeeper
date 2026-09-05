'use client';

import { Loader2, Wheat } from 'lucide-react';
import { FEED_UNITS, STOCK_TYPES, type FeedFormData } from '@/lib/feed';

const inputClass =
  'mt-1.5 block w-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white max-md:min-h-12 max-md:rounded-xl max-md:px-3.5 max-md:text-base md:rounded-lg md:py-2 md:pl-3 md:pr-3 md:text-sm [font-size:16px]';
const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold';
const sectionTitleClass =
  'text-lg font-semibold text-gray-900 dark:text-white max-md:text-base max-md:font-bold';

type FeedStockFormProps = {
  formData: FeedFormData;
  onChange: (next: FeedFormData) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string;
  submitLabel: string;
  submitIcon?: boolean;
};

export default function FeedStockForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  submitLabel,
  submitIcon = true,
}: FeedStockFormProps) {
  const set = <K extends keyof FeedFormData>(key: K, value: FeedFormData[K]) => {
    onChange({ ...formData, [key]: value });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-6 p-6 max-md:space-y-5 max-md:p-4">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:bg-gray-50/80 max-md:p-4 dark:max-md:border-gray-700/60 dark:max-md:bg-gray-900/40">
          <h3 className={sectionTitleClass}>Stock details</h3>
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <div>
              <label htmlFor="stockType" className={labelClass}>
                Feed type
              </label>
              <select
                id="stockType"
                value={formData.stockType}
                onChange={(event) => set('stockType', event.target.value as FeedFormData['stockType'])}
                className={inputClass}
                required
              >
                {STOCK_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="feedName" className={labelClass}>
                Name
              </label>
              <input
                id="feedName"
                type="text"
                value={formData.name}
                onChange={(event) => set('name', event.target.value)}
                className={inputClass}
                placeholder="e.g. Layers mash"
                required
              />
            </div>
            <div>
              <label htmlFor="quantity" className={labelClass}>
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="0"
                step="0.1"
                value={formData.quantity}
                onChange={(event) => set('quantity', parseFloat(event.target.value) || 0)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="unit" className={labelClass}>
                Unit
              </label>
              <select
                id="unit"
                value={formData.unit}
                onChange={(event) => set('unit', event.target.value as FeedFormData['unit'])}
                className={inputClass}
              >
                {FEED_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="minimumThreshold" className={labelClass}>
                Low-stock threshold
              </label>
              <input
                id="minimumThreshold"
                type="number"
                min="0"
                step="0.1"
                value={formData.minimumThreshold}
                onChange={(event) => set('minimumThreshold', parseFloat(event.target.value) || 0)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="supplier" className={labelClass}>
                Supplier (optional)
              </label>
              <input
                id="supplier"
                type="text"
                value={formData.supplier}
                onChange={(event) => set('supplier', event.target.value)}
                className={inputClass}
                placeholder="Where you bought it"
              />
            </div>
          </div>
        </div>

        <div className="max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:p-4 dark:max-md:border-gray-700/60">
          <h3 className={sectionTitleClass}>Purchase</h3>
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <div>
              <label htmlFor="purchaseDate" className={labelClass}>
                Purchase date
              </label>
              <input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(event) => set('purchaseDate', event.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="expiryDate" className={labelClass}>
                Expiry date (optional)
              </label>
              <input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(event) => set('expiryDate', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="costPerUnit" className={labelClass}>
                Cost per unit (optional)
              </label>
              <input
                id="costPerUnit"
                type="number"
                min="0"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(event) => set('costPerUnit', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="totalCost" className={labelClass}>
                Total cost (optional)
              </label>
              <input
                id="totalCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.totalCost}
                onChange={(event) => set('totalCost', event.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="feedNotes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="feedNotes"
            rows={3}
            value={formData.notes}
            onChange={(event) => set('notes', event.target.value)}
            className={`${inputClass} max-md:min-h-[6.5rem]`}
            placeholder="Bag size, storage, or anything else to remember"
          />
        </div>
      </div>

      <div className="hidden flex-row justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50 md:flex">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-lg border border-transparent bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>

      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[25] flex gap-3 border-t border-gray-200/90 bg-white/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 md:hidden">
        <button
          type="button"
          onClick={onCancel}
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
              {submitIcon ? <Wheat className="h-5 w-5" /> : null}
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
