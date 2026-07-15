'use client';

import { useState, FormEvent } from 'react';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api';

interface EggCollectionFormProps {
  farmId: string;
}

const inputClass =
  'mt-1 block w-full min-h-11 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:min-h-0 md:rounded-md md:py-2 md:text-sm';

export default function EggCollectionForm({ farmId }: EggCollectionFormProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [quantity, setQuantity] = useState('');
  const [chickens, setChickens] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!date || !quantity || !chickens) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const response = await apiClient.createEggCollection(farmId, {
        date,
        quantity: parseInt(quantity),
        chickens: parseInt(chickens),
        notes,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to save egg collection record');
      }

      setQuantity('');
      setNotes('');
      setSuccess('Collection saved!');

      window.dispatchEvent(new CustomEvent('refresh-egg-collections'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-md:-mx-0 max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:p-0 max-md:shadow-none md:rounded-lg md:border md:border-gray-200/80 md:bg-white md:p-6 md:shadow dark:md:border-gray-700 dark:md:bg-gray-800">
      <h2 className="text-base font-bold text-gray-900 dark:text-white md:mb-4 md:text-xl md:font-semibold">
        Log collection
      </h2>

      <form onSubmit={handleSubmit} className="mt-3 md:mt-0">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" role="alert">
            {success}
          </div>
        )}

        <div className="space-y-4 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-gray-700 dark:text-gray-300 md:text-sm md:font-medium">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:contents">
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-gray-700 dark:text-gray-300 md:text-sm md:font-medium">
                Eggs *
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={inputClass}
                placeholder="0"
                inputMode="numeric"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-semibold text-gray-700 dark:text-gray-300 md:text-sm md:font-medium">
                Hens *
              </label>
              <input
                type="number"
                min="1"
                value={chickens}
                onChange={(e) => setChickens(e.target.value)}
                className={inputClass}
                placeholder="0"
                inputMode="numeric"
                required
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-[13px] font-semibold text-gray-700 dark:text-gray-300 md:text-sm md:font-medium">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Optional notes"
          />
        </div>

        <div className="mt-4 md:flex md:justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-4 text-sm font-semibold text-white shadow-md shadow-amber-500/25 active:scale-[0.98] disabled:opacity-50 md:min-h-0 md:w-auto md:rounded-md md:from-amber-500 md:to-amber-500 md:shadow-sm md:hover:bg-amber-600"
          >
            {isSubmitting ? 'Saving…' : 'Save collection'}
          </button>
        </div>
      </form>
    </div>
  );
}
